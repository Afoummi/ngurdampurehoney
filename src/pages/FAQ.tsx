import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo/SEO";
import { Loader2 } from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  quality: "Product & Quality",
  orders: "Orders & Delivery",
  support: "Support",
  general: "General",
};

export default function FAQ() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("faqs")
      .select("id, question, answer, category, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setFaqs((data as Faq[]) || []);
        setLoading(false);
      });
  }, []);

  const grouped = faqs.reduce<Record<string, Faq[]>>((acc, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).sort((a, b) => {
    const order = ["quality", "orders", "support", "general"];
    return order.indexOf(a) - order.indexOf(b);
  });

  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="FAQ — Ngurdam Pure Honey"
        description="Answers to common questions about Ngurdam Honey — purity, sourcing, storage, delivery and returns."
        path="/faq"
        jsonLd={faqJsonLd}
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-honey-cream/40 py-16 md:py-24">
          <div className="container text-center max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Help Centre</p>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mb-4">
              Frequently asked <span className="italic text-honey-deep">questions</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Everything you need to know about Ngurdam Honey — purity, sourcing, delivery and care.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container max-w-3xl space-y-12">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-honey-deep" />
              </div>
            ) : faqs.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No FAQs published yet.</p>
            ) : (
              groupKeys.map((key) => (
                <div key={key}>
                  <h2 className="font-display text-2xl md:text-3xl mb-4">
                    {CATEGORY_LABELS[key] || key}
                  </h2>
                  <Accordion type="single" collapsible className="bg-card rounded-2xl shadow-card border border-border/60 px-6">
                    {grouped[key].map((item) => (
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
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
