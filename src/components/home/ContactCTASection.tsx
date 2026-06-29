import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export function ContactCTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="bg-forest-gradient rounded-3xl overflow-hidden shadow-lift">
          <div className="grid lg:grid-cols-2 gap-10 p-10 md:p-16">
            <div className="space-y-6 text-primary-foreground">
              <p className="text-xs uppercase tracking-[0.2em] text-honey font-medium">Get in Touch</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight text-honey-cream">
                Questions? We're a <span className="italic">message away.</span>
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed text-lg max-w-md">
                Talk to us directly on WhatsApp for orders, bulk pricing, and product
                advice — usually within minutes.
              </p>
              <Button
                asChild
                variant="honey"
                size="lg"
              >
                <a href={`https://wa.me/${BRAND.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-1" /> Chat on WhatsApp
                </a>
              </Button>
            </div>

            <ul className="space-y-5 text-primary-foreground">
              <ContactRow icon={MapPin} label="Visit Us">
                {BRAND.address.line1}<br />
                {BRAND.address.line2}<br />
                {BRAND.address.line3}.
              </ContactRow>
              <ContactRow icon={Phone} label="Call Us">
                <a href={`tel:${BRAND.phones[0]}`} className="hover:text-honey">{BRAND.phones[0]}</a>
                <br />
                <a href={`tel:${BRAND.phones[1]}`} className="hover:text-honey">{BRAND.phones[1]}</a>
              </ContactRow>
              <ContactRow icon={Mail} label="Email Us">
                <a href={`mailto:${BRAND.email}`} className="hover:text-honey break-all">{BRAND.email}</a>
              </ContactRow>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 items-start bg-primary-foreground/5 rounded-2xl p-5 border border-primary-foreground/10">
      <div className="w-11 h-11 rounded-xl bg-honey/15 text-honey flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="leading-relaxed">
        <p className="text-xs uppercase tracking-[0.15em] text-honey/80 mb-1">{label}</p>
        <div className="text-primary-foreground/90 text-sm">{children}</div>
      </div>
    </li>
  );
}
