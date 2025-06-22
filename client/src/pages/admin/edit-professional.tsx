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
import { ArrowLeft, Save, CheckCircle, XCircle, AlertTriangle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }: { 
  position: [number, number] | null; 
  setPosition: (pos: [number, number]) => void 
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

interface Category {
  id: number;
  name: string;
}

export default function EditProfessional() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for map position
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    email: "",
    phoneFixed: "",
    phoneMobile: "",
    website: "",
    pec: "",
    vatNumber: "",
    fiscalCode: "",
    whatsappNumber: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    address: "",
    city: "",
    additionalCities: "",
    province: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    priceRangeMin: "",
    priceRangeMax: "",
    priceUnit: "",
    categoryId: "",
    isVerified: false,
    verificationStatus: "pending",
    isPremium: false,
    adminNotes: ""
  });

  // Fetch professional data
  const { data: professional, isLoading, error } = useQuery({
    queryKey: ['/api/admin/professionals', id],
    queryFn: () => apiRequest('GET', `/api/admin/professionals/${id}`),
    enabled: !!id
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery<Category[]>({
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
        website: professional.website || "",
        pec: professional.pec || "",
        vatNumber: professional.vatNumber || "",
        fiscalCode: professional.fiscalCode || "",
        whatsappNumber: professional.whatsappNumber || "",
        facebookUrl: professional.facebookUrl || "",
        instagramUrl: professional.instagramUrl || "",
        linkedinUrl: professional.linkedinUrl || "",
        twitterUrl: professional.twitterUrl || "",
        address: professional.address || "",
        city: professional.city || "",
        additionalCities: professional.additionalCities || "",
        province: professional.province || "",
        postalCode: professional.postalCode || "",
        latitude: professional.latitude || "",
        longitude: professional.longitude || "",
        priceRangeMin: professional.priceRangeMin?.toString() || "",
        priceRangeMax: professional.priceRangeMax?.toString() || "",
        priceUnit: professional.priceUnit || "",
        categoryId: professional.categoryId?.toString() || "",
        isVerified: professional.isVerified || false,
        verificationStatus: professional.verificationStatus || "pending",
        isPremium: professional.isPremium || false,
        adminNotes: professional.adminNotes || ""
      });
      
      // Set map position if coordinates exist
      if (professional.latitude && professional.longitude) {
        setMapPosition([professional.latitude, professional.longitude]);
      }
    }
  }, [professional]);

  // Handle map position changes
  const handleMapPositionChange = (position: [number, number]) => {
    setMapPosition(position);
    setFormData(prev => ({
      ...prev,
      latitude: position[0].toString(),
      longitude: position[1].toString()
    }));
  };

  // Geocode address to get coordinates
  const geocodeAddress = async () => {
    if (!formData.address || !formData.city) {
      toast({
        title: "Errore",
        description: "Inserisci almeno via e città per la geocodifica",
        variant: "destructive"
      });
      return;
    }

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.province}, Italia`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        setMapPosition([lat, lng]);
        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
        
        toast({
          title: "Geocodifica completata",
          description: "Coordinate aggiornate in base all'indirizzo"
        });
      } else {
        toast({
          title: "Indirizzo non trovato",
          description: "Impossibile trovare le coordinate per questo indirizzo",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Errore geocodifica",
        description: "Errore durante la ricerca delle coordinate",
        variant: "destructive"
      });
    }
  };

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
    
    const updateData = {
      businessName: formData.businessName,
      description: formData.description,
      email: formData.email,
      phoneFixed: formData.phoneFixed || null,
      phoneMobile: formData.phoneMobile || null,
      website: formData.website || null,
      pec: formData.pec || null,
      vatNumber: formData.vatNumber || null,
      fiscalCode: formData.fiscalCode || null,
      whatsappNumber: formData.whatsappNumber || null,
      facebookUrl: formData.facebookUrl || null,
      instagramUrl: formData.instagramUrl || null,
      linkedinUrl: formData.linkedinUrl || null,
      twitterUrl: formData.twitterUrl || null,
      address: formData.address,
      city: formData.city,
      additionalCities: formData.additionalCities || null,
      province: formData.province,
      postalCode: formData.postalCode,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      priceRangeMin: formData.priceRangeMin ? parseFloat(formData.priceRangeMin) : null,
      priceRangeMax: formData.priceRangeMax ? parseFloat(formData.priceRangeMax) : null,
      priceUnit: formData.priceUnit || null,
      categoryId: parseInt(formData.categoryId),
      isVerified: formData.isVerified,
      verificationStatus: formData.verificationStatus,
      isPremium: formData.isPremium,
      adminNotes: formData.adminNotes
    };

    updateMutation.mutate(updateData);
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Sito Web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.esempio.it"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pec">PEC</Label>
                    <Input
                      id="pec"
                      type="email"
                      value={formData.pec}
                      onChange={(e) => handleInputChange('pec', e.target.value)}
                      placeholder="nome@pec.it"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vatNumber">Partita IVA</Label>
                    <Input
                      id="vatNumber"
                      value={formData.vatNumber}
                      onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                      placeholder="IT12345678901"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                    <Input
                      id="fiscalCode"
                      value={formData.fiscalCode}
                      onChange={(e) => handleInputChange('fiscalCode', e.target.value)}
                      placeholder="RSSMRA80A01H501U"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp</Label>
                  <Input
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    placeholder="+39 333 1234567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media Section */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebookUrl">Facebook</Label>
                    <Input
                      id="facebookUrl"
                      type="url"
                      value={formData.facebookUrl}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/profilo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagramUrl">Instagram</Label>
                    <Input
                      id="instagramUrl"
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/profilo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn</Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/profilo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterUrl">Twitter</Label>
                    <Input
                      id="twitterUrl"
                      type="url"
                      value={formData.twitterUrl}
                      onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                      placeholder="https://twitter.com/profilo"
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

                <div>
                  <Label htmlFor="additionalCities">Città Aggiuntive</Label>
                  <Input
                    id="additionalCities"
                    value={formData.additionalCities}
                    onChange={(e) => handleInputChange('additionalCities', e.target.value)}
                    placeholder="Es: Bologna, Modena (separate da virgola)"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Posizione su Mappa
                  </Label>
                  <div className="mt-2 space-y-4">
                    <div className="h-64 w-full border rounded-lg overflow-hidden">
                      <MapContainer
                        center={mapPosition || [44.4949, 12.0424]} // Default to Ferrara if no position
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={mapPosition} setPosition={handleMapPositionChange} />
                      </MapContainer>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="latitude">Latitudine</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => {
                            handleInputChange('latitude', e.target.value);
                            if (e.target.value && formData.longitude) {
                              setMapPosition([parseFloat(e.target.value), parseFloat(formData.longitude)]);
                            }
                          }}
                          placeholder="44.494900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude">Longitudine</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => {
                            handleInputChange('longitude', e.target.value);
                            if (formData.latitude && e.target.value) {
                              setMapPosition([parseFloat(formData.latitude), parseFloat(e.target.value)]);
                            }
                          }}
                          placeholder="12.042400"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={geocodeAddress}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Trova coordinate dall'indirizzo
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Clicca sulla mappa per impostare la posizione, usa il pulsante per geocodificare l'indirizzo, o inserisci le coordinate manualmente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle>Prezzi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priceRangeMin">Prezzo Minimo (€)</Label>
                    <Input
                      id="priceRangeMin"
                      type="number"
                      step="0.01"
                      value={formData.priceRangeMin}
                      onChange={(e) => handleInputChange('priceRangeMin', e.target.value)}
                      placeholder="50.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceRangeMax">Prezzo Massimo (€)</Label>
                    <Input
                      id="priceRangeMax"
                      type="number"
                      step="0.01"
                      value={formData.priceRangeMax}
                      onChange={(e) => handleInputChange('priceRangeMax', e.target.value)}
                      placeholder="200.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="priceUnit">Unità di Prezzo</Label>
                  <Select 
                    value={formData.priceUnit} 
                    onValueChange={(value) => handleInputChange('priceUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona unità" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Per ora</SelectItem>
                      <SelectItem value="project">Per progetto</SelectItem>
                      <SelectItem value="consultation">Per consulenza</SelectItem>
                      <SelectItem value="day">Per giorno</SelectItem>
                      <SelectItem value="month">Per mese</SelectItem>
                    </SelectContent>
                  </Select>
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

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPremium">Premium</Label>
                  <Switch
                    id="isPremium"
                    checked={formData.isPremium}
                    onCheckedChange={(checked) => handleInputChange('isPremium', checked)}
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