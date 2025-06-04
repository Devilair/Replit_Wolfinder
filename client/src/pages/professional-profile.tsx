import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import StarRating from "@/components/star-rating";
import ReviewCard from "@/components/review-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Shield, 
  Star, 
  Euro,
  MessageCircle,
  Calendar,
  Users
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProfessionalWithDetails } from "@shared/schema";

const reviewSchema = z.object({
  userId: z.number().min(1, "User ID richiesto"),
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "Titolo richiesto"),
  content: z.string().min(10, "La recensione deve essere di almeno 10 caratteri"),
});

export default function ProfessionalProfile() {
  const params = useParams();
  const { toast } = useToast();
  const professionalId = parseInt(params.id as string);

  const { data: professional, isLoading } = useQuery<ProfessionalWithDetails>({
    queryKey: ["/api/professionals", professionalId],
    queryFn: async () => {
      const response = await fetch(`/api/professionals/${professionalId}`);
      if (!response.ok) throw new Error('Professional not found');
      return response.json();
    },
    enabled: !isNaN(professionalId),
  });

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      userId: 1, // For demo purposes - in real app this would come from auth
      rating: 5,
      title: "",
      content: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: z.infer<typeof reviewSchema>) => {
      await apiRequest("POST", `/api/professionals/${professionalId}/reviews`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals", professionalId] });
      form.reset();
      toast({
        title: "Recensione pubblicata",
        description: "La tua recensione è stata pubblicata con successo.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la pubblicazione della recensione.",
        variant: "destructive",
      });
    },
  });

  if (isNaN(professionalId)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">ID Professionista Non Valido</h1>
              <p className="text-gray-600">L'ID del professionista specificato non è valido.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <Skeleton className="w-20 h-20 rounded-full mr-6" />
                  <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-20 w-full mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Professionista Non Trovato</h1>
              <p className="text-gray-600">Il professionista richiesto non è stato trovato.</p>
              <Button className="mt-4" onClick={() => window.history.back()}>
                Torna Indietro
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const priceRange = professional.priceRangeMin && professional.priceRangeMax
    ? `€${professional.priceRangeMin}-${professional.priceRangeMax}/${professional.priceUnit}`
    : "Prezzo su richiesta";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Professional Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-6">
                  <span className="text-2xl font-bold text-blue-600">
                    {professional.businessName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {professional.businessName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-1">{professional.category.name}</p>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {professional.city}, {professional.province}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {professional.isVerified && (
                  <Badge className="bg-green-100 text-green-700 mb-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificato
                  </Badge>
                )}
                {!professional.isClaimed && (
                  <Badge variant="outline" className="mb-2 ml-2">
                    Profilo non reclamato
                  </Badge>
                )}
                <div className="flex items-center justify-end mb-1">
                  <StarRating rating={Number(professional.rating)} size="sm" />
                  <span className="ml-2 font-semibold">{Number(professional.rating).toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {professional.reviewCount} recensioni
                </p>
                {!professional.isClaimed && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = `/reclama-profilo/${professionalId}`}
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Reclama Profilo
                  </Button>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {professional.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contatti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {professional.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{professional.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{professional.email}</span>
                  </div>
                  {professional.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-3 text-gray-400" />
                      <a 
                        href={professional.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Sito Web
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{professional.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Price and Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Servizi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Euro className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-semibold text-lg text-blue-600">
                      {priceRange}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button className="w-full" size="lg">
                      <Phone className="w-4 h-4 mr-2" />
                      Contatta Ora
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" size="lg">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Scrivi Recensione
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Scrivi una Recensione</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit((data) => reviewMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="rating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valutazione</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center space-x-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => field.onChange(star)}
                                          className={`w-8 h-8 ${
                                            star <= field.value
                                              ? "text-amber-400"
                                              : "text-gray-300"
                                          }`}
                                        >
                                          <Star className="w-full h-full fill-current" />
                                        </button>
                                      ))}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Titolo</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Titolo della recensione" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Recensione</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Descrivi la tua esperienza..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="submit" 
                              className="w-full"
                              disabled={reviewMutation.isPending}
                            >
                              {reviewMutation.isPending ? "Pubblicazione..." : "Pubblica Recensione"}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Recensioni ({professional.reviewCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {professional.reviews.length > 0 ? (
              <div className="space-y-6">
                {professional.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nessuna recensione ancora
                </h3>
                <p className="text-gray-600 mb-4">
                  Sii il primo a lasciare una recensione per questo professionista.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Scrivi la Prima Recensione</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Scrivi una Recensione</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => reviewMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valutazione</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => field.onChange(star)}
                                      className={`w-8 h-8 ${
                                        star <= field.value
                                          ? "text-amber-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      <Star className="w-full h-full fill-current" />
                                    </button>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Titolo</FormLabel>
                              <FormControl>
                                <Input placeholder="Titolo della recensione" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recensione</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Descrivi la tua esperienza..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={reviewMutation.isPending}
                        >
                          {reviewMutation.isPending ? "Pubblicazione..." : "Pubblica Recensione"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
