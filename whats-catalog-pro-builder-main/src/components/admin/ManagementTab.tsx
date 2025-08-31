
import { useState } from "react";
import { 
  Edit, Ban, MoreHorizontal, ChevronDown,
  CheckCircle2, XCircle, Filter
} from "lucide-react";
import { 
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Sample data
const sellers = [
  { 
    id: 1, 
    name: "João Silva", 
    plan: "Pro", 
    status: "active", 
    createdAt: "2023-04-15T10:30:00Z",
    lastLogin: "2023-05-10T14:45:00Z",
    storeUrl: "joao-loja" 
  },
  { 
    id: 2, 
    name: "Maria Souza", 
    plan: "Basic", 
    status: "active", 
    createdAt: "2023-03-22T09:15:00Z",
    lastLogin: "2023-05-09T11:20:00Z",
    storeUrl: "maria-store" 
  },
  { 
    id: 3, 
    name: "Carlos Oliveira", 
    plan: "Pro", 
    status: "inactive", 
    createdAt: "2023-02-10T16:45:00Z",
    lastLogin: "2023-04-01T08:30:00Z",
    storeUrl: "carlosshop" 
  },
  { 
    id: 4, 
    name: "Ana Pereira", 
    plan: "Basic", 
    status: "active", 
    createdAt: "2023-04-05T13:50:00Z",
    lastLogin: "2023-05-10T10:15:00Z",
    storeUrl: "ana-catalog" 
  },
  { 
    id: 5, 
    name: "Roberto Almeida", 
    plan: "Pro", 
    status: "active", 
    createdAt: "2023-01-30T11:25:00Z",
    lastLogin: "2023-05-08T15:40:00Z",
    storeUrl: "roberto-loja" 
  },
];

const ManagementTab = () => {
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter the sellers based on the selected filters
  const filteredSellers = sellers.filter(seller => {
    // Filter by plan
    if (planFilter !== "all" && seller.plan.toLowerCase() !== planFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && seller.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !seller.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Format date to Brazilian format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle>Vendedores</CardTitle>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full sm:w-44"
            />
          </div>
          <div className="flex flex-row space-x-2">
            <Select
              value={planFilter}
              onValueChange={setPlanFilter}
            >
              <SelectTrigger className="h-9 w-[120px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Plano" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="h-9 w-[120px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>URL da Loja</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.length > 0 ? (
                filteredSellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell>
                      <Badge variant={seller.plan === "Pro" ? "pro" : "basic"} className="capitalize">
                        {seller.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {seller.status === "active" ? (
                        <div className="flex items-center">
                          <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-500" />
                          <span>Ativo</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="mr-1.5 h-4 w-4 text-red-500" />
                          <span>Inativo</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(seller.createdAt)}</TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate">
                        {seller.storeUrl}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          {seller.status === "active" ? (
                            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Banir</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="cursor-pointer text-green-500 focus:text-green-500">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              <span>Ativar</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum vendedor encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagementTab;
