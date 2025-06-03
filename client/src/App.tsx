import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/admin-layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Professionals from "@/pages/professionals";
import ProfessionalProfile from "@/pages/professional-profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdvancedDashboard from "@/pages/admin/advanced-dashboard";
import AdminProfessionals from "@/pages/admin/professionals-advanced";
import AdminReviews from "@/pages/admin/reviews-advanced";
import AdminCategories from "@/pages/admin/categories";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import AdminLogin from "@/pages/admin-login";
import ProfessionalSubscriptionDemo from "@/pages/professional-subscription-demo";
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import ProfessionalDashboard from "@/pages/dashboard/professional";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/professionals" component={Professionals} />
      <Route path="/professionals/:id" component={ProfessionalProfile} />
      <Route path="/demo/subscription-limits" component={ProfessionalSubscriptionDemo} />
      <Route path="/professional-subscription-demo" component={ProfessionalSubscriptionDemo} />
      
      {/* Authentication Routes */}
      <Route path="/auth/register" component={Register} />
      <Route path="/auth/login" component={Login} />
      
      {/* Professional Dashboard */}
      <Route path="/dashboard/professional" component={ProfessionalDashboard} />
      
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
