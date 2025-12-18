import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amina Ibrahim",
    location: "Lagos",
    rating: 5,
    text: "The best honey I've ever tasted! AB Sardauna's honey is incredibly pure and delicious. I use it every morning with my tea.",
  },
  {
    name: "Chidi Okonkwo",
    location: "Abuja",
    rating: 5,
    text: "Finally found a honey brand I can trust. The quality is consistent, and the delivery is always prompt. Highly recommend!",
  },
  {
    name: "Fatima Yusuf",
    location: "Kano",
    rating: 5,
    text: "My family has been using AB Sardauna honey for months now. It's become an essential part of our kitchen. Pure and natural!",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-gradient">Customers</span> Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our valued customers have to say about our honey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 space-y-4">
                <Quote className="w-8 h-8 text-primary/30" />
                <p className="text-muted-foreground">{testimonial.text}</p>
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
