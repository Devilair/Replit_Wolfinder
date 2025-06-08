import { useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfessionals, setSelectedProfessionals] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfessional, setNewProfessional] = useState({
    businessName: '',
    email: '',
    phoneFixed: '',
    phoneMobile: '',
    address: '',
    city: '',
    province: '',
    categoryId: '',
    description: '',
    website: ''
  });
  
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

  const createProfessionalMutation = useMutation({
    mutationFn: async (data: typeof newProfessional) => {
      return apiRequest("POST", "/api/admin/professionals", data);
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Professionista creato con successo",
      });
      setIsCreateDialogOpen(false);
      setNewProfessional({
        businessName: '',
        email: '',
        phoneFixed: '',
        phoneMobile: '',
        address: '',
        city: '',
        province: '',
        categoryId: '',
        description: '',
        website: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Errore nella creazione del professionista",
        variant: "destructive",
      });
    },
  });

  const verifyProfessionalMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: 'approved' | 'rejected'; notes?: string }) => {
      return apiRequest("PATCH", `/api/admin/professionals/${id}/verify`, { status, notes });
    },
    onSuccess: () => {
      toast({
        title: "Professionista aggiornato",
        description: "Lo stato di verifica è stato modificato con successo",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il professionista",
        variant: "destructive",
      });
    }
  });

  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/professionals/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Professionista eliminato",
        description: "Il professionista è stato rimosso dal sistema",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il professionista",
        variant: "destructive",
      });
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: string; ids: number[] }) => {
      return apiRequest("POST", "/api/admin/professionals/bulk-action", { action, ids });
    },
    onSuccess: () => {
      toast({
        title: "Azione completata",
        description: "L'azione è stata eseguita sui professionisti selezionati",
      });
      setSelectedProfessionals([]);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile eseguire l'azione richiesta",
        variant: "destructive",
      });
    }
  });

  const handleVerify = (id: number, status: 'approved' | 'rejected', notes?: string) => {
    verifyProfessionalMutation.mutate({ id, status, notes });
  };

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Professionisti</h1>
          <p className="text-gray-600 mt-2">
            {professionalsData?.total || 0} professionisti registrati
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Professionista
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cerca per nome, email o città..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="approved">Verificati</SelectItem>
                <SelectItem value="pending">In attesa</SelectItem>
                <SelectItem value="rejected">Rifiutati</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Più recenti</SelectItem>
                <SelectItem value="oldest">Più vecchi</SelectItem>
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

      {/* Professionals List */}
      <div className="space-y-4">
        {professionalsData?.data?.map((professional) => (
          <Card key={professional.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
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
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {professional.businessName}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(professional.verificationStatus)} border-0`}
                      >
                        {getStatusIcon(professional.verificationStatus)}
                        <span className="ml-1 capitalize">
                          {professional.verificationStatus}
                        </span>
                      </Badge>
                      {professional.isPremium && (
                        <Badge variant="default" className="bg-purple-100 text-purple-800">
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {professional.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {professional.phoneMobile || professional.phoneFixed || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {professional.city}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{professional.rating}/5</span>
                        <span className="text-gray-500">({professional.reviewCount} recensioni)</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Categoria:</span> {professional.category.name}
                      </div>
                      <div>
                        <span className="text-gray-500">Completezza:</span> {professional.profileCompleteness}%
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(professional.createdAt)}
                      </div>
                    </div>

                    {professional.subscription && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Piano {professional.subscription.plan.name} - {professional.subscription.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`/professional/${professional.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`/admin/professionals/${professional.id}/edit`, '_blank')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {professional.verificationStatus === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleVerify(professional.id, 'approved')}
                        disabled={verifyProfessionalMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleVerify(professional.id, 'rejected')}
                        disabled={verifyProfessionalMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(professional.id)}
                    disabled={deleteProfessionalMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {professionalsData && professionalsData.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Pagina {currentPage} di {professionalsData.pages}
              </span>
              <div className="flex gap-2">
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
    </div>
  );
}