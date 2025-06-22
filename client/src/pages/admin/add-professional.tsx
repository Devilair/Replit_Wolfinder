import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Building2 } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";

interface Category {
  id: number;
  name: string;
  slug: string;
}

// Schema per validazione form
const addProfessionalSchema = z.object({
  categoryId: z.number().min(1, "Seleziona una categoria"),
  businessName: z.string().min(2, "Nome attività richiesto"),
  description: z.string().min(10, "Descrizione minima 10 caratteri"),
  phone: z.string().optional(),
  email: z.string().email("Email non valida"),
  website: z.string().url("URL non valido").optional().or(z.literal("")),
  address: z.string().min(5, "Indirizzo richiesto"),
  city: z.enum(["Ferrara", "Livorno"], {
    errorMap: () => ({ message: "Seleziona Ferrara o Livorno" })
  }),
  province: z.string().min(2, "Provincia richiesta"),
  postalCode: z.string().min(5, "CAP richiesto"),
  priceRangeMin: z.number().min(0).optional(),
  priceRangeMax: z.number().min(0).optional(),
  priceUnit: z.string().optional(),
});

type AddProfessionalForm = z.infer<typeof addProfessionalSchema>;

export default function AddProfessional() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddProfessionalForm>({
    resolver: zodResolver(addProfessionalSchema),
    defaultValues: {
      businessName: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      city: "Ferrara",
      province: "",
      postalCode: "",
      priceUnit: "ora",
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Mutation per creare professionista
  const createProfessionalMutation = useMutation({
    mutationFn: async (data: AddProfessionalForm) => {
      const payload = {
        ...data,
        // Aggiungiamo automaticamente i campi per profili non reclamati
        isClaimed: false,
        isVerified: false,
        verificationStatus: "pending",
        profileClaimToken: "CLAIM_" + Math.random().toString(36).substr(2, 16).toUpperCase(),
        claimTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni
        autoNotificationEnabled: true,
      };
      
      return await apiRequest("POST", "/api/admin/professionals", payload);
    },
    onSuccess: () => {
      toast({
        title: "Professionista aggiunto",
        description: "Il professionista è stato inserito come 'non reclamato'",
      });
      
      // Invalida cache e reindirizza
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'inserimento",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddProfessionalForm) => {
    // Auto-completa provincia in base alla città
    const updatedData = {
      ...data,
      province: data.city === "Ferrara" ? "FE" : "LI",
    };
    
    createProfessionalMutation.mutate(updatedData);
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/professionals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Aggiungi Professionista</h1>
          <p className="text-muted-foreground">
            Inserisci manualmente un nuovo professionista nella piattaforma
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dati Professionista
          </CardTitle>
          <CardDescription>
            Il professionista verrà inserito come "non reclamato" e riceverà notifiche automatiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Categoria */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
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

              {/* Nome attività */}
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Attività *</FormLabel>
                    <FormControl>
                      <Input placeholder="es. Studio Legale Rossi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrizione */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrizione dei servizi offerti..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contatti */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input placeholder="051 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sito Web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Indirizzo */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Via Roma, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Città e CAP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Città *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ferrara">Ferrara</SelectItem>
                          <SelectItem value="Livorno">Livorno</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAP *</FormLabel>
                      <FormControl>
                        <Input placeholder="44121" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Range prezzi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="priceRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prezzo Min (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
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
                        <Input 
                          type="number" 
                          placeholder="200"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
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
                          <SelectItem value="ora">per ora</SelectItem>
                          <SelectItem value="visita">per visita</SelectItem>
                          <SelectItem value="progetto">per progetto</SelectItem>
                          <SelectItem value="consulenza">per consulenza</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pulsanti */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createProfessionalMutation.isPending}
                  className="flex-1"
                >
                  {createProfessionalMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Inserimento...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Professionista
                    </>
                  )}
                </Button>

                <Button variant="outline" asChild>
                  <Link href="/admin/professionals">Annulla</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}