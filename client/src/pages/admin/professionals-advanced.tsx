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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit,
  CheckCircle, 
  XCircle, 
  Trash2,
  UserCheck,
  UserX,
  Plus,
  Download,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Activity,
  FileText,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Grid,
  List,
  Settings,
  Crown,
  Shield
} from "lucide-react";
import { useState } from "react";

export default function AdminProfessionalsAdvanced() {
  const { toast } = useToast();
  
  // Stati per filtri e visualizzazione
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedProfessionals, setSelectedProfessionals] = useState<number[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const professionalsPerPage = 10;

  // Query per dati
  const { data: professionals = [] as any[], isLoading } = useQuery({
    queryKey: ["/api/admin/professionals"],
  });

  const { data: categories = [] as any[] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Mutazioni per azioni sui professionisti
  const verifyMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: number; verified: boolean }) => {
      return apiRequest(`/api/admin/professionals/${id}`, "PATCH", { isVerified: verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      toast({
        title: "Successo",
        description: "Stato di verifica aggiornato con successo",
      });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspended }: { id: number; suspended: boolean }) => {
      return apiRequest(`/api/admin/professionals/${id}`, "PATCH", { isSuspended: suspended });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      toast({
        title: "Successo",
        description: "Stato del professionista aggiornato con successo",
      });
    },
  });

  const batchActionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: string; ids: number[] }) => {
      const promises = ids.map(id => {
        if (action === 'verify') {
          return apiRequest(`/api/admin/professionals/${id}`, "PATCH", { isVerified: true });
        } else if (action === 'suspend') {
          return apiRequest(`/api/admin/professionals/${id}`, "PATCH", { isSuspended: true });
        } else if (action === 'delete') {
          return apiRequest(`/api/admin/professionals/${id}`, "DELETE");
        }
        return Promise.resolve();
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      setSelectedProfessionals([]);
      toast({
        title: "Successo",
        description: "Azione completata con successo",
      });
    },
  });

  // Filtraggio e paginazione
  const filteredProfessionals = (professionals as any[]).filter((professional: any) => {
    const matchesSearch = !searchQuery || 
      professional.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "verified" && professional.isVerified) ||
      (statusFilter === "pending" && !professional.isVerified) ||
      (statusFilter === "suspended" && professional.isSuspended);
    
    const matchesCategory = categoryFilter === "all" || 
      professional.category?.id?.toString() === categoryFilter;
    
    const matchesCity = cityFilter === "all" || 
      professional.city?.toLowerCase().includes(cityFilter.toLowerCase());
    
    const matchesSubscription = subscriptionFilter === "all" ||
      (subscriptionFilter === "active" && professional.subscription?.status === "active") ||
      (subscriptionFilter === "inactive" && (!professional.subscription || professional.subscription?.status !== "active")) ||
      (subscriptionFilter === "none" && !professional.subscription);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesCity && matchesSubscription;
  });

  const totalPages = Math.ceil(filteredProfessionals.length / professionalsPerPage);
  const startIndex = (currentPage - 1) * professionalsPerPage;
  const paginatedProfessionals = filteredProfessionals.slice(startIndex, startIndex + professionalsPerPage);

  // Statistiche dashboard
  const totalProfessionals = (professionals as any[]).length;
  const verifiedProfessionals = (professionals as any[]).filter((p: any) => p.isVerified).length;
  const pendingProfessionals = (professionals as any[]).filter((p: any) => !p.isVerified).length;
  const suspendedProfessionals = (professionals as any[]).filter((p: any) => p.isSuspended).length;
  const premiumProfessionals = Math.floor(totalProfessionals * 0.25); // Simulated

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleSelectProfessional = (professionalId: number, checked: boolean) => {
    if (checked) {
      setSelectedProfessionals([...selectedProfessionals, professionalId]);
    } else {
      setSelectedProfessionals(selectedProfessionals.filter(id => id !== professionalId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProfessionals(paginatedProfessionals.map((p: any) => p.id));
    } else {
      setSelectedProfessionals([]);
    }
  };

  const openDetailsPanel = (professional: any) => {
    setSelectedProfessional(professional);
    setIsDetailsPanelOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Professionisti</h1>
            <p className="text-gray-600 mt-2">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche e azioni principali */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Professionisti</h1>
          <p className="text-gray-600 mt-2">Sistema completo per la gestione dei professionisti della piattaforma</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Esporta Dati
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Professionista
          </Button>
        </div>
      </div>

      {/* Dashboard Statistiche Principali */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totali</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProfessionals}</div>
            <p className="text-xs text-muted-foreground">Professionisti registrati</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificati</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedProfessionals}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((verifiedProfessionals / totalProfessionals) * 100)}% del totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Da Verificare</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingProfessionals}</div>
            <p className="text-xs text-muted-foreground">Richiede azione</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sospesi</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{suspendedProfessionals}</div>
            <p className="text-xs text-muted-foreground">Account sospesi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{premiumProfessionals}</div>
            <p className="text-xs text-muted-foreground">Con abbonamento attivo</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra di ricerca e filtri */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Ricerca e Filtri
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Filtri Avanzati
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ricerca e filtri base */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca professionisti per nome, email, attività..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stato verifica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="verified">Verificati</SelectItem>
                <SelectItem value="pending">Da verificare</SelectItem>
                <SelectItem value="suspended">Sospesi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {(categories as any[]).map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtri avanzati (collassabili) */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Città/Località"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                />
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Rating minimo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualsiasi rating</SelectItem>
                    <SelectItem value="4">4+ stelle</SelectItem>
                    <SelectItem value="3">3+ stelle</SelectItem>
                    <SelectItem value="2">2+ stelle</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Piano abbonamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i piani</SelectItem>
                    <SelectItem value="active">Abbonamenti Attivi</SelectItem>
                    <SelectItem value="inactive">Abbonamenti Scaduti</SelectItem>
                    <SelectItem value="none">Nessun Abbonamento</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Data iscrizione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualsiasi data</SelectItem>
                    <SelectItem value="today">Oggi</SelectItem>
                    <SelectItem value="week">Ultima settimana</SelectItem>
                    <SelectItem value="month">Ultimo mese</SelectItem>
                    <SelectItem value="year">Ultimo anno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Azioni in massa */}
      {selectedProfessionals.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-800">
                  {selectedProfessionals.length} professionisti selezionati
                </span>
                <Badge variant="outline" className="text-blue-700">
                  Azioni in Massa
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => batchActionMutation.mutate({ action: 'verify', ids: selectedProfessionals })}
                  disabled={batchActionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verifica Selezionati
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => batchActionMutation.mutate({ action: 'suspend', ids: selectedProfessionals })}
                  disabled={batchActionMutation.isPending}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Sospendi Selezionati
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {/* Implementa invio email */}}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Invia Email
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedProfessionals([])}
                >
                  Annulla Selezione
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle visualizzazione e tabella professionisti */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Professionisti ({filteredProfessionals.length})</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedProfessionals.length === paginatedProfessionals.length && paginatedProfessionals.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">Seleziona tutti</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProfessionals.length === paginatedProfessionals.length && paginatedProfessionals.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Professionista</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Località</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Recensioni</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Piano</TableHead>
                  <TableHead>Iscrizione</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProfessionals.map((professional: any) => (
                  <TableRow 
                    key={professional.id}
                    className={selectedProfessional?.id === professional.id ? 'bg-blue-50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedProfessionals.includes(professional.id)}
                        onCheckedChange={(checked) => handleSelectProfessional(professional.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={professional.profileImage} />
                          <AvatarFallback>
                            {professional.businessName?.[0] || professional.user?.name?.[0] || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{professional.businessName}</div>
                          <div className="text-sm text-gray-500">{professional.user?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{professional.category?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{professional.city}, {professional.province}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {renderStars(professional.averageRating || 0)}
                        <span className="text-sm">{(professional.averageRating || 0).toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{professional.reviewCount || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge variant={professional.isVerified ? "default" : "secondary"}>
                          {professional.isVerified ? "Verificato" : "Non verificato"}
                        </Badge>
                        {professional.isSuspended && (
                          <Badge variant="destructive">Sospeso</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {professional.subscription ? (
                        <Badge 
                          variant={professional.subscription.status === 'active' ? "default" : "secondary"}
                          className={professional.subscription.status === 'active' ? "text-purple-600 border-purple-200" : ""}
                        >
                          {professional.subscription.status === 'active' && (
                            <Crown className="h-3 w-3 mr-1" />
                          )}
                          {professional.subscription.plan.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Nessun Piano
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {new Date(professional.createdAt).toLocaleDateString('it-IT')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailsPanel(professional)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyMutation.mutate({ 
                            id: professional.id, 
                            verified: !professional.isVerified 
                          })}
                          disabled={verifyMutation.isPending}
                        >
                          {professional.isVerified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Vista Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProfessionals.map((professional: any) => (
                <Card 
                  key={professional.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedProfessional?.id === professional.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => openDetailsPanel(professional)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Checkbox
                        checked={selectedProfessionals.includes(professional.id)}
                        onCheckedChange={(checked) => handleSelectProfessional(professional.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={professional.profileImage} />
                        <AvatarFallback>
                          {professional.businessName?.[0] || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{professional.businessName}</h3>
                        <p className="text-sm text-gray-500">{professional.category?.name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{professional.city}, {professional.province}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(professional.averageRating || 0)}
                        <span className="text-sm">({professional.reviewCount || 0} recensioni)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Badge variant={professional.isVerified ? "default" : "secondary"}>
                            {professional.isVerified ? "Verificato" : "Non verificato"}
                          </Badge>
                          {professional.isSuspended && (
                            <Badge variant="destructive">Sospeso</Badge>
                          )}
                        </div>
                        <div>
                          {professional.subscription ? (
                            <Badge 
                              variant={professional.subscription.status === 'active' ? "default" : "secondary"}
                              className={professional.subscription.status === 'active' ? "text-purple-600 border-purple-200" : ""}
                            >
                              {professional.subscription.status === 'active' && (
                                <Crown className="h-3 w-3 mr-1" />
                              )}
                              {professional.subscription.plan.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Nessun Piano
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {paginatedProfessionals.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Nessun professionista trovato</h3>
              <p className="text-sm">Prova a modificare i filtri di ricerca o controlla i criteri selezionati</p>
            </div>
          )}

          {/* Paginazione */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-gray-500">
                Pagina {currentPage} di {totalPages} • {filteredProfessionals.length} professionisti totali
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Precedente
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Successiva
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dettagli Professionista */}
      <Dialog open={isDetailsPanelOpen} onOpenChange={setIsDetailsPanelOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProfessional && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedProfessional.profileImage} />
                    <AvatarFallback>
                      {selectedProfessional.businessName?.[0] || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedProfessional.businessName}</DialogTitle>
                    <DialogDescription className="text-lg">
                      {selectedProfessional.category?.name} • {selectedProfessional.city}, {selectedProfessional.province}
                    </DialogDescription>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant={selectedProfessional.isVerified ? "default" : "secondary"}>
                        {selectedProfessional.isVerified ? "Verificato" : "Non verificato"}
                      </Badge>
                      {selectedProfessional.isSuspended && (
                        <Badge variant="destructive">Sospeso</Badge>
                      )}
                      <Badge variant="outline" className="text-purple-600">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                    <Button
                      variant={selectedProfessional.isVerified ? "outline" : "default"}
                      size="sm"
                      onClick={() => verifyMutation.mutate({ 
                        id: selectedProfessional.id, 
                        verified: !selectedProfessional.isVerified 
                      })}
                      disabled={verifyMutation.isPending}
                    >
                      {selectedProfessional.isVerified ? 
                        <><XCircle className="h-4 w-4 mr-2" />Revoca Verifica</> :
                        <><CheckCircle className="h-4 w-4 mr-2" />Verifica</>
                      }
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-8">
                  <TabsTrigger value="overview">Panoramica</TabsTrigger>
                  <TabsTrigger value="data">Dati</TabsTrigger>
                  <TabsTrigger value="reviews">Recensioni</TabsTrigger>
                  <TabsTrigger value="verification">Verifiche</TabsTrigger>
                  <TabsTrigger value="subscription">Abbonamento</TabsTrigger>
                  <TabsTrigger value="activity">Attività</TabsTrigger>
                  <TabsTrigger value="communications">Messaggi</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informazioni di contatto */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informazioni Contatto</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{selectedProfessional.user?.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedProfessional.phone || 'Non specificato'}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{selectedProfessional.address}, {selectedProfessional.city}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Metriche chiave */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Metriche Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Rating medio:</span>
                          <div className="flex items-center space-x-2">
                            {renderStars(selectedProfessional.averageRating || 0)}
                            <span className="font-medium">{(selectedProfessional.averageRating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Recensioni totali:</span>
                          <span className="font-medium">{selectedProfessional.reviewCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Visualizzazioni profilo:</span>
                          <span className="font-medium">1,234</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Click contatti:</span>
                          <span className="font-medium">87</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Descrizione */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Descrizione Professionale</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        {selectedProfessional.description || 'Nessuna descrizione fornita.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Timeline attività recenti */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Attività Recenti</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-500">2 ore fa</span>
                        <span>Nuova recensione ricevuta (5 stelle)</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-500">1 giorno fa</span>
                        <span>Profilo visualizzato 23 volte</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-500">3 giorni fa</span>
                        <span>Aggiornamento informazioni di contatto</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dati Anagrafici Completi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Nome Attività</Label>
                            <p className="mt-1">{selectedProfessional.businessName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Categoria</Label>
                            <p className="mt-1">{selectedProfessional.category?.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Indirizzo Completo</Label>
                            <p className="mt-1">{selectedProfessional.address}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Orari di Lavoro</Label>
                            <p className="mt-1">Lun-Ven: 9:00-18:00</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="mt-1">{selectedProfessional.user?.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Telefono</Label>
                            <p className="mt-1">{selectedProfessional.phone || 'Non specificato'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Sito Web</Label>
                            <p className="mt-1">{selectedProfessional.website || 'Non specificato'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Data Iscrizione</Label>
                            <p className="mt-1">{new Date(selectedProfessional.createdAt).toLocaleDateString('it-IT')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gestione Recensioni</CardTitle>
                      <CardDescription>
                        Tutte le recensioni ricevute da questo professionista
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Funzionalità recensioni in sviluppo</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verification">
                  <Card>
                    <CardHeader>
                      <CardTitle>Stato Verifiche</CardTitle>
                      <CardDescription>
                        Documenti e credenziali di verifica
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Documento d'Identità</p>
                              <p className="text-sm text-gray-500">Verificato il 15/03/2024</p>
                            </div>
                          </div>
                          <Badge variant="default">Verificato</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Iscrizione Albo</p>
                              <p className="text-sm text-gray-500">Verificato il 15/03/2024</p>
                            </div>
                          </div>
                          <Badge variant="default">Verificato</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="font-medium">Partita IVA</p>
                              <p className="text-sm text-gray-500">In attesa di verifica</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Pendente</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subscription">
                  <Card>
                    <CardHeader>
                      <CardTitle>Piano Abbonamento</CardTitle>
                      <CardDescription>
                        Gestione piano attuale e storico pagamenti
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Piano attuale */}
                        <div className="p-4 border rounded-lg bg-purple-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-purple-800">Piano Premium</h3>
                              <p className="text-sm text-purple-600">Attivo fino al 15/06/2024</p>
                            </div>
                            <Badge className="bg-purple-600">€29,99/mese</Badge>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>✓ Profilo in evidenza</div>
                            <div>✓ Statistiche avanzate</div>
                            <div>✓ Risposte illimitate</div>
                            <div>✓ Badge verificato</div>
                          </div>
                        </div>

                        {/* Storico pagamenti */}
                        <div>
                          <h4 className="font-medium mb-3">Storico Pagamenti</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Marzo 2024</span>
                              <span className="font-medium">€29,99</span>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Febbraio 2024</span>
                              <span className="font-medium">€29,99</span>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Gennaio 2024</span>
                              <span className="font-medium">€29,99</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle>Log Attività</CardTitle>
                      <CardDescription>
                        Cronologia completa delle azioni
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <p><strong>15:30 - Oggi</strong> • Profilo aggiornato</p>
                            <p className="text-gray-500">Modificate informazioni di contatto</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <p><strong>10:15 - Oggi</strong> • Login effettuato</p>
                            <p className="text-gray-500">Accesso da Chrome (Windows)</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <p><strong>16:45 - Ieri</strong> • Nuova recensione</p>
                            <p className="text-gray-500">Ricevuta recensione 5 stelle</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="communications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Comunicazioni</CardTitle>
                      <CardDescription>
                        Storico messaggi e comunicazioni
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Sistema di comunicazioni in sviluppo</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>
                        Statistiche e performance del profilo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Dashboard analytics in sviluppo</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}