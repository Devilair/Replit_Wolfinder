import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/admin-layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Professionals from "@/pages/professionals";
import ProfessionalProfile from "@/pages/professional-profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProfessionals from "@/pages/admin/professionals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/professionals" component={Professionals} />
      <Route path="/professionals/:id" component={ProfessionalProfile} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/professionals">
        <AdminLayout>
          <AdminProfessionals />
        </AdminLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
