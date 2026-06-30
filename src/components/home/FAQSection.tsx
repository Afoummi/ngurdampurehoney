import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is Ngurdam Honey 100% pure and raw?",
    a: "Yes. Every jar contains nothing but raw, unfiltered honey harvested from the highlands of Gembu, Sardauna LGA, Taraba State. No sugar, no syrup, no additives — ever. NAFDAC Registered (A8-121062L).",
  },
  {
    q: "Where does Ngurdam Honey come from?",
    a: "Our honey is sourced from experienced local beekeepers in the highlands of Gembu, Sardauna Local Government Area, Taraba State. It is then carefully processed, quality-checked, and professionally packaged in Sokoto by AB Sardauna Ngurdam Ventures.",
  },
  {
    q: "How can I tell that my honey is authentic?",
    a: "Pure honey crystallizes naturally over time, has a thick golden viscosity, and pours in unbroken strands. Each batch is independently lab-tested for purity.",
  },
  {
    q: "How long does Ngurdam Honey last?",
    a: "Properly stored in a cool, dry place, honey lasts indefinitely. If it crystallizes, gently warm the jar in warm water to restore its smooth texture.",
  },
  {
    q: "Do you deliver across Nigeria?",
    a: "Yes — we deliver nationwide. After you submit your order, we confirm delivery details and timing with you directly on WhatsApp.",
  },
  {
    q: "What sizes are available?",
    a: "We bottle Ngurdam Honey in multiple sizes: 1 Litre, 2 Litre, 4 Litre, 5 Litre Jerrycan, 10 Litre and 20 Litre Gallon — perfect for households and bulk buyers.",
  },
  {
    q: "How does checkout work?",
    a: "Add the products you want to your cart, fill in your delivery details on the checkout page, and complete the order on WhatsApp. We confirm payment and delivery with you in real time.",
  },
  {
    q: "Can I return or exchange my order?",
    a: "If your jar arrives damaged or you receive the wrong item, contact us within 48 hours and we'll arrange a replacement at no cost.",
  },
  {
    q: "Do you offer wholesale or bulk pricing?",
    a: "Yes — for shops, hotels, gift hampers and corporate gifting, send a message via WhatsApp or email and we'll send you a wholesale price list.",
  },
];

export function FAQSection() {
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
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left font-display text-lg hover:no-underline py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
