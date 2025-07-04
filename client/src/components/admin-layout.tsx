import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  MessageSquare, 
  Building2,
  CreditCard,
  Settings,
  LogOut,
  Home,
  FileText
} from "lucide-react";

interface NotificationCounts {
  pendingReviews: number;
  pendingDocuments: number;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Query per i conteggi delle notifiche
  const { data: notificationCounts } = useQuery<NotificationCounts>({
    queryKey: ['/api/admin/notification-counts'],
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  });

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, current: location === "/admin" },
    { name: "Analytics Avanzate", href: "/admin/advanced", icon: LayoutDashboard, current: location === "/admin/advanced" },
    { 
      name: "Professionisti", 
      href: "/admin/professionals", 
      icon: UserCheck, 
      current: location === "/admin/professionals" || location.startsWith("/admin/professionals/"),
      badge: notificationCounts?.pendingDocuments && notificationCounts.pendingDocuments > 0 ? notificationCounts.pendingDocuments : null
    },
    { 
      name: "Recensioni", 
      href: "/admin/reviews", 
      icon: MessageSquare, 
      current: location === "/admin/reviews",
      badge: notificationCounts?.pendingReviews && notificationCounts.pendingReviews > 0 ? notificationCounts.pendingReviews : null
    },
    { name: "Categorie", href: "/admin/categories", icon: Building2, current: location === "/admin/categories" },
    { name: "Abbonamenti", href: "/admin/subscriptions", icon: CreditCard, current: location === "/admin/subscriptions" },
    { name: "Utenti", href: "/admin/users", icon: Users, current: location === "/admin/users" },
    { name: "Audit Log", href: "/admin/audit-logs", icon: FileText, current: location === "/admin/audit-logs" },
    { name: "Impostazioni", href: "/admin/settings", icon: Settings, current: location === "/admin/settings" },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Logout effettuato",
          description: "Sei stato disconnesso con successo"
        });
        localStorage.removeItem('auth_token');
        setLocation('/');
      } else {
        throw new Error('Errore durante il logout');
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/logo.png" alt="Wolfinder" className="h-10 w-auto" />
                <span className="ml-2 text-sm text-gray-500">Admin</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Vai al Sito
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          item.current ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      />
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-2 px-2 py-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}