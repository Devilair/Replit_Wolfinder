import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, User, Briefcase, ArrowRight } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navigation = [
    { name: "Trova Professionisti", href: "/professionals" },
    { name: "Categorie", href: "/categories" },
    { name: "Come Funziona", href: "/how-it-works" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <img 
                src="/attached_assets/logo_1749382291587.png" 
                alt="Wolfinder" 
                className="h-12 w-auto" 
              />
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors font-medium ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-gray-500 hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button 
                variant="ghost" 
                className="text-gray-500 hover:text-blue-600 font-medium hidden sm:block"
              >
                Admin
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="text-gray-500 hover:text-primary font-medium hidden sm:block"
            >
              Accedi
            </Button>
            <Dialog open={registrationModalOpen} onOpenChange={setRegistrationModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-primary/90 font-medium">
                  Registrati
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Scegli il tipo di registrazione</DialogTitle>
                  <DialogDescription>
                    Seleziona l'opzione che meglio ti descrive per creare il tuo account
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <Link href="/register-consumer" onClick={() => setRegistrationModalOpen(false)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Sono un utente</CardTitle>
                            <CardDescription>
                              Cerco professionisti qualificati per i miei progetti
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                        </div>
                      </CardHeader>
                    </Link>
                  </Card>
                  
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <Link href="/register-professional" onClick={() => setRegistrationModalOpen(false)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Briefcase className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Sono un professionista</CardTitle>
                            <CardDescription>
                              Offro servizi professionali e voglio essere trovato dai clienti
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                        </div>
                      </CardHeader>
                    </Link>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-primary"
                          : "text-gray-700 hover:text-primary"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      Accedi
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        setRegistrationModalOpen(true);
                      }}
                    >
                      Registrati
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
