import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CreateProfessionalDialog from "./CreateProfessionalDialog";
import { DocumentViewer } from "@/components/document-viewer";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Star,
  Plus,
  Calendar,
  AlertTriangle,
  Download,
  RefreshCw
} from "lucide-react";

interface Professional {
  id: number;
  businessName: string;
  email: string;
  phoneFixed: string;
  phoneMobile: string;
  address: string;
  city: string;
  category: {
    id: number;
    name: string;
  };
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rating: number;
  reviewCount: number;
  profileCompleteness: number;
  lastActivityAt: Date;
  createdAt: Date;
  isPremium: boolean;
  isClaimed: boolean;
  subscription?: {
    plan: {
      name: string;
    };
    status: string;
  };
}

export default function AdminProfessionals() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfessionals, setSelectedProfessionals] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: professionals, isLoading: professionalsLoading } = useQuery({
    queryKey: ['/api/admin/professionals', { 
      search: searchTerm, 
      status: filterStatus, 
      category: filterCategory, 
      sort: sortBy, 
      page: currentPage 
    }],
    refetchInterval: 30000
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories']
  });

  // Query for pending verification documents with notification count
  const { data: pendingDocuments } = useQuery({
    queryKey: ['/api/admin/verification-documents/pending'],
    refetchInterval: 30000
  });

  const pendingCount = pendingDocuments?.length || 0;

  const deleteProfessionalMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/professionals/${id}`),
    onSuccess: () => {
      toast({
        title: "Professionista eliminato",
        description: "Il professionista è stato rimosso con successo",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'eliminazione",
        variant: "destructive",
      });
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ action, ids }: { action: string; ids: number[] }) => 
      apiRequest("POST", "/api/admin/professionals/bulk-action", { action, ids }),
    onSuccess: () => {
      toast({
        title: "Azione completata",
        description: "L'azione è stata eseguita sui professionisti selezionati",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
      setSelectedProfessionals([]);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'esecuzione dell'azione",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Sei sicuro di voler eliminare questo professionista?")) {
      deleteProfessionalMutation.mutate(id);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedProfessionals.length === 0) {
      toast({
        title: "Selezione richiesta",
        description: "Seleziona almeno un professionista",
        variant: "destructive",
      });
      return;
    }
    
    bulkActionMutation.mutate({ action, ids: selectedProfessionals });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (professionalsLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const professionalsData = professionals as { data: Professional[]; total: number; pages: number };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Gestione Professionisti</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            {professionalsData?.total || 0} professionisti registrati
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Aggiungi Professionista</span>
            <span className="sm:hidden">Aggiungi</span>
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Aggiorna</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca professionisti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Stato verifica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="verified">Verificati</SelectItem>
                <SelectItem value="pending">In attesa</SelectItem>
                <SelectItem value="rejected">Rifiutati</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Più recenti</SelectItem>
                <SelectItem value="oldest">Meno recenti</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
                <SelectItem value="rating">Valutazione</SelectItem>
                <SelectItem value="reviews">Recensioni</SelectItem>
                <SelectItem value="completeness">Completezza profilo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProfessionals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedProfessionals.length} professionisti selezionati
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('verify')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verifica
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rifiuta
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Invia Email
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tutti i Professionisti</TabsTrigger>
          <TabsTrigger value="pending-verification" className="relative">
            Documenti da Verificare
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 h-5 min-w-5">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending-claims">Richieste Claim</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Professionals List */}
          <div className="space-y-3 sm:space-y-4">
            {professionalsData?.data?.map((professional) => (
              <Card key={professional.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedProfessionals.includes(professional.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProfessionals([...selectedProfessionals, professional.id]);
                          } else {
                            setSelectedProfessionals(selectedProfessionals.filter(id => id !== professional.id));
                          }
                        }}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {professional.businessName}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(professional.verificationStatus)} border-0 text-xs`}
                            >
                              {getStatusIcon(professional.verificationStatus)}
                              <span className="ml-1 capitalize">
                                {professional.verificationStatus}
                              </span>
                            </Badge>
                            {!professional.isClaimed && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Non reclamato
                              </Badge>
                            )}
                            {professional.isPremium && (
                              <Badge variant="default" className="bg-purple-100 text-purple-800 text-xs">
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="truncate">{professional.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{professional.phoneFixed}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{professional.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{formatDate(professional.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="font-medium">{professional.rating}</span>
                            <span className="text-gray-500">({professional.reviewCount} recensioni)</span>
                          </div>
                          <div className="text-gray-600">
                            Profilo completato al <span className="font-medium">{professional.profileCompleteness}%</span>
                          </div>
                          <div className="text-gray-600">
                            Categoria: <span className="font-medium">{professional.category?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/admin/professionals/${professional.id}`)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="h-3 w-3 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Visualizza</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/admin/professionals/${professional.id}/edit`)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="h-3 w-3 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Modifica</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(professional.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="h-3 w-3 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Elimina</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {professionalsData?.pages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Pagina {currentPage} di {professionalsData.pages}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Precedente
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={currentPage === professionalsData.pages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Successiva
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending-verification" className="space-y-4">
          <PendingDocumentsVerification />
        </TabsContent>

        <TabsContent value="pending-claims" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            Funzionalità in sviluppo
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create Professional Dialog */}
      <CreateProfessionalDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

// Component for pending document verification
function PendingDocumentsVerification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for pending verification documents
  const { data: pendingDocuments, isLoading } = useQuery({
    queryKey: ['/api/admin/verification-documents/pending'],
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  // Mutation for approving/rejecting documents
  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, action, notes }: { 
      documentId: number; 
      action: 'approve' | 'reject'; 
      notes?: string; 
    }) => {
      return apiRequest('POST', `/api/admin/verification-documents/${documentId}/verify`, { action, notes });
    },
    onSuccess: () => {
      toast({
        title: "Documento verificato",
        description: "Lo stato del documento è stato aggiornato",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-documents/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la verifica del documento",
        variant: "destructive",
      });
    },
  });

  const handleVerifyDocument = (documentId: number, action: 'approve' | 'reject', notes?: string) => {
    verifyDocumentMutation.mutate({ documentId, action, notes });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const documents = pendingDocuments || [];

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nessun documento in attesa
        </h3>
        <p className="text-gray-500">
          Tutti i documenti sono stati verificati
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Documenti in attesa di verifica ({documents.length})
        </h3>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          <Clock className="h-3 w-3 mr-1" />
          {documents.length} pendenti
        </Badge>
      </div>

      {documents.map((doc: any) => (
        <Card key={doc.id} className="border-l-4 border-l-yellow-400">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="font-semibold text-gray-900">
                    {doc.professional?.businessName}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {doc.documentType}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Email:</span> {doc.professional?.email}
                  </div>
                  <div>
                    <span className="font-medium">Città:</span> {doc.professional?.city}
                  </div>
                  <div>
                    <span className="font-medium">Categoria:</span> {doc.professional?.category?.name}
                  </div>
                  <div>
                    <span className="font-medium">Caricato:</span> {new Date(doc.createdAt).toLocaleDateString('it-IT')}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="font-medium text-sm">File:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded flex items-center gap-2">
                    <span className="text-sm">{doc.originalFileName || doc.fileName}</span>
                    <span className="text-xs text-gray-500">
                      ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <DocumentViewer
                  fileName={doc.fileName}
                  originalFileName={doc.originalFileName}
                  fileSize={doc.fileSize}
                  documentId={doc.id}
                />
                
                <Button
                  size="sm"
                  onClick={() => handleVerifyDocument(doc.id, 'approve')}
                  disabled={verifyDocumentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approva
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const notes = prompt('Motivo del rifiuto (opzionale):');
                    handleVerifyDocument(doc.id, 'reject', notes || undefined);
                  }}
                  disabled={verifyDocumentMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rifiuta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}