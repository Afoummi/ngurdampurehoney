import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/TrackOrder";
import CustomerOrders from "./pages/account/Orders";
import NotFound from "./pages/NotFound";

// Admin
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/Overview";
import AnalyticsPage from "./pages/admin/Analytics";
import ReportsPage from "./pages/admin/Reports";
import SecurityPage from "./pages/admin/Security";
import AuditLogsPage from "./pages/admin/AuditLogs";
import { OrdersTab } from "./components/admin/OrdersTab";
import { ProductsTab } from "./components/admin/ProductsTab";
import { InventoryTab } from "./components/admin/InventoryTab";
import { CustomersTab } from "./components/admin/CustomersTab";
import { SubscribersTab } from "./components/admin/SubscribersTab";
import { PromoTab } from "./components/admin/PromoTab";
import { UsersTab } from "./components/admin/UsersTab";
import { SettingsTab } from "./components/admin/SettingsTab";
import { MediaTab } from "./components/admin/MediaTab";
import { TestimonialsTab } from "./components/admin/TestimonialsTab";
import { FaqsTab } from "./components/admin/FaqsTab";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Storefront */}
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/account/orders" element={<CustomerOrders />} />

            {/* Admin (full SaaS console) */}
            <Route path="/admin" element={<AdminLayout variant="admin" />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="orders" element={<OrdersTab onOrderUpdate={() => {}} />} />
              <Route path="products" element={<ProductsTab canDelete canCreate />} />
              <Route path="media" element={<MediaTab />} />
              <Route path="inventory" element={<InventoryTab />} />
              <Route path="customers" element={<CustomersTab canManageRoles />} />
              <Route path="newsletter" element={<SubscribersTab />} />
              <Route path="promos" element={<PromoTab />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<UsersTab />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="settings" element={<SettingsTab />} />
              <Route path="testimonials" element={<TestimonialsTab />} />
              <Route path="faqs" element={<FaqsTab />} />
            </Route>

            {/* Moderator (restricted) */}
            <Route path="/moderator" element={<AdminLayout variant="moderator" />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="orders" element={<OrdersTab onOrderUpdate={() => {}} />} />
              <Route path="inventory" element={<InventoryTab />} />
              <Route path="customers" element={<CustomersTab canManageRoles={false} />} />
              <Route path="newsletter" element={<SubscribersTab />} />
              <Route path="products" element={<ProductsTab canDelete={false} canCreate />} />
              <Route path="media" element={<MediaTab />} />

            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
