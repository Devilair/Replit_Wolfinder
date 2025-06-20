import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, User, Building, Clock, CheckCircle, XCircle, Flag, MessageSquare, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewerRole: 'user' | 'professional';
  reviewerCategoryId?: number;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  professional: {
    id: number;
    businessName: string;
    category: string;
  };
  reviewer: {
    id: number;
    name: string;
    categoryName?: string;
  };
  proofFileName?: string;
  proofFilePath?: string;
  adminNotes?: string;
  moderatedBy?: {
    id: number;
    name: string;
  };
  moderatedAt?: string;
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
}

export default function AdminReviews() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch review statistics
  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ['/api/admin/reviews/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch reviews based on selected tab
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['/api/admin/reviews', selectedTab],
    enabled: !!selectedTab,
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Errore nell\'approvazione');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews/stats'] });
      toast({ title: 'Recensione approvata con successo' });
    },
    onError: () => {
      toast({ title: 'Errore nell\'approvazione', variant: 'destructive' });
    }
  });

  // Reject review mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: number; reason: string }) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Errore nel rifiuto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews/stats'] });
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedReview(null);
      toast({ title: 'Recensione rifiutata con successo' });
    },
    onError: () => {
      toast({ title: 'Errore nel rifiuto', variant: 'destructive' });
    }
  });

  const handleApprove = (reviewId: number) => {
    approveMutation.mutate(reviewId);
  };

  const handleReject = () => {
    if (!selectedReview || !rejectionReason.trim()) {
      toast({ title: 'Motivo del rifiuto obbligatorio', variant: 'destructive' });
      return;
    }
    rejectMutation.mutate({ reviewId: selectedReview.id, reason: rejectionReason });
  };

  const openRejectDialog = (review: Review) => {
    setSelectedReview(review);
    setShowRejectDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In attesa</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approvata</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rifiutata</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReviewerBadge = (review: Review) => {
    if (review.reviewerRole === 'professional') {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Building className="w-3 h-3 mr-1" />
          Professionista{review.reviewer.categoryName && ` - ${review.reviewer.categoryName}`}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <User className="w-3 h-3 mr-1" />
        Utente
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestione Recensioni</h1>
        <p className="text-gray-600">
          Modera le recensioni degli utenti e mantieni la qualità della piattaforma
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
              <CardDescription>Totale Recensioni</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-yellow-600">{stats.pending}</CardTitle>
              <CardDescription>In Attesa</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-green-600">{stats.approved}</CardTitle>
              <CardDescription>Approvate</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-red-600">{stats.rejected}</CardTitle>
              <CardDescription>Rifiutate</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-orange-600">{stats.flagged}</CardTitle>
              <CardDescription>Segnalate</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Review Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            In Attesa {stats?.pending ? `(${stats.pending})` : ''}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approvate {stats?.approved ? `(${stats.approved})` : ''}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rifiutate {stats?.rejected ? `(${stats.rejected})` : ''}
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Segnalate {stats?.flagged ? `(${stats.flagged})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna recensione trovata in questa categoria</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{review.title}</CardTitle>
                          {getStatusBadge(review.status)}
                          {getReviewerBadge(review)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            Per: <strong>{review.professional.businessName}</strong>
                          </span>
                          <span>
                            Da: <strong>
                              {review.isAnonymous ? 'Utente Anonimo' : review.reviewer.name}
                            </strong>
                          </span>
                          <span>
                            {format(new Date(review.createdAt), 'dd MMM yyyy - HH:mm', { locale: it })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{review.content}</p>
                    
                    {review.proofFileName && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Allegato:</p>
                        <p className="text-sm font-medium">{review.proofFileName}</p>
                      </div>
                    )}

                    {review.adminNotes && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">Note Admin:</p>
                        <p className="text-sm text-red-700">{review.adminNotes}</p>
                        {review.moderatedBy && review.moderatedAt && (
                          <p className="text-xs text-red-600 mt-1">
                            Moderata da {review.moderatedBy.name} il{' '}
                            {format(new Date(review.moderatedAt), 'dd MMM yyyy - HH:mm', { locale: it })}
                          </p>
                        )}
                      </div>
                    )}

                    {review.status === 'pending' && (
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Button
                          onClick={() => handleApprove(review.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approva
                        </Button>
                        <Button
                          onClick={() => openRejectDialog(review)}
                          disabled={rejectMutation.isPending}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rifiuta
                        </Button>
                        {review.proofFileName && (
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizza Allegato
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Review Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rifiuta Recensione</DialogTitle>
            <DialogDescription>
              Specifica il motivo del rifiuto. Questa informazione verrà registrata per scopi di audit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Motivo del rifiuto *</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Spiega perché questa recensione viene rifiutata..."
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? 'Rifiutando...' : 'Rifiuta Recensione'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}