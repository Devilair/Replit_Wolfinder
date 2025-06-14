import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthPersistence } from "@/hooks/useAuthPersistence";
import AdminLayout from "@/components/admin-layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import SearchPage from "@/pages/search";
import VerifyEmail from "@/pages/verify-email";
import Home from "@/pages/home";
import Professionals from "@/pages/professionals";
import ProfessionalProfile from "@/pages/professional-profile";
import ClaimProfile from "@/pages/claim-profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdvancedDashboard from "@/pages/admin/advanced-dashboard";
import AdminProfessionals from "@/pages/admin/professionals";
import AdminProfessionalView from "@/pages/admin/professional-view";
import AddProfessional from "@/pages/admin/add-professional";
import EditProfessional from "@/pages/admin/edit-professional";
import AdminReviews from "@/pages/admin/reviews-advanced";
import AdminCategories from "@/pages/admin/categories";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import ClaimRequests from "@/pages/admin/claim-requests";
import AuditLogs from "@/pages/admin/audit-logs";
import AdminLogin from "@/pages/admin-login";
import ProfessionalSubscriptionDemo from "@/pages/professional-subscription-demo";
import SubscriptionPlans from "@/pages/subscription-plans";
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import LoginPage from "@/pages/login";
import RegisterProfessional from "@/pages/register-professional";
import BadgeDashboard from "@/pages/badge-dashboard";
import ProfessionalDashboard from "@/pages/dashboard/professional";
import ChiSiamo from "@/pages/about/chi-siamo";
import LaNostraStoria from "@/pages/about/la-nostra-storia";
import Privacy from "@/pages/about/privacy";
import Terms from "@/pages/about/terms";
import LineeGuidaRecensioni from "@/pages/about/linee-guida-recensioni";
import CentroAssistenza from "@/pages/about/centro-assistenza";
import FeatureGatingTest from "@/pages/feature-gating-test";
import SubscriptionManagement from "@/pages/subscription-management";
import Checkout from "@/pages/checkout";
import SubscriptionPlansPage from "@/pages/subscription/plans";
import SubscriptionCheckout from "@/pages/subscription/checkout";
import SubscriptionSuccess from "@/pages/subscription/success";

function Router() {
  useAuthPersistence();
  
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/search" component={SearchPage} />
      <Route path="/professionals" component={Professionals} />
      <Route path="/professional/:id" component={ProfessionalProfile} />
      <Route path="/reclama-profilo/:id" component={ClaimProfile} />
      <Route path="/demo/subscription-limits" component={ProfessionalSubscriptionDemo} />
      <Route path="/professional-subscription-demo" component={ProfessionalSubscriptionDemo} />
      <Route path="/subscription-plans" component={SubscriptionPlans} />
      <Route path="/subscription-management" component={SubscriptionManagement} />
      <Route path="/subscription/plans" component={SubscriptionPlansPage} />
      <Route path="/subscription/checkout" component={SubscriptionCheckout} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/test/feature-gating" component={FeatureGatingTest} />
      
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
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/register-professional" component={RegisterProfessional} />
      
      {/* Professional Dashboard */}
      <Route path="/dashboard" component={ProfessionalDashboard} />
      <Route path="/dashboard/professional" component={ProfessionalDashboard} />
      <Route path="/dashboard/professional-advanced" component={ProfessionalDashboard} />
      <Route path="/badge-dashboard" component={BadgeDashboard} />
      <Route path="/checkout" component={Checkout} />
      
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
      <Route path="/admin/professionals/:id" component={() => (
        <AdminLayout>
          <AdminProfessionalView />
        </AdminLayout>
      )} />
      <Route path="/admin/professionals/:id/edit" component={() => (
        <AdminLayout>
          <EditProfessional />
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
      <Route path="/admin/professionals/:id/edit" component={() => (
        <AdminLayout>
          <EditProfessional />
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
      <Route path="/admin/audit-logs" component={() => (
        <AdminLayout>
          <AuditLogs />
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
