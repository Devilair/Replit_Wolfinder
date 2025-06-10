import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function EditProfessional() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    email: "",
    phoneFixed: "",
    phoneMobile: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    categoryId: "",
    isVerified: false,
    verificationStatus: "pending",
    adminNotes: ""
  });

  // Fetch professional data
  const { data: professional, isLoading, error } = useQuery({
    queryKey: ['/api/admin/professionals', id],
    queryFn: () => apiRequest('GET', `/api/admin/professionals/${id}`),
    enabled: !!id
  });

  console.log('Professional data:', { professional, isLoading, error, id });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['/api/categories']
  });

  // Update form when data loads
  useEffect(() => {
    if (professional) {
      setFormData({
        businessName: professional.businessName || "",
        description: professional.description || "",
        email: professional.email || "",
        phoneFixed: professional.phoneFixed || "",
        phoneMobile: professional.phoneMobile || "",
        address: professional.address || "",
        city: professional.city || "",
        province: professional.province || "",
        postalCode: professional.postalCode || "",
        categoryId: professional.categoryId?.toString() || "",
        isVerified: professional.isVerified || false,
        verificationStatus: professional.verificationStatus || "pending",
        adminNotes: professional.adminNotes || ""
      });
    }
  }, [professional]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', `/api/admin/professionals/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Professionista aggiornato",
        description: "Le modifiche sono state salvate con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
      setLocation('/admin/professionals');
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'aggiornamento",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      verified: "default",
      pending: "secondary", 
      rejected: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status === 'verified' ? 'Verificato' : 
         status === 'pending' ? 'In attesa' : 'Rifiutato'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Professionista non trovato</h2>
        <Button onClick={() => setLocation('/admin/professionals')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/professionals')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla lista
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Modifica Professionista</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Principali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Nome Attività *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneFixed">Telefono Fisso</Label>
                    <Input
                      id="phoneFixed"
                      value={formData.phoneFixed}
                      onChange={(e) => handleInputChange('phoneFixed', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneMobile">Cellulare</Label>
                    <Input
                      id="phoneMobile"
                      value={formData.phoneMobile}
                      onChange={(e) => handleInputChange('phoneMobile', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indirizzo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Via/Piazza</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Città</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Provincia</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">CAP</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(formData.verificationStatus)}
                  Stato Verifica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isVerified">Verificato</Label>
                  <Switch
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="verificationStatus">Stato</Label>
                  <Select 
                    value={formData.verificationStatus} 
                    onValueChange={(value) => handleInputChange('verificationStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">In attesa</SelectItem>
                      <SelectItem value="verified">Verificato</SelectItem>
                      <SelectItem value="rejected">Rifiutato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  {getStatusBadge(formData.verificationStatus)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Note Amministrative</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.adminNotes}
                  onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                  placeholder="Note interne per il team..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Rating:</span>
                  <span className="font-medium">{professional.rating || "0"}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Recensioni:</span>
                  <span className="font-medium">{professional.reviewCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Visualizzazioni:</span>
                  <span className="font-medium">{professional.profileViews || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completezza:</span>
                  <span className="font-medium">{professional.profileCompleteness || "0"}%</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={updateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Salvando...' : 'Salva Modifiche'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}