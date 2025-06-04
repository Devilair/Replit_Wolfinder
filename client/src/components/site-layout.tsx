import { Button } from "@/components/ui/button";
import { Search, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const [location] = useLocation();
  
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const navigation = [
    { name: "Chi Siamo", href: "/chi-siamo" },
    { name: "La Nostra Storia", href: "/la-nostra-storia" },
    { name: "Professionisti", href: "/professionals" },
    { name: "Per i Professionisti", href: "/auth/register" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-amber-600" />
              <span className="text-2xl font-bold text-gray-900">Wolfinder</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors font-medium ${
                    isActive(item.href)
                      ? "text-amber-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost">Accedi</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-amber-600 hover:bg-amber-700">Registrati</Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="sm">Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-8 w-8 text-amber-600" />
                <span className="text-2xl font-bold text-gray-900">Wolfinder</span>
              </div>
              <p className="text-gray-600 mb-6">
                La piattaforma che trasforma il modo in cui scegli i professionisti, 
                basandoti su trasparenza e merito.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Navigazione</h3>
              <div className="space-y-3">
                <Link href="/" className="block text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
                <Link href="/chi-siamo" className="block text-gray-600 hover:text-gray-900 transition-colors">Chi Siamo</Link>
                <Link href="/la-nostra-storia" className="block text-gray-600 hover:text-gray-900 transition-colors">La Nostra Storia</Link>
                <Link href="/professionals" className="block text-gray-600 hover:text-gray-900 transition-colors">Professionisti</Link>
                <Link href="/auth/register" className="block text-gray-600 hover:text-gray-900 transition-colors">Per i Professionisti</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Categorie</h3>
              <div className="space-y-3">
                {categories?.slice(0, 5).map((category: any) => (
                  <Link 
                    key={category.id}
                    href={`/professionals?category=${category.slug}`} 
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Informazioni</h3>
              <div className="space-y-3">
                <p className="text-gray-600">info@wolfinder.com</p>
                <p className="text-gray-600">Ferrara & Livorno</p>
                <p className="text-gray-600">Italia</p>
                <Link href="/privacy" className="block text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">
              © 2024 Wolfinder. Tutti i diritti riservati.
            </p>
            <p className="text-sm text-gray-500">
              Ospitato su server in Italia • GDPR Compliant
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}