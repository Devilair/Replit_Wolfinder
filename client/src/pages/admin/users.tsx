import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  UserCheck, 
  UserX, 
  Shield, 
  Star, 
  AlertTriangle,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "shared/schema";

// Types per la dashboard utenti
interface UserStats {
  users: {
    total_users: number;
    new_users_7d: number;
    active_users: number;
    verified_emails: number;
    professionals: number;
  };
  reports: {
    pending_reports: number;
    critical_reports: number;
  };
}

interface UserDetails {
  stats: {
    totalReviews: number;
    totalFavorites: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface UsersResponse {
  users: (User & { reviewsCount: number; reportsCount: number })[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function UsersPage() {
  const { toast } = useToast();
  
  // Stati per filtri e ricerca
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(User & { reviewsCount: number; reportsCount: number }) | null>(null);
  
  // Stati per filtri avanzati
  const [reviewsMin, setReviewsMin] = useState("");
  const [reviewsMax, setReviewsMax] = useState("");
  const [registeredAfter, setRegisteredAfter] = useState("");
  const [registeredBefore, setRegisteredBefore] = useState("");
  const [hasReports, setHasReports] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const limit = 10;

  // Query per utenti base o avanzata
  const endpoint = showAdvancedFilters ? "/api/admin/users/advanced" : "/api/admin/users";
  
  const { data: response, isLoading } = useQuery<UsersResponse>({
    queryKey: [endpoint, { 
      search, 
      status: statusFilter, 
      role: roleFilter, 
      reviewsMin, 
      reviewsMax, 
      registeredAfter, 
      registeredBefore, 
      hasReports,
      limit, 
      offset: page * limit 
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });
      
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter);
      
      // Filtri avanzati
      if (showAdvancedFilters) {
        if (reviewsMin) params.append('reviewsMin', reviewsMin);
        if (reviewsMax) params.append('reviewsMax', reviewsMax);
        if (registeredAfter) params.append('registeredAfter', registeredAfter);
        if (registeredBefore) params.append('registeredBefore', registeredBefore);
        if (hasReports) params.append('hasReports', 'true');
      }

      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return response.json();
    },
  });

  // Query per statistiche
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/admin/user-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/user-stats", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      return response.json();
    },
  });

  // Query per dettagli utente selezionato
  const { data: userDetails } = useQuery<UserDetails>({
    queryKey: ["/api/admin/users", selectedUser?.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${selectedUser?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      return response.json();
    },
    enabled: !!selectedUser?.id,
  });

  const users = response?.users || [];
  const pagination = response?.pagination || { total: 0, limit: 10, offset: 0, hasMore: false };

  // Mutations per azioni admin
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      return apiRequest(`/api/admin/users/${id}/status`, "PUT", { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/advanced"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-stats"] });
      toast({
        title: "Successo",
        description: "Stato utente aggiornato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento stato utente",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number; name?: string; email?: string; role?: string; accountStatus?: string }) => {
      return apiRequest(`/api/admin/users/${data.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/advanced"] });
      setSelectedUser(null);
      toast({
        title: "Successo",
        description: "Utente aggiornato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento utente",
        variant: "destructive",
      });
    },
  });

  const anonymizeUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/users/${id}/anonymize`, "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/advanced"] });
      setSelectedUser(null);
      toast({
        title: "Successo",
        description: "Utente anonimizzato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'anonimizzazione utente",
        variant: "destructive",
      });
    },
  });

  const exportUsersMutation = useMutation({
    mutationFn: async (params: { role?: string; status?: string; registeredAfter?: string }) => {
      const searchParams = new URLSearchParams();
      if (params.role && params.role !== 'all') searchParams.append('role', params.role);
      if (params.status && params.status !== 'all') searchParams.append('status', params.status);
      if (params.registeredAfter) searchParams.append('registeredAfter', params.registeredAfter);

      const response = await fetch(`/api/admin/users/export?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export users');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'utenti_wolfinder.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Export completato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'export utenti",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'professional':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Attivo</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Sospeso</Badge>;
      case 'pending':
        return <Badge variant="outline">In Attesa</Badge>;
      default:
        return <Badge variant="secondary">Non Definito</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Utenti</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="animate-pulse bg-gray-300 h-4 w-20 rounded"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-4 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse bg-gray-300 h-8 w-16 rounded mb-2"></div>
                <div className="animate-pulse bg-gray-300 h-3 w-24 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Statistiche Reali */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Utenti</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportUsersMutation.mutate({ role: roleFilter, status: statusFilter })}
            disabled={exportUsersMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta CSV
          </Button>
        </div>
      </div>

      {/* Statistiche Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.users?.new_users_7d || 0} ultimi 7 giorni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.users?.verified_emails || 0} email verificate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professionisti</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.professionals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Account professionali attivi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segnalazioni</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reports?.pending_reports || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.reports?.critical_reports || 0} critiche
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sistema Filtri Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri e Ricerca Avanzata</CardTitle>
          <CardDescription>
            Sistema completo di filtri per gestione utenti enterprise-grade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Stato Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli Stati</SelectItem>
                <SelectItem value="active">Attivo</SelectItem>
                <SelectItem value="suspended">Sospeso</SelectItem>
                <SelectItem value="pending">In Attesa</SelectItem>
                <SelectItem value="deleted">Eliminato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i Ruoli</SelectItem>
                <SelectItem value="user">Utente</SelectItem>
                <SelectItem value="professional">Professionista</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtri Avanzati
            </Button>
          </div>

          {showAdvancedFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reviewsMin">Recensioni Min</Label>
                  <Input
                    id="reviewsMin"
                    type="number"
                    placeholder="0"
                    value={reviewsMin}
                    onChange={(e) => setReviewsMin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewsMax">Recensioni Max</Label>
                  <Input
                    id="reviewsMax"
                    type="number"
                    placeholder="100"
                    value={reviewsMax}
                    onChange={(e) => setReviewsMax(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registeredAfter">Registrato Dopo</Label>
                  <Input
                    id="registeredAfter"
                    type="date"
                    value={registeredAfter}
                    onChange={(e) => setRegisteredAfter(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasReports"
                  checked={hasReports}
                  onChange={(e) => setHasReports(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="hasReports">Solo utenti con segnalazioni</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabella Utenti Enterprise */}
      <Card>
        <CardHeader>
          <CardTitle>Gestione Utenti</CardTitle>
          <CardDescription>
            {pagination.total > 0 
              ? `Mostrando ${users.length} di ${pagination.total} utenti` 
              : `${users.length} utenti trovati`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utente</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Attività</TableHead>
                <TableHead>Ultimo Login</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.isEmailVerified && (
                          <Badge variant="outline" className="text-xs">Email verificata</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.accountStatus)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{user.reviewsCount} recensioni</span>
                      </div>
                      {user.reportsCount && user.reportsCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {user.reportsCount} segnalazioni
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString('it-IT')
                        : 'Mai'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Gestione Utente: {user.name}</DialogTitle>
                            <DialogDescription>
                              Dashboard completa per amministrazione utente
                            </DialogDescription>
                          </DialogHeader>
                          <UserDetailsModal 
                            user={user} 
                            userDetails={userDetails}
                            onUpdateStatus={(status, reason) => 
                              updateUserStatusMutation.mutate({ id: user.id, status, reason })
                            }
                            onUpdateUser={(data) => 
                              updateUserMutation.mutate({ id: user.id, ...data })
                            }
                            onAnonymize={() => anonymizeUserMutation.mutate(user.id)}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      {user.accountStatus === 'active' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserX className="h-4 w-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Sospendi Utente</DialogTitle>
                              <DialogDescription>
                                Inserisci il motivo della sospensione per {user.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Motivo della sospensione (richiesto)..."
                                value={suspendReason}
                                onChange={(e) => setSuspendReason(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="destructive"
                                onClick={() => {
                                  updateUserStatusMutation.mutate({ 
                                    id: user.id, 
                                    status: 'suspended', 
                                    reason: suspendReason 
                                  });
                                  setSuspendReason("");
                                }}
                                disabled={!suspendReason.trim()}
                              >
                                Sospendi Account
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      {user.accountStatus === 'suspended' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateUserStatusMutation.mutate({ 
                            id: user.id, 
                            status: 'active' 
                          })}
                        >
                          <UserCheck className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginazione */}
          {pagination.total > limit && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Pagina {page + 1} di {Math.ceil(pagination.total / limit)} • 
                Totale: {pagination.total} utenti
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Precedente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasMore}
                >
                  Successiva
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente modale dettagliata per gestione utente
function UserDetailsModal({ 
  user, 
  userDetails, 
  onUpdateStatus, 
  onUpdateUser, 
  onAnonymize 
}: {
  user: User & { reviewsCount: number; reportsCount: number };
  userDetails?: UserDetails;
  onUpdateStatus: (status: string, reason?: string) => void;
  onUpdateUser: (data: any) => void;
  onAnonymize: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'professional':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Attivo</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Sospeso</Badge>;
      case 'pending':
        return <Badge variant="outline">In Attesa</Badge>;
      default:
        return <Badge variant="secondary">Non Definito</Badge>;
    }
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Panoramica</TabsTrigger>
        <TabsTrigger value="activity">Attività</TabsTrigger>
        <TabsTrigger value="admin">Admin</TabsTrigger>
        <TabsTrigger value="security">Sicurezza</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Nome Completo</Label>
              {editMode ? (
                <Input 
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p className="font-medium">{user.name}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              {editMode ? (
                <Input 
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <p className="font-medium">{user.email}</p>
              )}
            </div>
            <div>
              <Label>Ruolo</Label>
              {editMode ? (
                <Select value={editData.role} onValueChange={(value) => setEditData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utente</SelectItem>
                    <SelectItem value="professional">Professionista</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className="font-medium capitalize">{user.role}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Stato Account</Label>
              {editMode ? (
                <Select value={editData.accountStatus} onValueChange={(value) => setEditData(prev => ({ ...prev, accountStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Attivo</SelectItem>
                    <SelectItem value="suspended">Sospeso</SelectItem>
                    <SelectItem value="pending">In Attesa</SelectItem>
                    <SelectItem value="deleted">Eliminato</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{getStatusBadge(user.accountStatus)}</div>
              )}
            </div>
            <div>
              <Label>Data Registrazione</Label>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('it-IT', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <Label>Email Verificata</Label>
              <Badge variant={user.isEmailVerified ? "default" : "destructive"}>
                {user.isEmailVerified ? "Verificata" : "Non Verificata"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4 border-t">
          {editMode ? (
            <>
              <Button onClick={() => {
                onUpdateUser(editData);
                setEditMode(false);
              }}>
                Salva Modifiche
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Annulla
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              Modifica Utente
            </Button>
          )}
        </div>
      </TabsContent>

      <TabsContent value="activity" className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{userDetails?.stats.totalReviews || 0}</div>
              <p className="text-xs text-muted-foreground">Recensioni Scritte</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{userDetails?.stats.totalFavorites || 0}</div>
              <p className="text-xs text-muted-foreground">Professionisti Preferiti</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{user.reportsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Segnalazioni Ricevute</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="font-medium mb-4">Cronologia Attività</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userDetails?.recentActivity?.length ? (
              userDetails.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nessuna attività registrata</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="admin" className="space-y-6">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Azioni Stato Account</h4>
            <div className="grid grid-cols-2 gap-3">
              {user.accountStatus !== 'active' && (
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => onUpdateStatus('active')}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Attiva Account
                </Button>
              )}
              {user.accountStatus !== 'suspended' && (
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => onUpdateStatus('suspended', 'Sospensione amministrativa')}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Sospendi Account
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium text-red-600 mb-2">Zona Pericolosa</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Azioni irreversibili che comportano la perdita permanente dei dati.
            </p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Anonimizza Utente (GDPR)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Conferma Anonimizzazione GDPR</DialogTitle>
                  <DialogDescription>
                    Questa operazione eliminerà permanentemente tutti i dati personali dell'utente 
                    in conformità al GDPR. L'azione è irreversibile.
                  </DialogDescription>
                </DialogHeader>
                <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2">Conseguenze dell'anonimizzazione:</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Nome sostituito con "Anonymized_[ID]"</li>
                    <li>• Email sostituita con "anonymized_[ID]@deleted.local"</li>
                    <li>• Recensioni mantenute ma anonimizzate</li>
                    <li>• Impossibile ripristinare i dati originali</li>
                  </ul>
                </div>
                <DialogFooter>
                  <Button variant="destructive" onClick={onAnonymize}>
                    Procedi con Anonimizzazione
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-4">Informazioni Sicurezza</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ultimo Login</Label>
                <p className="font-medium">
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleString('it-IT')
                    : 'Mai effettuato'
                  }
                </p>
              </div>
              <div>
                <Label>Account Verificato</Label>
                <Badge variant={user.isVerified ? "default" : "secondary"}>
                  {user.isVerified ? "Verificato" : "Non Verificato"}
                </Badge>
              </div>
            </div>
          </div>

          {user.reportsCount && user.reportsCount > 0 && (
            <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
              <h5 className="font-medium text-orange-800 mb-2">Segnalazioni Attive</h5>
              <p className="text-sm text-orange-700">
                Questo utente ha {user.reportsCount} segnalazioni in sospeso che richiedono moderazione.
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}