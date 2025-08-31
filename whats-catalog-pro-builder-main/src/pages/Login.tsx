
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Lock, AtSign, Play } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      // In a real app, this would be an actual authentication call
      if (email === "demo@example.com" && password === "password") {
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      } else {
        toast.error("Email ou senha inválidos.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Authentication Area (40%) */}
      <div className="w-full md:w-2/5 bg-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8 flex items-center">
            <ShoppingBag className="h-8 w-8 text-brand-red mr-2" />
            <div>
              <div className="font-semibold text-xl">
                WhatsCatalog<span className="text-brand-green">Pro</span>
              </div>
              <p className="text-sm text-brand-gray/70">Venda direto pelo WhatsApp</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50">
                  <AtSign className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-brand-red hover:bg-brand-red/90"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Acessar"}
            </Button>
          </form>
          
          <div className="mt-4 flex justify-between">
            <Link to="/reset-password" className="text-sm text-brand-gray/70 hover:text-brand-gray">
              Esqueci minha senha
            </Link>
            <Link to="/register" className="text-sm text-brand-green hover:text-brand-green/90 font-medium">
              Criar conta
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-brand-light-gray">
            <p className="text-xs text-brand-gray/60 text-center">
              Para fins de demonstração, você pode usar:<br />
              Email: <span className="font-medium">demo@example.com</span><br />
              Senha: <span className="font-medium">password</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Demonstration Area (60%) */}
      <div className="w-full md:w-3/5 bg-brand-light-gray/20 p-8 flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full">
          {/* Video Container */}
          <div className="relative aspect-video bg-black/5 rounded-xl overflow-hidden border border-brand-light-gray cursor-pointer group">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-brand-red w-16 h-16 flex items-center justify-center text-white group-hover:bg-brand-red/90 transition-colors z-10">
                <Play className="h-8 w-8 ml-1" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end">
              <div className="p-4 text-white font-medium text-center w-full">
                Assista e veja como funciona (30s)
              </div>
            </div>
            {/* Placeholder thumbnail - in a real app, this would be an actual image */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-brand-green/20 z-0"></div>
          </div>
          
          {/* Bullet Points */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start">
              <div className="bg-brand-red/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-red font-semibold">1</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-brand-gray">Crie seu catálogo em 2 minutos</h3>
                <p className="text-sm text-brand-gray/70">Upload de produtos simples e rápido</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-brand-green/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-green font-semibold">2</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-brand-gray">Receba pedidos automaticamente</h3>
                <p className="text-sm text-brand-gray/70">Mensagens formatadas direto no seu WhatsApp</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-brand-gray/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-gray font-semibold">3</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-brand-gray">Sem mensalidade nos primeiros 7 dias</h3>
                <p className="text-sm text-brand-gray/70">Teste todas as funcionalidades sem compromisso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
