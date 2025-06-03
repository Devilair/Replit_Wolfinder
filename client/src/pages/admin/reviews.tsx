import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  AlertTriangle,
  FileText,
  User,
  MessageSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function AdminReviews() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  const { data: reviews = [] as any[], isLoading } = useQuery({
    queryKey: ["/api/admin/reviews"],
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: number; verified: boolean }) => {
      return apiRequest(`/api/admin/reviews/${id}/verify`, "PATCH", { verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({
        title: "Successo",
        description: "Stato della recensione aggiornato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dello stato della recensione",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/reviews/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({
        title: "Successo",
        description: "Recensione eliminata con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della recensione",
        variant: "destructive",
      });
    },
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Recensioni</h1>
          <p className="text-gray-600 mt-2">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestione Recensioni</h1>
        <p className="text-gray-600 mt-2">Modera e gestisci tutte le recensioni della piattaforma</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
          <CardDescription>Filtra le recensioni per stato di verifica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Stato recensione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le recensioni</SelectItem>
                <SelectItem value="pending">In attesa di verifica</SelectItem>
                <SelectItem value="verified">Verificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recensioni ({reviews.length})</CardTitle>
          <CardDescription>
            Elenco delle recensioni con opzioni di moderazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utente</TableHead>
                <TableHead>Professionista</TableHead>
                <TableHead>Valutazione</TableHead>
                <TableHead>Titolo</TableHead>
                <TableHead>Contenuto</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review: any) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.user?.name || review.user?.username}</div>
                      <div className="text-sm text-gray-500">{review.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{review.professional?.businessName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium">{review.rating}/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-32 truncate font-medium">{review.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-48 truncate text-sm text-gray-600">
                      {review.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.isVerified ? "default" : "secondary"}>
                      {review.isVerified ? "Verificata" : "In attesa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString('it-IT')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!review.isVerified ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyMutation.mutate({ id: review.id, verified: true })}
                          disabled={verifyMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyMutation.mutate({ id: review.id, verified: false })}
                          disabled={verifyMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(review.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {reviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessuna recensione trovata
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}