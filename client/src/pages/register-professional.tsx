import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, User, Briefcase, ChevronRight, ChevronLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { professionalRegistrationSchema, type ProfessionalRegistrationData, type Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RegisterProfessional() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const form = useForm<ProfessionalRegistrationData>({
    resolver: zodResolver(professionalRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      businessName: "",
      categoryId: 0,
      phoneFixed: "",
      phoneMobile: "",
      city: "",
      address: "",
      description: "",
      privacyConsent: false,
      marketingConsent: false
    }
  });

  // Carica le categorie professionali
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });

  const registerMutation = useMutation({
    mutationFn: async (data: ProfessionalRegistrationData) => {
      const response = await apiRequest("POST", "/api/auth/register-professional", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registrazione completata",
        description: "Il tuo account è stato creato con successo. Effettua il login per continuare."
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Errore nella registrazione",
        description: error.message || "Si è verificato un errore durante la registrazione",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ProfessionalRegistrationData) => {
    registerMutation.mutate(data);
  };

  const cities = ["Ferrara", "Livorno"]; // Solo le città supportate

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrati su Wolfinder</h1>
          <p className="mt-2 text-gray-600">Unisciti alla community di professionisti più affidabile d'Italia</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <User className="w-5 h-5" />
                <span>Utente</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600 font-medium">
                <Briefcase className="w-5 h-5" />
                <span>Professionista</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">Dati Personali</TabsTrigger>
                    <TabsTrigger value="professional">Informazioni Professionali</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Mario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cognome</FormLabel>
                            <FormControl>
                              <Input placeholder="Rossi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="mario.rossi@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <div className="text-sm text-gray-500 mt-1">
                            La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Pulsante di navigazione per il primo tab */}
                    <div className="flex justify-end pt-6 border-t">
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab("professional")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Avanti: Informazioni Professionali
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="professional" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Studio/Attività</FormLabel>
                          <FormControl>
                            <Input placeholder="Studio Legale Rossi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria Professionale</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phoneFixed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefono Fisso</FormLabel>
                            <FormControl>
                              <Input placeholder="+39 123 456 7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneMobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefono Cellulare</FormLabel>
                            <FormControl>
                              <Input placeholder="+39 123 456 7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Città</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona città" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
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

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione Attività</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrivi brevemente la tua attività professionale..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Pulsanti di navigazione per il secondo tab */}
                    <div className="flex justify-between pt-6 border-t">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("personal")}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Indietro: Dati Personali
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={registerMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {registerMutation.isPending ? "Registrazione..." : "Completa Registrazione"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="privacyConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Accetto i{" "}
                            <Link href="/privacy" className="text-blue-600 hover:underline">
                              Termini di Servizio
                            </Link>{" "}
                            e l'{" "}
                            <Link href="/privacy" className="text-blue-600 hover:underline">
                              Informativa sulla Privacy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marketingConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Accetto di ricevere comunicazioni commerciali (opzionale)
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Hai già un account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                      Accedi
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}