import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Eye, 
  Edit, 
  Ban, 
  CheckCircle, 
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  accountStatus: string;
  reviewsCount: number;
}

interface UserDetailsResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  accountStatus: string;
  reviews: Array<{
    id: number;
    title: string;
    content: string;
    rating: number;
    status: string;
    createdAt: string;
    professionalName: string;
    professionalId: number;
  }>;
  stats: {
    totalReviews: number;
    totalFavorites: number;
  };
}

interface UsersResponse {
  users: AdminUser[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const limit = 25;
  const offset = (currentPage - 1) * limit;

  // Fetch users with filters
  const { data: usersData, isLoading } = useQuery<UsersResponse>({
    queryKey: ['/api/admin/users', { search, statusFilter, roleFilter, limit, offset }],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      
      return fetch(`/api/admin/users?${params}`).then(res => res.json());
    }
  });

  // Fetch user details
  const { data: userDetails, isLoading: isLoadingDetails } = useQuery<UserDetailsResponse>({
    queryKey: ['/api/admin/users', selectedUser],
    queryFn: () => fetch(`/api/admin/users/${selectedUser}`).then(res => res.json()),
    enabled: !!selectedUser
  });

  // Suspend user mutation
  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) =>
      apiRequest(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        body: { reason }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utente sospeso",
        description: "L'account è stato sospeso con successo"
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile sospendere l'utente",
        variant: "destructive"
      });
    }
  });

  // Reactivate user mutation
  const reactivateMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest(`/api/admin/users/${userId}/reactivate`, {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utente riattivato",
        description: "L'account è stato riattivato con successo"
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile riattivare l'utente",
        variant: "destructive"
      });
    }
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: { name?: string; email?: string; role?: string } }) =>
      apiRequest(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utente aggiornato",
        description: "I dati dell'utente sono stati aggiornati"
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'utente",
        variant: "destructive"
      });
    }
  });

  const handleSuspendUser = (userId: number) => {
    const reason = prompt("Motivo della sospensione:");
    if (reason) {
      suspendMutation.mutate({ userId, reason });
    }
  };

  const handleReactivateUser = (userId: number) => {
    if (confirm("Sei sicuro di voler riattivare questo utente?")) {
      reactivateMutation.mutate(userId);
    }
  };

  const handleViewDetails = (userId: number) => {
    setSelectedUser(userId);
    setIsUserDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Utenti</h1>
      </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtri e Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stato account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="active">Attivi</SelectItem>
                <SelectItem value="suspended">Sospesi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i ruoli</SelectItem>
                <SelectItem value="user">Utenti</SelectItem>
                <SelectItem value="professional">Professionisti</SelectItem>
                <SelectItem value="admin">Amministratori</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setRoleFilter("all");
                setCurrentPage(1);
              }}
            >
              Reset Filtri
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiche */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{pagination.total}</div>
              <p className="text-sm text-gray-600">Utenti totali</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{users.filter(u => u.accountStatus === 'active').length}</div>
              <p className="text-sm text-gray-600">Utenti attivi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{users.filter(u => u.role === 'professional').length}</div>
              <p className="text-sm text-gray-600">Professionisti</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabella utenti */}
      <Card>
        <CardHeader>
          <CardTitle>Elenco Utenti</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Caricamento...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Recensioni</TableHead>
                    <TableHead>Registrato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.accountStatus)}>
                          {user.accountStatus === 'active' ? 'Attivo' : 'Sospeso'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.reviewsCount}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {user.accountStatus === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuspendUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReactivateUser(user.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginazione */}
              {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Mostrando {offset + 1}-{Math.min(offset + limit, pagination.total)} di {pagination.total} utenti
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Pagina {currentPage} di {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog dettagli utente */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettagli Utente</DialogTitle>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="text-center py-8">Caricamento dettagli...</div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Informazioni principali */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informazioni Generali</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome</label>
                      <p className="font-medium">{userDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p>{userDetails.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ruolo</label>
                      <Badge className={getRoleColor(userDetails.role)}>
                        {userDetails.role}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Stato Account</label>
                      <Badge className={getStatusColor(userDetails.accountStatus)}>
                        {userDetails.accountStatus === 'active' ? 'Attivo' : 'Sospeso'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiche</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Recensioni Scritte</label>
                      <p className="text-2xl font-bold">{userDetails.stats.totalReviews}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Professionisti Preferiti</label>
                      <p className="text-2xl font-bold">{userDetails.stats.totalFavorites}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registrato</label>
                      <p className="text-sm">{formatDate(userDetails.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ultimo Accesso</label>
                      <p className="text-sm">
                        {userDetails.lastLoginAt ? formatDate(userDetails.lastLoginAt) : 'Mai'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recensioni dell'utente */}
              {userDetails.reviews && userDetails.reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recensioni Scritte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userDetails.reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{review.title}</h4>
                              <p className="text-sm text-gray-600">
                                Per: <Link href={`/professionals/${review.professionalId}`} className="text-blue-600 hover:underline">
                                  {review.professionalName}
                                </Link>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">
                                {review.rating}/5 ⭐
                              </div>
                              <Badge variant={review.status === 'verified' ? 'default' : 'secondary'}>
                                {review.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{review.content}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}