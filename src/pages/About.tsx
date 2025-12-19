import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-card py-16 md:py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  The Story of <span className="text-gradient">Ngurdam Pure Honey</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  AB Sardauna was founded with a simple mission: to bring the purest, 
                  most authentic honey from Nigerian apiaries directly to your table. 
                  Our flagship product, Ngurdam Pure Honey, embodies our commitment to preserving nature's goodness.
                </p>
                <p className="text-muted-foreground">
                  Our journey began with a passion for natural, unprocessed foods and 
                  a desire to share the incredible taste of Nigerian honey with the world. 
                  Today, we work directly with local beekeepers who share our commitment 
                  to quality and sustainability.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-[hsl(var(--honey-gold))] to-[hsl(var(--honey-amber))] p-1">
                  <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                    <span className="text-[150px] animate-float">🐝</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything we do is guided by our commitment to quality, sustainability, and community.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Heart,
                  title: "Purity",
                  description: "100% natural honey with no additives, preservatives, or artificial processing.",
                },
                {
                  icon: Users,
                  title: "Community",
                  description: "Supporting local Nigerian beekeepers and their families through fair trade practices.",
                },
                {
                  icon: Target,
                  title: "Sustainability",
                  description: "Environmentally responsible practices that protect bees and their ecosystems.",
                },
                {
                  icon: Award,
                  title: "Quality",
                  description: "Rigorous testing and quality control to ensure the finest honey in every jar.",
                },
              ].map((value, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
                      <value.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-bold">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                "To deliver the purest, most delicious honey while supporting local 
                beekeeping communities and promoting sustainable agricultural practices 
                across Nigeria."
              </p>
              <div className="flex justify-center gap-8 pt-6">
                <div>
                  <p className="text-4xl font-bold text-primary">5+</p>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-4xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Partner Beekeepers</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-4xl font-bold text-primary">500+</p>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
