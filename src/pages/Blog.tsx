import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "The Health Benefits of Raw Nigerian Honey",
    excerpt: "Discover the amazing health benefits of consuming raw, unprocessed honey from Nigerian apiaries. From boosting immunity to healing wounds, honey is nature's medicine.",
    date: "December 15, 2024",
    category: "Health",
    image: "🍯",
  },
  {
    id: 2,
    title: "How to Identify Pure Honey: A Complete Guide",
    excerpt: "Learn the simple tests you can do at home to check if your honey is pure and unprocessed. Don't be fooled by adulterated products.",
    date: "December 10, 2024",
    category: "Education",
    image: "🔍",
  },
  {
    id: 3,
    title: "Meet Our Beekeepers: Stories from the Field",
    excerpt: "Go behind the scenes and meet the dedicated beekeepers who make AB Sardauna honey possible. Their stories of passion and commitment.",
    date: "December 5, 2024",
    category: "Community",
    image: "🐝",
  },
  {
    id: 4,
    title: "5 Delicious Recipes Using Nigerian Honey",
    excerpt: "From breakfast to dinner, discover creative ways to incorporate pure honey into your daily meals. Easy recipes the whole family will love.",
    date: "November 28, 2024",
    category: "Recipes",
    image: "🍳",
  },
  {
    id: 5,
    title: "The Importance of Bees in Our Ecosystem",
    excerpt: "Understanding why bees are essential for our environment and how supporting local beekeepers helps preserve these vital pollinators.",
    date: "November 20, 2024",
    category: "Environment",
    image: "🌻",
  },
  {
    id: 6,
    title: "Honey Storage Tips: Keeping Your Honey Fresh",
    excerpt: "Learn the best practices for storing honey to maintain its quality, flavor, and nutritional value for years to come.",
    date: "November 15, 2024",
    category: "Tips",
    image: "📦",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-card py-12 md:py-20">
          <div className="container text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              The <span className="text-gradient">Honey</span> Blog
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover tips, recipes, health benefits, and stories from the world of honey and beekeeping.
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="h-48 bg-secondary/20 flex items-center justify-center text-6xl">
                      {post.image}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="max-w-xl mx-auto text-center space-y-6">
              <h2 className="font-display text-3xl font-bold">Stay Updated</h2>
              <p className="text-muted-foreground">
                Subscribe to our newsletter for the latest honey tips, recipes, and exclusive offers.
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
