import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Shipping() {
  const { business } = useSiteSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Legal</p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight mb-4">Shipping & Delivery</h1>
          <p className="text-muted-foreground mb-10">
            How Ngurdam Honey reaches you — nationwide, safely and on time.
          </p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <Section title="Delivery coverage">
              We deliver across all 36 states of Nigeria and the FCT. International shipping is
              available on request — please contact us on WhatsApp at {business.whatsapp} for a
              tailored quote.
            </Section>
            <Section title="Processing time">
              Orders are processed within <span className="text-foreground font-medium">1–2 business days</span> of
              payment confirmation. Bulk and wholesale orders may take 2–4 business days to prepare.
            </Section>
            <Section title="Delivery times">
              Typical delivery windows from our packaging facility in Sokoto:
              <ul className="list-disc pl-5 mt-3 space-y-1">
                <li>Within Sokoto: same day or next day</li>
                <li>Northern Nigeria: 2–3 business days</li>
                <li>Southern Nigeria (Lagos, Abuja, Port Harcourt, etc.): 3–5 business days</li>
                <li>Remote locations: up to 7 business days</li>
              </ul>
            </Section>
            <Section title="Delivery partners">
              We ship with reputable courier partners including GIG Logistics, DHL and dedicated
              transport services for bulk orders. Tracking details are shared on WhatsApp once
              your parcel is dispatched.
            </Section>
            <Section title="Shipping fees">
              Shipping costs depend on your location, order size and weight. We calculate and
              confirm the exact fee with you on WhatsApp before dispatch — no hidden charges.
            </Section>
            <Section title="Packaging">
              Every jar is sealed, wrapped in protective material and boxed to prevent breakage
              in transit. If your order arrives damaged, we replace it at no cost (see our
              Return & Refund Policy).
            </Section>
            <Section title="Questions?">
              Reach us on WhatsApp or email at {business.email} for anything shipping-related.
              We usually reply within a few hours during business days.
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
