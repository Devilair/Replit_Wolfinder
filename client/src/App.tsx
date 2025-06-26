import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuthPersistence } from "./hooks/use-auth-persistence";
import { ErrorBoundary, RouteErrorBoundary } from "./components/ErrorBoundary";
import { lazy, Suspense } from "react";
import AdminLayout from "./components/admin-layout";
import NotFound from "./pages/not-found";
import { useAuth } from './hooks/use-auth';

// ============================================================================
// LAZY LOADING - CODE SPLITTING
// ============================================================================

// Landing e pagine principali
const Landing = lazy(() => import("./pages/landing"));
const SearchPage = lazy(() => import("./pages/search"));
const Professionals = lazy(() => import("./pages/professionals"));
const ProfessionalProfile = lazy(() => import("@/pages/professional-profile"));
const ClaimProfile = lazy(() => import("@/pages/claim-profile"));

// Pagine About
const ChiSiamo = lazy(() => import("@/pages/about/chi-siamo"));
const LaNostraStoria = lazy(() => import("@/pages/about/la-nostra-storia"));
const Privacy = lazy(() => import("@/pages/about/privacy"));
const Terms = lazy(() => import("@/pages/about/terms"));
const LineeGuidaRecensioni = lazy(() => import("@/pages/about/linee-guida-recensioni"));
const CentroAssistenza = lazy(() => import("@/pages/about/centro-assistenza"));

// Pagine di autenticazione
const Register = lazy(() => import("./pages/auth/register"));
const Login = lazy(() => import("./pages/auth/login"));
const LoginPage = lazy(() => import("./pages/login"));
const RegisterProfessional = lazy(() => import("./pages/register-professional"));
const RegisterConsumer = lazy(() => import("./pages/auth/register-consumer"));
const VerifyEmail = lazy(() => import("./pages/verify-email"));

// Dashboard e pagine utente
const UserDashboard = lazy(() => import("./pages/user-dashboard"));
const ProfessionalDashboard = lazy(() => import("./pages/dashboard/professional"));
const BadgeDashboard = lazy(() => import("./pages/badge-dashboard"));

// Pagine di abbonamento
const ProfessionalSubscriptionDemo = lazy(() => import("./pages/professional-subscription-demo"));
const SubscriptionPlans = lazy(() => import("./pages/subscription-plans"));
const SubscriptionManagement = lazy(() => import("./pages/subscription-management"));
const SubscriptionPlansPage = lazy(() => import("./pages/subscription/plans"));
const SubscriptionCheckout = lazy(() => import("./pages/subscription/checkout"));
const SubscriptionSuccess = lazy(() => import("./pages/subscription/success"));
const Checkout = lazy(() => import("./pages/checkout"));

// Pagine admin
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdvancedDashboard = lazy(() => import("@/pages/admin/advanced-dashboard"));
const AdminProfessionals = lazy(() => import("@/pages/admin/professionals"));
const AdminProfessionalView = lazy(() => import("@/pages/admin/professional-view"));
const AddProfessional = lazy(() => import("@/pages/admin/add-professional"));
const EditProfessional = lazy(() => import("@/pages/admin/edit-professional"));
const AdminReviews = lazy(() => import("@/pages/admin/reviews"));
const AdminCategories = lazy(() => import("@/pages/admin/categories"));
const AdminSubscriptions = lazy(() => import("@/pages/admin/subscriptions"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const ClaimRequests = lazy(() => import("@/pages/admin/claim-requests"));
const AuditLogs = lazy(() => import("@/pages/admin/audit-logs"));

// Pagine di test
const FeatureGatingTest = lazy(() => import("./pages/feature-gating-test"));

// ============================================================================
// LOADING COMPONENT
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

// ============================================================================
// ROUTER CON CODE SPLITTING
// ============================================================================

function Router() {
  console.log('[App] Router montato');
  useAuthPersistence();
  const { isLoading } = useAuth();
  console.log('[App] isLoading:', isLoading);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/search" component={SearchPage} />
          <Route path="/professionals" component={Professionals} />
          <Route path="/professionals/:id" component={ProfessionalProfile} />
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
          <Route path="/register-consumer" component={RegisterConsumer} />
          <Route path="/login" component={LoginPage} />
          <Route path="/verify-email" component={VerifyEmail} />
          <Route path="/verify-email/:token" component={VerifyEmail} />
          <Route path="/register-professional" component={RegisterProfessional} />
          
          {/* User Dashboard */}
          <Route path="/dashboard/user" component={UserDashboard} />
          
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
          <Route path="/admin/users" component={() => (
            <AdminLayout>
              <AdminUsers />
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
          
          {/* Catch-all route */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </RouteErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
