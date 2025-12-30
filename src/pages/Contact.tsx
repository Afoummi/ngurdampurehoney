import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent!", {
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-card py-12 md:py-20">
          <div className="container text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Have questions about our honey products? Want to place a bulk order? 
              We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border-border/50">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-display text-2xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      <Send className="w-4 h-4 mr-2" /> Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Contact Information</h2>
                <p className="text-muted-foreground">
                  Reach out to us through any of these channels. We're here to help!
                </p>

                <div className="space-y-4">
                  {[
                    {
                      icon: Mail,
                      title: "Email",
                      info: "sardaunannigeria@gmail.com",
                      description: "We reply within 24 hours",
                    },
                    {
                      icon: Phone,
                      title: "Phone",
                      info: "08027798163 / 08035890705",
                      description: "Mon-Fri, 9am-5pm WAT",
                    },
                    {
                      icon: MapPin,
                      title: "Address",
                      info: "Sokoto, Nigeria",
                      description: "Visit by appointment",
                    },
                    {
                      icon: Clock,
                      title: "Business Hours",
                      info: "Monday - Friday",
                      description: "9:00 AM - 5:00 PM WAT",
                    },
                  ].map((item, index) => (
                    <Card key={index} className="border-border/50">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-foreground">{item.info}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* FAQ Prompt */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-lg mb-2">Looking for quick answers?</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Check our FAQ section for common questions about shipping, returns, and our products.
                    </p>
                    <Button variant="outline">View FAQs</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
