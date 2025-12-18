import { Leaf, Truck, Shield, Heart } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Pure, unprocessed honey straight from the hive with no additives or preservatives.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and reliable delivery across Nigeria. Your honey arrives fresh at your doorstep.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "Rigorous quality testing ensures every jar meets our premium standards.",
  },
  {
    icon: Heart,
    title: "Health Benefits",
    description: "Rich in antioxidants and nutrients, our honey supports your overall wellness.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-gradient">AB Sardauna</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to bringing you the finest quality honey with unmatched purity and taste.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
