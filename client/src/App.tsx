import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthPersistence } from "@/hooks/useAuthPersistence";
import AdminLayout from "@/components/admin-layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Professionals from "@/pages/professionals";
import ProfessionalProfile from "@/pages/professional-profile";
import ClaimProfile from "@/pages/claim-profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdvancedDashboard from "@/pages/admin/advanced-dashboard";
import AdminProfessionals from "@/pages/admin/professionals-advanced";
import AddProfessional from "@/pages/admin/add-professional";
import AdminReviews from "@/pages/admin/reviews-advanced";
import AdminCategories from "@/pages/admin/categories";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import ClaimRequests from "@/pages/admin/claim-requests";
import AdminLogin from "@/pages/admin-login";
import ProfessionalSubscriptionDemo from "@/pages/professional-subscription-demo";
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import LoginPage from "@/pages/login";
import RegisterProfessional from "@/pages/register-professional";
import ProfessionalAdvancedDashboard from "@/pages/dashboard/professional-advanced";
import ChiSiamo from "@/pages/about/chi-siamo";
import LaNostraStoria from "@/pages/about/la-nostra-storia";
import Privacy from "@/pages/about/privacy";
import Terms from "@/pages/about/terms";
import LineeGuidaRecensioni from "@/pages/about/linee-guida-recensioni";
import CentroAssistenza from "@/pages/about/centro-assistenza";

function Router() {
  useAuthPersistence();
  
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/professionals" component={Professionals} />
      <Route path="/professional/:id" component={ProfessionalProfile} />
      <Route path="/reclama-profilo/:id" component={ClaimProfile} />
      <Route path="/demo/subscription-limits" component={ProfessionalSubscriptionDemo} />
      <Route path="/professional-subscription-demo" component={ProfessionalSubscriptionDemo} />
      
      {/* About Pages */}
      <Route path="/chi-siamo" component={ChiSiamo} />
      <Route path="/la-nostra-storia" component={LaNostraStoria} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/linee-guida-recensioni" component={LineeGuidaRecensioni} />
      <Route path="/centro-assistenza" component={CentroAssistenza} />
      
      {/* Authentication Routes */}
      <Route path="/auth/register" component={Register} />
      <Route path="/auth/login" component={Login} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register-professional" component={RegisterProfessional} />
      
      {/* Professional Dashboard */}
      <Route path="/dashboard" component={ProfessionalAdvancedDashboard} />
      <Route path="/dashboard/professional" component={ProfessionalAdvancedDashboard} />
      <Route path="/dashboard/professional-advanced" component={ProfessionalAdvancedDashboard} />
      
      {/* Admin Login */}
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={() => (
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      )} />
      <Route path="/admin/dashboard" component={() => (
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      )} />
      <Route path="/admin/advanced" component={() => (
        <AdminLayout>
          <AdvancedDashboard />
        </AdminLayout>
      )} />
      <Route path="/admin/professionals" component={() => (
        <AdminLayout>
          <AdminProfessionals />
        </AdminLayout>
      )} />
      <Route path="/admin/professionals-advanced" component={() => (
        <AdminLayout>
          <AdminProfessionals />
        </AdminLayout>
      )} />
      <Route path="/admin/add-professional" component={() => (
        <AdminLayout>
          <AddProfessional />
        </AdminLayout>
      )} />
      <Route path="/admin/reviews" component={() => (
        <AdminLayout>
          <AdminReviews />
        </AdminLayout>
      )} />
      <Route path="/admin/categories" component={() => (
        <AdminLayout>
          <AdminCategories />
        </AdminLayout>
      )} />
      <Route path="/admin/subscriptions" component={() => (
        <AdminLayout>
          <AdminSubscriptions />
        </AdminLayout>
      )} />
      <Route path="/admin/users" component={() => (
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      )} />
      <Route path="/admin/settings" component={() => (
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      )} />
      <Route path="/admin/claim-requests" component={() => (
        <AdminLayout>
          <ClaimRequests />
        </AdminLayout>
      )} />
      
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
