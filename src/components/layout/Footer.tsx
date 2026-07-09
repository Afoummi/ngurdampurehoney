import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Footer() {
  const { business, social, footer } = useSiteSettings();
  return (
    <footer className="bg-forest-gradient text-primary-foreground mt-auto">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand block */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <p className="font-display text-3xl text-honey">{business.product_name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-honey/70 mt-1">{business.legal_name}</p>
            </div>
            <p className="text-sm text-primary-foreground/75 leading-relaxed max-w-sm">
              {footer.about}
            </p>

            <div>
              <h4 className="font-display text-lg text-honey mb-2">Newsletter</h4>
              <NewsletterForm />
              <p className="text-xs text-primary-foreground/60 mt-2">
                Get new product drops &amp; exclusive offers.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              {social.facebook && social.facebook !== "#" && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-honey hover:border-honey hover:text-honey-foreground transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {social.instagram && social.instagram !== "#" && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-honey hover:border-honey hover:text-honey-foreground transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social.twitter && social.twitter !== "#" && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X"
                  className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-honey hover:border-honey hover:text-honey-foreground transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>


          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl text-honey mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products" className="text-primary-foreground/80 hover:text-honey transition-colors">All Products</Link></li>
              <li><Link to="/about" className="text-primary-foreground/80 hover:text-honey transition-colors">Our Story</Link></li>
              <li><Link to="/blog" className="text-primary-foreground/80 hover:text-honey transition-colors">Journal</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/80 hover:text-honey transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl text-honey mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/faq" className="text-primary-foreground/80 hover:text-honey transition-colors">FAQs</Link></li>
              <li><Link to="/track-order" className="text-primary-foreground/80 hover:text-honey transition-colors">Track Order</Link></li>
              <li><Link to="/shipping" className="text-primary-foreground/80 hover:text-honey transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/returns" className="text-primary-foreground/80 hover:text-honey transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/80 hover:text-honey transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="font-display text-xl text-honey mb-4">Visit &amp; Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-primary-foreground/85">
                <MapPin className="w-4 h-4 mt-0.5 text-honey flex-shrink-0" />
                <span>
                  <span className="block text-honey/90 text-xs uppercase tracking-wider mb-0.5">Honey Origin</span>
                  Gembu, Sardauna LGA,<br />Taraba State, Nigeria.
                </span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/85">
                <MapPin className="w-4 h-4 mt-0.5 text-honey flex-shrink-0" />
                <span>
                  <span className="block text-honey/90 text-xs uppercase tracking-wider mb-0.5">Packaging & Office</span>
                  {business.address_line1},<br />
                  {business.address_line2},<br />
                  {business.address_line3}.
                </span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/85">
                <Phone className="w-4 h-4 mt-0.5 text-honey flex-shrink-0" />
                <span>
                  {business.phones.map((p, i) => (
                    <span key={i}>
                      <a href={`tel:${p}`} className="hover:text-honey">{p}</a>
                      {i < business.phones.length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/85">
                <Mail className="w-4 h-4 text-honey flex-shrink-0" />
                <a href={`mailto:${business.email}`} className="hover:text-honey break-all">{business.email}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-primary-foreground/60">
          <p>
            &copy; {new Date().getFullYear()} {business.legal_name}. All rights reserved.
            <span className="block md:inline md:ml-2 text-honey/80">NAFDAC Reg. No. {business.nafdac_number}</span>
          </p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-honey">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-honey">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
