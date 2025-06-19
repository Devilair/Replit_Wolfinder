import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, UserPlus, Building } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

const registrationSchema = z.object({
  name: z.string().min(2, "Nome deve essere di almeno 2 caratteri"),
  surname: z.string().min(2, "Cognome deve essere di almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "Password deve essere di almeno 8 caratteri")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password deve contenere almeno una lettera minuscola, una maiuscola e un numero"),
  confirmPassword: z.string(),
  userType: z.enum(["user", "professional"]),
  acceptTerms: z.boolean().refine(val => val === true, "Devi accettare Termini, Condizioni e Privacy Policy"),
  marketingConsent: z.boolean().optional(),
  // Professional fields
  businessName: z.string().optional(),
  categoryId: z.number().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.enum(["Ferrara", "Livorno"]).optional(),
  province: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.userType === "professional") {
    return data.businessName && data.categoryId && data.city;
  }
  return true;
}, {
  message: "I campi professionali sono obbligatori per i professionisti",
  path: ["businessName"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState<"user" | "professional">("user");

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      userType: "user",
      acceptTerms: false,
      marketingConsent: false,
      city: "Ferrara",
    },
  });

  // Get categories for professionals
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    enabled: userType === "professional",
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      return apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Registrazione completata",
        description: "Account creato con successo. Effettua il login.",
      });
      navigate("/auth/login");
    },
    onError: (error: any) => {
      let errorMessage = "Si è verificato un errore durante la registrazione";
      
      // Estrai il messaggio di errore dal response
      if (error.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes("email già registrata")) {
          errorMessage = "L'email inserita è già associata a un account esistente. Prova con un'email diversa.";
        } else if (msg.includes("username già in uso")) {
          errorMessage = "L'username scelto è già in uso. Scegline uno diverso.";
        } else if (msg.includes("duplicate key") || msg.includes("already exists")) {
          errorMessage = "Alcuni dati inseriti sono già presenti nel sistema. Verifica email e username.";
        } else if (msg.includes("tutti i campi obbligatori")) {
          errorMessage = "Compila tutti i campi obbligatori per completare la registrazione.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registrazione non completata",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registrationMutation.mutate({
      ...data,
      userType,
      city: data.city || "Ferrara",
      province: data.city === "Ferrara" ? "FE" : "LI",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Registrati su Wolfinder
          </CardTitle>
          <CardDescription>
            Unisciti alla community di professionisti più affidabile d'Italia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={(value) => {
            setUserType(value as "user" | "professional");
            form.setValue("userType", value as "user" | "professional");
          }}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Utente
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Professionista
              </TabsTrigger>
            </TabsList>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    Nome 
                    <span className="text-xs text-gray-500 ml-1">(può essere reale o fittizio)</span>
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Mario"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="surname">Cognome</Label>
                  <Input
                    id="surname"
                    {...form.register("surname")}
                    placeholder="Rossi"
                  />
                  {form.formState.errors.surname && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.surname.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">
                  Email 
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-1">(usata per conferma e comunicazioni)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="mario.rossi@email.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">
                    Password 
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Conferma Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register("confirmPassword")}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Fields */}
              <TabsContent value="professional" className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Informazioni Professionali</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName">Nome Studio/Attività</Label>
                      <Input
                        id="businessName"
                        {...form.register("businessName")}
                        placeholder="Studio Legale Rossi"
                      />
                      {form.formState.errors.businessName && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.businessName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="categoryId">Categoria Professionale</Label>
                      <Select onValueChange={(value) => form.setValue("categoryId", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.categoryId && (
                        <p className="text-sm text-red-500 mt-1">
                          Categoria richiesta
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefono</Label>
                      <Input
                        id="phone"
                        {...form.register("phone")}
                        placeholder="+39 123 456 7890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Città</Label>
                      <Select onValueChange={(value) => form.setValue("city", value as "Ferrara" | "Livorno")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona città" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ferrara">Ferrara</SelectItem>
                          <SelectItem value="Livorno">Livorno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Indirizzo</Label>
                    <Input
                      id="address"
                      {...form.register("address")}
                      placeholder="Via Roma 123"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={form.watch("acceptTerms")}
                    onCheckedChange={(checked) => form.setValue("acceptTerms", !!checked)}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                    <span className="text-red-500">*</span> Accetto i{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Termini e Condizioni
                    </Link>{" "}
                    e l'{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    (GDPR)
                  </Label>
                </div>
                {form.formState.errors.acceptTerms && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.acceptTerms.message}
                  </p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketingConsent"
                    checked={form.watch("marketingConsent")}
                    onCheckedChange={(checked) => form.setValue("marketingConsent", !!checked)}
                  />
                  <Label htmlFor="marketingConsent" className="text-sm">
                    Accetto di ricevere comunicazioni commerciali (opzionale)
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registrationMutation.isPending}
              >
                {registrationMutation.isPending ? "Registrazione..." : "Registrati"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hai già un account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Accedi
                </Link>
              </p>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}