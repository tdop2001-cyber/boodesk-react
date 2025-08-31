
import { useState } from "react";
import { 
  AlertCircle, CheckCircle, Clock, MessageSquare,
  ChevronDown, ArrowDown, ArrowUp, ArrowRight
} from "lucide-react";
import { 
  Card, CardContent, CardHeader, CardTitle,
  CardDescription, CardFooter 
} from "@/components/ui/card";
import { 
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data for tickets
const tickets = [
  {
    id: 1,
    title: "Não consigo criar produtos",
    customer: "João Silva",
    status: "open",
    priority: "high",
    createdAt: "2023-05-08T09:45:00Z",
    messages: [
      {
        id: 1,
        sender: "customer",
        content: "Estou tentando adicionar produtos ao meu catálogo mas recebo um erro toda vez. Podem me ajudar?",
        timestamp: "2023-05-08T09:45:00Z"
      }
    ]
  },
  {
    id: 2,
    title: "Dúvida sobre planos",
    customer: "Maria Souza",
    status: "in_progress",
    priority: "medium",
    createdAt: "2023-05-07T14:30:00Z",
    messages: [
      {
        id: 1,
        sender: "customer",
        content: "Gostaria de saber a diferença entre os planos Básico e Pro. Quais são as vantagens?",
        timestamp: "2023-05-07T14:30:00Z"
      },
      {
        id: 2,
        sender: "admin",
        content: "Olá Maria! O plano Pro oferece recursos adicionais como:\n\n- Sem limite de produtos\n- Domínio personalizado\n- Analytics avançado\n- Suporte prioritário\n\nPrecisa de mais informações?",
        timestamp: "2023-05-07T15:10:00Z"
      }
    ]
  },
  {
    id: 3,
    title: "Problema com pagamento",
    customer: "Carlos Oliveira",
    status: "resolved",
    priority: "high",
    createdAt: "2023-05-05T11:20:00Z",
    messages: [
      {
        id: 1,
        sender: "customer",
        content: "Meu cartão foi cobrado duas vezes este mês. Por favor, verifiquem e façam o reembolso.",
        timestamp: "2023-05-05T11:20:00Z"
      },
      {
        id: 2,
        sender: "admin",
        content: "Olá Carlos, verificamos o seu caso e realmente houve uma cobrança duplicada. O reembolso já foi processado e deve aparecer em sua fatura em até 7 dias úteis.",
        timestamp: "2023-05-05T14:15:00Z"
      },
      {
        id: 3,
        sender: "customer",
        content: "Obrigado pela rápida resolução!",
        timestamp: "2023-05-06T09:30:00Z"
      }
    ]
  },
  {
    id: 4,
    title: "Integração com WhatsApp",
    customer: "Ana Pereira",
    status: "open",
    priority: "low",
    createdAt: "2023-05-09T10:05:00Z",
    messages: [
      {
        id: 1,
        sender: "customer",
        content: "Como faço para integrar meu WhatsApp Business com o catálogo? Preciso de um tutorial passo a passo.",
        timestamp: "2023-05-09T10:05:00Z"
      }
    ]
  }
];

// Function to get the priority badge
const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "high":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ArrowUp className="h-3 w-3" />
          Alta
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-yellow-500">
          <ArrowRight className="h-3 w-3" />
          Média
        </Badge>
      );
    case "low":
      return (
        <Badge variant="secondary" className="flex items-center gap-1 text-gray-500">
          <ArrowDown className="h-3 w-3" />
          Baixa
        </Badge>
      );
    default:
      return null;
  }
};

// Function to get the status badge
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "open":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-red-500 text-red-500">
          <AlertCircle className="h-3 w-3" />
          Aberto
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-500">
          <Clock className="h-3 w-3" />
          Em Andamento
        </Badge>
      );
    case "resolved":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-500">
          <CheckCircle className="h-3 w-3" />
          Resolvido
        </Badge>
      );
    default:
      return null;
  }
};

const SupportTab = () => {
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [replyText, setReplyText] = useState<string>("");
  
  // Format date to Brazilian format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Filter tickets based on status
  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter === "all") return true;
    return ticket.status === statusFilter;
  });
  
  // Get selected ticket details
  const ticketDetails = tickets.find(ticket => ticket.id === selectedTicket);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Tickets List */}
      <div className="lg:col-span-5 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Tickets</CardTitle>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      className={`cursor-pointer ${selectedTicket === ticket.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      <TableCell>
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {ticket.customer} • {formatDate(ticket.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Nenhum ticket encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Ticket Details */}
      <div className="lg:col-span-7">
        <Card className="h-full flex flex-col">
          {ticketDetails ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{ticketDetails.title}</CardTitle>
                    <CardDescription className="mt-1">
                      De: {ticketDetails.customer} • {formatDate(ticketDetails.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          Status: {ticketDetails.status === "open" ? "Aberto" : 
                                   ticketDetails.status === "in_progress" ? "Em Andamento" : "Resolvido"}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                          <span>Aberto</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Clock className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Em Andamento</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span>Resolvido</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          Prioridade: {ticketDetails.priority === "high" ? "Alta" : 
                                      ticketDetails.priority === "medium" ? "Média" : "Baixa"}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                          <span>Alta</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArrowRight className="mr-2 h-4 w-4 text-yellow-500" />
                          <span>Média</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArrowDown className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Baixa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto">
                <div className="space-y-4">
                  {ticketDetails.messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender === "customer" 
                          ? "bg-muted border border-border" 
                          : "bg-brand-green/10 border border-brand-green/20"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">
                          {message.sender === "customer" ? ticketDetails.customer : "Administrador"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                      <div className="whitespace-pre-line">{message.content}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <div className="w-full space-y-3">
                  <Textarea 
                    placeholder="Digite sua resposta com suporte a Markdown..."
                    className="min-h-[100px] resize-none"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button className="bg-brand-green hover:bg-brand-green/90">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Responder
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center p-6 text-muted-foreground">
              Selecione um ticket para ver os detalhes
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SupportTab;
