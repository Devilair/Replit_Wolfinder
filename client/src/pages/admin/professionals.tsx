import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Shield, ShieldCheck, Edit, Trash2, Plus, Eye, MapPin, Phone, Mail } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProfessionalWithDetails, Category } from "@shared/schema";

const professionalSchema = z.object({
  userId: z.number().min(1, "Utente richiesto"),
  categoryId: z.number().min(1, "Categoria richiesta"),
  businessName: z.string().min(1, "Nome azienda richiesto"),
  description: z.string().min(10, "Descrizione di almeno 10 caratteri"),
  phone: z.string().optional(),
  email: z.string().email("Email non valida"),
  website: z.string().optional(),
  address: z.string().min(1, "Indirizzo richiesto"),
  city: z.string().min(1, "Città richiesta"),
  province: z.string().min(2, "Provincia richiesta"),
  postalCode: z.string().min(5, "CAP richiesto"),
  priceRangeMin: z.string().optional(),
  priceRangeMax: z.string().optional(),
  priceUnit: z.string().optional(),
});

export default function AdminProfessionals() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingProfessional, setEditingProfessional] = useState<ProfessionalWithDetails | null>(null);
  const { toast } = useToast();

  const { data: professionals, isLoading } = useQuery({
    queryKey: ["/api/admin/professionals", { search, category: selectedCategory, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/professionals?${params}`);
      if (!response.ok) throw new Error('Failed to fetch professionals');
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const form = useForm<z.infer<typeof professionalSchema>>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      userId: 0,
      categoryId: 0,
      businessName: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      priceRangeMin: "",
      priceRangeMax: "",
      priceUnit: "ora",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof professionalSchema>) => {
      const payload = {
        ...data,
        priceRangeMin: data.priceRangeMin ? parseFloat(data.priceRangeMin) : null,
        priceRangeMax: data.priceRangeMax ? parseFloat(data.priceRangeMax) : null,
      };
      await apiRequest("POST", "/api/admin/professionals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      form.reset();
      toast({ title: "Professionista creato con successo" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile creare il professionista", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof professionalSchema>> }) => {
      await apiRequest("PATCH", `/api/admin/professionals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      setEditingProfessional(null);
      toast({ title: "Professionista aggiornato con successo" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile aggiornare il professionista", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/professionals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      toast({ title: "Professionista eliminato con successo" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile eliminare il professionista", variant: "destructive" });
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: number; verified: boolean }) => {
      await apiRequest("PATCH", `/api/admin/professionals/${id}/verify`, { verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      toast({ title: verified ? "Professionista verificato" : "Verifica rimossa" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile aggiornare la verifica", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Professionisti</h1>
          <p className="text-gray-600 mt-2">Amministra i professionisti registrati sulla piattaforma</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Professionista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Professionista</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Utente</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona utente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Azienda</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome dell'attività" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descrizione dell'attività" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefono</FormLabel>
                        <FormControl>
                          <Input placeholder="+39 123 456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@esempio.it" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sito Web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.esempio.it" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo</FormLabel>
                      <FormControl>
                        <Input placeholder="Via Roma 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città</FormLabel>
                        <FormControl>
                          <Input placeholder="Milano" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input placeholder="MI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CAP</FormLabel>
                        <FormControl>
                          <Input placeholder="20100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="priceRangeMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prezzo Min (€)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priceRangeMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prezzo Max (€)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priceUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unità</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ora">Ora</SelectItem>
                            <SelectItem value="visita">Visita</SelectItem>
                            <SelectItem value="progetto">Progetto</SelectItem>
                            <SelectItem value="atto">Atto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creazione..." : "Crea Professionista"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca professionisti..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="verified">Verificati</SelectItem>
                <SelectItem value="unverified">Non verificati</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Professionals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Professionisti ({professionals?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Caricamento...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome/Azienda</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ubicazione</TableHead>
                  <TableHead>Contatti</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Valutazione</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals?.map((professional: any) => (
                  <TableRow key={professional.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{professional.businessName}</p>
                        <p className="text-sm text-gray-500">{professional.user?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{professional.category?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {professional.city}, {professional.province}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        {professional.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {professional.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {professional.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {professional.isVerified ? (
                          <Badge className="bg-green-100 text-green-700">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Verificato
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Shield className="w-3 h-3 mr-1" />
                            Non verificato
                          </Badge>
                        )}
                        {professional.isPremium && (
                          <Badge className="bg-amber-100 text-amber-700">Premium</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{Number(professional.rating).toFixed(1)}/5</div>
                        <div className="text-gray-500">{professional.reviewCount} recensioni</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleVerificationMutation.mutate({
                            id: professional.id,
                            verified: !professional.isVerified
                          })}
                        >
                          {professional.isVerified ? "Rimuovi Verifica" : "Verifica"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(professional.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}