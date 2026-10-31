import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { useSiteMedia } from "@/hooks/useSiteMedia";
import { SEO } from "@/components/seo/SEO";
import { ResolvedImage } from "@/components/common/ResolvedImage";
import wellness from "@/assets/photos/wellness.jpg";
import drip from "@/assets/photos/drip.jpg";
import beekeeper from "@/assets/photos/beekeeper.jpg";
import lifestyle from "@/assets/photos/lifestyle.jpg";
import honeycomb from "@/assets/photos/honeycomb.jpg";
import jarsLineup from "@/assets/photos/jars-lineup.jpg";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

const FALLBACK_POSTS: BlogPost[] = [
  { id: 1, title: "The Health Benefits of Raw Nigerian Honey", excerpt: "Discover the amazing health benefits of consuming raw, unprocessed honey from Nigerian apiaries.", date: "December 15, 2024", category: "Health", image: wellness },
  { id: 2, title: "How to Identify Pure Honey: A Complete Guide", excerpt: "Learn the simple at-home tests to check if your honey is truly pure and unprocessed.", date: "December 10, 2024", category: "Education", image: drip },
  { id: 3, title: "Meet Our Beekeepers: Stories from the Field", excerpt: "Behind the scenes with the beekeepers in the highlands of Gembu, Taraba State.", date: "December 5, 2024", category: "Community", image: beekeeper },
  { id: 4, title: "5 Delicious Recipes Using Nigerian Honey", excerpt: "Creative, easy ways to weave pure honey into your daily meals.", date: "November 28, 2024", category: "Recipes", image: lifestyle },
  { id: 5, title: "The Importance of Bees in Our Ecosystem", excerpt: "Why bees matter and how supporting beekeepers preserves them.", date: "November 20, 2024", category: "Environment", image: honeycomb },
  { id: 6, title: "Honey Storage Tips: Keeping Your Honey Fresh", excerpt: "Best practices for storing honey to maintain flavor and nutrition for years.", date: "November 15, 2024", category: "Tips", image: jarsLineup },
];

export default function Blog() {
  const { entries } = useSiteMedia("blog_featured");
  const posts: BlogPost[] = entries.length > 0
    ? entries.map((e, i) => ({
        id: i + 1,
        title: e.title || "Untitled",
        excerpt: e.caption || "",
        date: new Date(e.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        category: e.subtitle || "Journal",
        image: e.image_url,
      }))
    : FALLBACK_POSTS;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Journal — Ngurdam Honey Stories, Health & Recipes"
        description="Stories from the apiary — health benefits of raw honey, recipes, beekeeper interviews, and honey care tips from Ngurdam."
        path="/blog"
      />
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-honey-cream py-16 md:py-24">
          <div className="container text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Journal</p>
            <h1 className="font-display text-5xl md:text-6xl mb-5 leading-tight">
              Stories from the <span className="italic text-honey-deep">apiary</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Insights, recipes, and dispatches from Gembu — the home of Ngurdam Honey.
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="border-border/60 hover:border-honey/40 transition-all duration-500 hover:shadow-lift group overflow-hidden rounded-2xl">
                  <CardHeader className="p-0">
                    <div className="aspect-[4/3] overflow-hidden bg-honey-cream">
                      <ResolvedImage
                        image={post.image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-honey-cream text-honey-deep font-medium uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl leading-tight group-hover:text-honey-deep transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <Button variant="link" className="p-0 h-auto text-honey-deep">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-honey-cream/60">
          <div className="container max-w-xl mx-auto text-center space-y-5">
            <h2 className="font-display text-3xl md:text-4xl">Stay in the hive</h2>
            <p className="text-muted-foreground">
              New recipes, seasonal harvests, and exclusive offers — straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
