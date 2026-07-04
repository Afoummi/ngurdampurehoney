import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
}

const FALLBACK: Faq[] = [
  { id: "1", question: "Is Ngurdam Honey 100% pure?", answer: "Yes. Every jar is 100% pure, unprocessed and NAFDAC registered." },
  { id: "2", question: "Where is the honey sourced?", answer: "From the highlands of Gembu, Sardauna LGA, Taraba State." },
  { id: "3", question: "Does natural honey crystallize?", answer: "Yes — it's a sign of purity. Warm the jar gently to restore." },
  { id: "4", question: "How do I place an order?", answer: "Add products to cart, checkout, and confirm on WhatsApp." },
];

export function FAQSection() {
  const [items, setItems] = useState<Faq[]>(FALLBACK);

  useEffect(() => {
    supabase
      .from("faqs")
      .select("id, question, answer")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as Faq[]);
      });
  }, []);

  return (
    <section className="py-20 md:py-28 bg-honey-cream/40">
      <div className="container max-w-4xl">
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">FAQs</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            Frequently asked <span className="italic text-honey-deep">questions</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="bg-card rounded-2xl shadow-card border border-border/60 px-6">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-border/60">
              <AccordionTrigger className="text-left font-display text-lg hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link to="/faq">View all FAQs <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
