import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Returns() {
  const { business } = useSiteSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Legal</p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight mb-4">Return & Refund Policy</h1>
          <p className="text-muted-foreground mb-10">
            Our promise: if something isn't right, we make it right.
          </p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <Section title="Our quality guarantee">
              Every jar of Ngurdam Honey is inspected before dispatch. If your honey arrives
              damaged, leaking or is not as described, we'll replace or refund it — no
              questions asked.
            </Section>
            <Section title="Eligibility window">
              You have <span className="text-foreground font-medium">48 hours</span> from delivery to
              report any issue. Please keep the original packaging and take a clear photo of
              the damage to help us process your claim quickly.
            </Section>
            <Section title="What we accept">
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Broken, leaking or contaminated jars</li>
                <li>Wrong product or wrong size shipped</li>
                <li>Missing items from your order</li>
                <li>Products that don't match our published quality standards</li>
              </ul>
            </Section>
            <Section title="What we can't accept">
              For food safety reasons, we cannot accept returns of opened jars unless the
              product itself is faulty. Change-of-mind returns are not accepted once the seal
              is broken. Natural crystallization is not a defect and is easily reversed by
              gently warming the jar in warm water.
            </Section>
            <Section title="How to request a return or refund">
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Contact us on WhatsApp at {business.whatsapp} or email {business.email}</li>
                <li>Include your order number, a description of the issue and a photo</li>
                <li>We'll confirm your claim within 24 hours (business days)</li>
                <li>We arrange collection where needed and issue your replacement or refund</li>
              </ol>
            </Section>
            <Section title="Refund method">
              Refunds are issued to the original payment method within 5–7 business days of
              approval. For bank-transfer orders, we refund to the bank account you used.
            </Section>
            <Section title="Wholesale and bulk orders">
              Wholesale orders follow the same guarantee. For orders above 20 litres, please
              inspect the shipment on delivery and note any damage on the courier's delivery
              note before signing.
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
