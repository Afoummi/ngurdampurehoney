import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle, Send, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(formData.subject || "Enquiry from Ngurdam Honey website");
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`);
    window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app...");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-honey-cream/40 py-16 md:py-24">
          <div className="container text-center max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Contact</p>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mb-4">
              We'd love to <span className="italic text-honey-deep">hear from you</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Have questions about our honey, bulk orders, or partnerships? Reach out below or
              chat with us directly on WhatsApp.
            </p>
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
                        <Input id="name" required value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" required value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" required rows={5} value={formData.message}
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
                  <a href={`https://wa.me/${BRAND.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    className="text-honey-deep font-medium hover:underline">
                    Chat with us →
                  </a>
                </ContactCard>

                <ContactCard icon={Phone} label="Phone">
                  <a href={`tel:${BRAND.phones[0]}`} className="block hover:text-honey-deep">{BRAND.phones[0]}</a>
                  <a href={`tel:${BRAND.phones[1]}`} className="block hover:text-honey-deep">{BRAND.phones[1]}</a>
                </ContactCard>

                <ContactCard icon={Mail} label="Email">
                  <a href={`mailto:${BRAND.email}`} className="hover:text-honey-deep break-all">{BRAND.email}</a>
                </ContactCard>

                <ContactCard icon={MapPin} label="Office">
                  {BRAND.address.line1},<br />{BRAND.address.line2},<br />{BRAND.address.line3}.
                </ContactCard>

                <ContactCard icon={Clock} label="Hours">
                  Mon – Sat<br />9:00 AM – 6:00 PM WAT
                </ContactCard>
              </div>
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
        <div className="text-sm leading-relaxed">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
          <div className="text-foreground">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}
