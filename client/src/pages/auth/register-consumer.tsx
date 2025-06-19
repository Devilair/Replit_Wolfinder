import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const consumerRegistrationSchema = z.object({
  name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, "Devi accettare i termini di servizio"),
  acceptPrivacy: z.boolean().refine(val => val === true, "Devi accettare la privacy policy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

type ConsumerRegistrationFormData = z.infer<typeof consumerRegistrationSchema>;

export default function RegisterConsumer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ConsumerRegistrationFormData>({
    resolver: zodResolver(consumerRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: ConsumerRegistrationFormData) => {
      return apiRequest("POST", "/api/auth/register-consumer", {
        name: data.name,
        email: data.email,
        password: data.password,
        acceptTerms: data.acceptTerms,
        acceptPrivacy: data.acceptPrivacy,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Registrazione completata!",
        description: data.message || "Account creato con successo. Controlla la tua email per verificare l'account.",
      });
      
      // Redirect to login page
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Errore nella registrazione",
        description: error.message || "Si è verificato un errore durante la registrazione.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsumerRegistrationFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Crea il tuo account</CardTitle>
          <CardDescription>
            Registrati per lasciare recensioni e scoprire i migliori professionisti
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Mario Rossi"
                  className="pl-10"
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="mario@example.com"
                  className="pl-10"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  placeholder="Almeno 8 caratteri"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...form.register("confirmPassword")}
                  placeholder="Ripeti la password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={form.watch("acceptTerms")}
                  onCheckedChange={(checked) => form.setValue("acceptTerms", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Accetto i{" "}
                    <Link href="/about/terms" className="text-primary hover:underline">
                      Termini di Servizio
                    </Link>
                  </label>
                </div>
              </div>
              {form.formState.errors.acceptTerms && (
                <p className="text-sm text-red-500">{form.formState.errors.acceptTerms.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptPrivacy"
                  checked={form.watch("acceptPrivacy")}
                  onCheckedChange={(checked) => form.setValue("acceptPrivacy", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="acceptPrivacy"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Accetto l'{" "}
                    <Link href="/about/privacy" className="text-primary hover:underline">
                      Informativa sulla Privacy
                    </Link>
                  </label>
                </div>
              </div>
              {form.formState.errors.acceptPrivacy && (
                <p className="text-sm text-red-500">{form.formState.errors.acceptPrivacy.message}</p>
              )}
            </div>

            {/* Benefits Info */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Con il tuo account potrai:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Lasciare recensioni verificate</li>
                  <li>• Salvare i tuoi professionisti preferiti</li>
                  <li>• Gestire le tue recensioni</li>
                  <li>• Ricevere aggiornamenti sui servizi</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                "Creazione account..."
              ) : (
                "Crea il mio account"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600">
              Hai già un account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Accedi qui
              </Link>
            </div>

            {/* Professional Registration Link */}
            <div className="text-center">
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sei un professionista?</strong>
                  <br />
                  <Link href="/register-professional" className="text-primary hover:underline font-medium">
                    Registrati come professionista
                  </Link>{" "}
                  per gestire il tuo profilo aziendale
                </AlertDescription>
              </Alert>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}