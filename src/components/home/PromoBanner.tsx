import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-honey-gradient text-primary-foreground">
      <div className="container py-3">
        <div className="flex items-center justify-center gap-4 text-sm md:text-base">
          <span className="animate-pulse">🍯</span>
          <p className="font-medium">
            <span className="hidden sm:inline">Limited Time Offer: </span>
            <span className="font-bold">20% OFF</span> your first order! Use code{" "}
            <span className="font-mono bg-white/20 px-2 py-0.5 rounded">HONEY20</span>
          </p>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
          >
            <Link to="/products">Shop Now</Link>
          </Button>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
