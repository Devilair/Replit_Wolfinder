import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CreateProfessionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProfessionalDialog({ open, onOpenChange }: CreateProfessionalDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phoneFixed: "",
    phoneMobile: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    categoryId: "",
    description: "",
    website: ""
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/admin/professionals", data);
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Professionista creato con successo. Il profilo è ora disponibile per il reclamo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      setFormData({
        businessName: "",
        email: "",
        phoneFixed: "",
        phoneMobile: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        categoryId: "",
        description: "",
        website: ""
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error creating professional:", error);
      toast({
        title: "Errore",
        description: "Errore durante la creazione del professionista",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.email || !formData.address || !formData.city || !formData.categoryId) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const cities = ["Ferrara", "Livorno"];
  const provinces = {
    "Ferrara": "FE",
    "Livorno": "LI"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Professionista</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Nome Attività *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Es. Studio Dentistico Rossi"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@esempio.it"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneFixed">Telefono Fisso</Label>
              <Input
                id="phoneFixed"
                value={formData.phoneFixed}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneFixed: e.target.value }))}
                placeholder="0532123456"
              />
            </div>
            
            <div>
              <Label htmlFor="phoneMobile">Cellulare</Label>
              <Input
                id="phoneMobile"
                value={formData.phoneMobile}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneMobile: e.target.value }))}
                placeholder="3331234567"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Indirizzo *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Via Roma 123"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Città *</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    city: value,
                    province: provinces[value as keyof typeof provinces] || ""
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona città" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                value={formData.province}
                readOnly
                placeholder="Auto"
              />
            </div>
            
            <div>
              <Label htmlFor="postalCode">CAP</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="44121"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categoryId">Categoria *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(categories) && categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descrizione dell'attività..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="website">Sito Web</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://www.esempio.it"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creazione..." : "Crea Professionista"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}