import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SEO } from "@/components/seo/SEO";
import { z } from "zod";
import { checkRateLimit, rateLimitMessage } from "@/lib/rateLimit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  subject: z.string().trim().min(3, "Please add a subject").max(150, "Subject is too long"),
  message: z.string().trim().min(10, "Please write a longer message").max(2000, "Message is too long"),
});

export default function Contact() {
  const { business, social } = useSiteSettings();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = contactSchema.safeParse(formData);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    const limit = checkRateLimit("contact", 3, 10 * 60 * 1000);
    if (!limit.allowed) {
      toast.error(rateLimitMessage(limit.retryAfterSeconds));
      return;
    }

    const clean = parsed.data;
    const subject = encodeURIComponent(clean.subject);
    const body = encodeURIComponent(`Name: ${clean.name}\nEmail: ${clean.email}\n\n${clean.message}`);
    window.location.href = `mailto:${business.email}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app...");
  };

  const waNumber = business.whatsapp.replace(/[^\d]/g, "");
  const waUrl = `https://wa.me/${waNumber}`;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Contact Ngurdam Honey — WhatsApp, Phone & Email"
        description="Get in touch with AB Sardauna Ngurdam Ventures. Order on WhatsApp, call, or email us for enquiries about our pure Nigerian honey."
        path="/contact"
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-honey-cream/40 py-16 md:py-24">
          <div className="container text-center max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Contact</p>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mb-4">
              We'd love to <span className="italic text-honey-deep">hear from you</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Questions, bulk orders, or partnerships — reach out below or chat with us on WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="honey" size="lg">
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" /> WhatsApp us
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={`tel:${business.phones[0]}`}>
                  <Phone className="w-4 h-4" /> Call {business.phones[0]}
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid lg:grid-cols-5 gap-10">
              <Card className="lg:col-span-3 border-border/60 shadow-card">
                <CardContent className="p-6 md:p-10">
                  <h2 className="font-display text-3xl mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" required maxLength={100} value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required maxLength={255} value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" required maxLength={150} value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" required maxLength={2000} rows={5} value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                    </div>
                    <Button type="submit" variant="honey" size="lg" className="w-full">
                      <Send className="w-4 h-4" /> Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-display text-3xl">Reach us directly</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We typically reply within a few hours on weekdays.
                </p>

                <ContactCard icon={MessageCircle} label="WhatsApp" highlight>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="text-honey-deep font-medium hover:underline">
                    Chat with us →
                  </a>
                </ContactCard>

                <ContactCard icon={Phone} label="Phone">
                  {business.phones.map((p, i) => (
                    <a key={i} href={`tel:${p}`} className="block hover:text-honey-deep">{p}</a>
                  ))}
                </ContactCard>

                <ContactCard icon={Mail} label="Email">
                  <a href={`mailto:${business.email}`} className="hover:text-honey-deep break-all">{business.email}</a>
                </ContactCard>

                <ContactCard icon={MapPin} label="Office">
                  {business.address_line1},<br />{business.address_line2},<br />{business.address_line3}.
                </ContactCard>

                <ContactCard icon={Clock} label="Business Hours">
                  {business.hours.map((h, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{h.day}</span>
                      <span className="font-medium">{h.hours}</span>
                    </div>
                  ))}
                </ContactCard>

                <div className="flex gap-3 pt-2">
                  {social.facebook && social.facebook !== "#" && (
                    <SocialIcon href={social.facebook} label="Facebook"><Facebook className="w-4 h-4" /></SocialIcon>
                  )}
                  {social.instagram && social.instagram !== "#" && (
                    <SocialIcon href={social.instagram} label="Instagram"><Instagram className="w-4 h-4" /></SocialIcon>
                  )}
                  {social.twitter && social.twitter !== "#" && (
                    <SocialIcon href={social.twitter} label="X"><Twitter className="w-4 h-4" /></SocialIcon>
                  )}
                  {social.tiktok && social.tiktok !== "#" && (
                    <SocialIcon href={social.tiktok} label="TikTok">
                      <TikTokIcon />
                    </SocialIcon>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="container">
            <div className="rounded-3xl overflow-hidden border border-border/60 shadow-card bg-muted/30 aspect-[16/7]">
              {business.map_embed_url ? (
                <iframe
                  src={business.map_embed_url}
                  title="Ngurdam Honey location"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <MapPin className="w-10 h-10 text-honey-deep mb-3" />
                  <p className="font-display text-xl mb-1">Find us in Sokoto</p>
                  <p className="text-muted-foreground text-sm max-w-md">
                    {business.address_line1}, {business.address_line2}, {business.address_line3}.
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    (Map coming soon — admins can paste a Google Maps embed URL in Site Settings.)
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ContactCard({ icon: Icon, label, children, highlight }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <Card className={`border-border/60 ${highlight ? "ring-1 ring-honey/40 bg-honey-cream/40" : ""}`}>
      <CardContent className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-honey-cream flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-honey-deep" />
        </div>
        <div className="text-sm leading-relaxed flex-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
          <div className="text-foreground">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="w-10 h-10 rounded-full border border-border/60 bg-card flex items-center justify-center text-foreground/70 hover:bg-honey hover:border-honey hover:text-honey-foreground transition-colors">
      {children}
    </a>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.7 20.1a6.34 6.34 0 0 0 10.86-4.43V8.55a8.16 8.16 0 0 0 4.77 1.52V6.63a4.85 4.85 0 0 1-1.74-.05Z"/>
    </svg>
  );
}
