import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, XCircle, Clock, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Review {
  id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  product_id: string;
  products: {
    name: string;
  };
}

export const ReviewsTab = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingReview, setProcessingReview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews((data || []) as Review[]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as avaliações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: "approved" | "rejected") => {
    setProcessingReview(reviewId);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", reviewId);

      if (error) throw error;

      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, status } : review
      ));

      toast({
        title: "Sucesso",
        description: `Avaliação ${status === "approved" ? "aprovada" : "rejeitada"} com sucesso.`,
      });
    } catch (error) {
      console.error("Error updating review status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da avaliação.",
        variant: "destructive",
      });
    } finally {
      setProcessingReview(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>;
      case "approved":
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Aprovada</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejeitada</Badge>;
      default:
        return null;
    }
  };

  const pendingReviews = reviews.filter(r => r.status === "pending");
  const approvedReviews = reviews.filter(r => r.status === "approved");
  const rejectedReviews = reviews.filter(r => r.status === "rejected");

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Moderação de Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingReviews.length}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{approvedReviews.length}</div>
              <div className="text-sm text-muted-foreground">Aprovadas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{rejectedReviews.length}</div>
              <div className="text-sm text-muted-foreground">Rejeitadas</div>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{review.customer_name}</h4>
                    <p className="text-sm text-muted-foreground">{review.customer_email}</p>
                    <p className="text-sm text-muted-foreground">
                      Produto: {review.products.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(review.status)}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium">{review.rating}/5</span>
                </div>
                
                {review.comment && (
                  <p className="text-muted-foreground mb-4">{review.comment}</p>
                )}

                {review.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateReviewStatus(review.id, "approved")}
                      disabled={processingReview === review.id}
                      className="gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateReviewStatus(review.id, "rejected")}
                      disabled={processingReview === review.id}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma avaliação encontrada.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};