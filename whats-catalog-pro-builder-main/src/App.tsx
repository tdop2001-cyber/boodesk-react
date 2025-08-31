
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardMain from "./pages/DashboardMain";
import Products from "./pages/Products";
import Preview from "./pages/Preview";
import Reports from "./pages/Reports";
import Plans from "./pages/Plans";
import ComoFunciona from "./pages/ComoFunciona";
import Features from "./pages/Features";
import SellerDashboard from "./pages/SellerDashboard";
import SellerSettings from "./pages/SellerSettings";
import AdminDashboard from "./pages/AdminDashboard";
import CatalogPage from "./pages/CatalogPage";
import NotFound from "./pages/NotFound";

// Create a QueryClient once instead of on every render
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardMain />
                  </ProtectedRoute>
                } />
                <Route path="/products" element={<Products />} />
                <Route path="/preview" element={<Preview />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/como-funciona" element={<ComoFunciona />} />
                <Route path="/features" element={<Features />} />
                <Route path="/seller-dashboard" element={
                  <ProtectedRoute>
                    <SellerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/seller-settings" element={
                  <ProtectedRoute>
                    <SellerSettings />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/relatorios" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                {/* Catalog route - must be before catch-all */}
                <Route path="/catalogo/:slug" element={<CatalogPage />} />
                <Route path="/:slug" element={<CatalogPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
