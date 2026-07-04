import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  author_name: string;
  author_location: string | null;
  quote: string;
  rating: number;
}

const FALLBACK: Testimonial[] = [
  { id: "f1", author_name: "Amina Ibrahim", author_location: "Lagos", quote: "The best honey I've ever tasted. Incredibly pure and delicious.", rating: 5 },
  { id: "f2", author_name: "Chidi Okonkwo", author_location: "Abuja", quote: "Consistent quality and prompt delivery. Highly recommend.", rating: 5 },
  { id: "f3", author_name: "Fatima Yusuf", author_location: "Kano", quote: "A trusted part of our kitchen. Pure and natural.", rating: 5 },
];

export function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>(FALLBACK);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, author_name, author_location, quote, rating")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as Testimonial[]);
      });
  }, []);

  return (
    <section className="py-20 md:py-28 bg-honey-cream/40">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">Reviews</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            What our <span className="italic text-honey-deep">customers say</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Real reviews from Nigerian households who love Ngurdam Honey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.slice(0, 6).map((t) => (
            <Card key={t.id} className="border-border/60 shadow-card hover:shadow-lift transition-shadow">
              <CardContent className="p-6 space-y-4">
                <Quote className="w-8 h-8 text-honey-deep/30" />
                <p className="text-foreground leading-relaxed">"{t.quote}"</p>
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-honey text-honey" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">{t.author_name}</p>
                  {t.author_location && (
                    <p className="text-sm text-muted-foreground">{t.author_location}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
