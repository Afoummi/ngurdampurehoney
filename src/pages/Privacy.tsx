import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BRAND } from "@/lib/brand";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Legal</p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</p>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <Section title="Who we are">
              {BRAND.legalName} (&quot;Ngurdam Honey&quot;, &quot;we&quot;, &quot;us&quot;) operates this website and the
              Ngurdam Honey product line. Our office is at {BRAND.address.line1}, {BRAND.address.line2},
              {" "}{BRAND.address.line3}.
            </Section>
            <Section title="Information we collect">
              We collect information you give us when you create an account, place an order,
              or subscribe to our newsletter — including name, phone, email, and delivery
              address. We also collect basic technical data (device, browser, pages visited)
              to improve our service.
            </Section>
            <Section title="How we use your information">
              We use your information to process orders, deliver products, communicate with
              you about your order, send newsletters you've opted into, and improve our
              website and services.
            </Section>
            <Section title="Who we share it with">
              We never sell your personal data. We share information only with trusted
              service providers (delivery partners, payment processors, analytics) who help
              us run our business, and only as needed to provide the service.
            </Section>
            <Section title="Your rights">
              You can request access, correction, or deletion of your personal data at any
              time by emailing {BRAND.email}.
            </Section>
            <Section title="Cookies">
              We use essential cookies for cart and authentication. Analytics cookies are
              used only with your consent.
            </Section>
            <Section title="Contact">
              Questions about this policy? Email us at{" "}
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
