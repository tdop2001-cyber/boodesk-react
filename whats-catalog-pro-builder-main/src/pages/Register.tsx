
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, User, AtSign, Lock, Store } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      // In a real app, this would be an actual registration call
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-light-gray/20">
      <div className="py-4 px-6 bg-white shadow-sm">
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-brand-red" />
          <span className="font-semibold text-lg">
            WhatsCatalog<span className="text-brand-green">Pro</span>
          </span>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-md p-8 border border-brand-light-gray">
            <div className="text-center mb-6">
              <div className="bg-brand-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-brand-green" />
              </div>
              <h1 className="text-2xl font-bold text-brand-gray">Crie sua conta</h1>
              <p className="text-brand-gray/70 mt-2">
                Comece a vender pelo WhatsApp hoje mesmo
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50">
                    <User className="h-5 w-5" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50">
                    <AtSign className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da sua Loja</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50">
                    <Store className="h-5 w-5" />
                  </div>
                  <Input
                    id="storeName"
                    name="storeName"
                    placeholder="Nome da sua loja ou negócio"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp (com DDD)</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50">
                    <span className="text-sm font-medium">+55</span>
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="DDD + número"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-12"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-brand-green hover:bg-brand-green/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando sua conta..." : "Criar Conta Grátis"}
                </Button>
              </div>
            </form>
            
            <div className="text-center mt-6">
              <p className="text-brand-gray/70 text-sm">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-brand-red hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-brand-light-gray text-sm text-brand-gray/70 text-center">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link to="/terms" className="text-brand-green hover:underline">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link to="/privacy" className="text-brand-green hover:underline">
                Política de Privacidade
              </Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
