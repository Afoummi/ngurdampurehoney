import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BRAND } from "@/lib/brand";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Legal</p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight mb-4">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</p>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <Section title="Agreement">
              By using this website you agree to these terms. They apply to all visitors,
              users, and customers of {BRAND.legalName}.
            </Section>
            <Section title="Orders & Pricing">
              All prices are in Nigerian Naira (₦) and include applicable taxes. We reserve
              the right to refuse or cancel any order. Orders are confirmed once payment is
              verified on WhatsApp.
            </Section>
            <Section title="Delivery">
              We deliver nationwide. Delivery fees and timing are confirmed with you on
              WhatsApp before dispatch. Delays caused by carriers, weather, or third parties
              are outside our control.
            </Section>
            <Section title="Returns">
              If your jar arrives damaged or you receive the wrong item, contact us within
              48 hours of delivery for a replacement at no extra cost. Open or used jars are
              not eligible for return.
            </Section>
            <Section title="Product Information">
              We aim to display product images and descriptions accurately. Natural honey
              varies in color, texture and crystallization — this is normal and does not
              affect quality.
            </Section>
            <Section title="Limitation of Liability">
              {BRAND.legalName} is not liable for indirect or consequential losses arising
              from use of our website or products.
            </Section>
            <Section title="Governing Law">
              These terms are governed by the laws of the Federal Republic of Nigeria.
            </Section>
            <Section title="Contact">
              Questions? Email{" "}
              <a href={`mailto:${BRAND.email}`} className="text-honey-deep underline">{BRAND.email}</a> or call {BRAND.phones[0]}.
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
      <p>{children}</p>
    </div>
  );
}
