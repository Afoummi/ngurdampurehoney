import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Plus, Trash2, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { logAudit } from "@/lib/audit";

export function SettingsTab() {
  const { user, userRole } = useAuth();
  const { business, social, footer, reload, isLoading } = useSiteSettings();

  const [biz, setBiz] = useState(business);
  const [soc, setSoc] = useState(social);
  const [foot, setFoot] = useState(footer);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { setBiz(business); }, [business]);
  useEffect(() => { setSoc(social); }, [social]);
  useEffect(() => { setFoot(footer); }, [footer]);

  const saveKey = async (key: string, value: any) => {
    setSaving(key);
    const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    setSaving(null);
    if (error) toast.error(error.message);
    else {
      void logAudit({ action: "settings_changed", resourceType: "site_settings", resourceId: key });
      toast.success("Settings saved");
      reload();
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-honey-deep" /></div>;

  return (
    <div className="space-y-6">
      {/* Business info */}
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl flex items-center gap-2"><Building2 className="w-5 h-5 text-honey-deep" />Business Information</CardTitle>
          <CardDescription>Shown across the website, footer, receipts and emails.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div><Label>Legal Name</Label><Input value={biz.legal_name} onChange={(e) => setBiz({ ...biz, legal_name: e.target.value })} /></div>
          <div><Label>Brand / Product Name</Label><Input value={biz.product_name} onChange={(e) => setBiz({ ...biz, product_name: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Tagline</Label><Input value={biz.tagline} onChange={(e) => setBiz({ ...biz, tagline: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={biz.email} onChange={(e) => setBiz({ ...biz, email: e.target.value })} /></div>
          <div><Label>WhatsApp Number (E.164, digits only)</Label><Input value={biz.whatsapp} onChange={(e) => setBiz({ ...biz, whatsapp: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <Label>Phone Numbers</Label>
            {biz.phones.map((p, i) => (
              <div key={i} className="flex gap-2 mt-2">
                <Input value={p} onChange={(e) => { const c = [...biz.phones]; c[i] = e.target.value; setBiz({ ...biz, phones: c }); }} />
                <Button variant="ghost" size="icon" onClick={() => setBiz({ ...biz, phones: biz.phones.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setBiz({ ...biz, phones: [...biz.phones, ""] })}><Plus className="h-4 w-4 mr-1" />Add phone</Button>
          </div>
          <div><Label>Address Line 1</Label><Input value={biz.address_line1} onChange={(e) => setBiz({ ...biz, address_line1: e.target.value })} /></div>
          <div><Label>Address Line 2</Label><Input value={biz.address_line2} onChange={(e) => setBiz({ ...biz, address_line2: e.target.value })} /></div>
          <div><Label>Address Line 3</Label><Input value={biz.address_line3} onChange={(e) => setBiz({ ...biz, address_line3: e.target.value })} /></div>
          <div><Label>NAFDAC Number</Label><Input value={biz.nafdac_number} onChange={(e) => setBiz({ ...biz, nafdac_number: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Honey Origin</Label><Input value={biz.origin} onChange={(e) => setBiz({ ...biz, origin: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <Label>Google Maps Embed URL</Label>
            <Input value={biz.map_embed_url} placeholder="https://www.google.com/maps/embed?pb=..." onChange={(e) => setBiz({ ...biz, map_embed_url: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">In Google Maps → Share → Embed a map → copy the src URL.</p>
          </div>
          <div className="sm:col-span-2">
            <Label>Business Hours</Label>
            {biz.hours.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mt-2">
                <Input placeholder="Day (e.g. Monday – Friday)" value={h.day} onChange={(e) => { const c = [...biz.hours]; c[i] = { ...c[i], day: e.target.value }; setBiz({ ...biz, hours: c }); }} />
                <Input placeholder="Hours (e.g. 9:00 AM – 6:00 PM)" value={h.hours} onChange={(e) => { const c = [...biz.hours]; c[i] = { ...c[i], hours: e.target.value }; setBiz({ ...biz, hours: c }); }} />
                <Button variant="ghost" size="icon" onClick={() => setBiz({ ...biz, hours: biz.hours.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setBiz({ ...biz, hours: [...biz.hours, { day: "", hours: "" }] })}><Plus className="h-4 w-4 mr-1" />Add row</Button>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => saveKey("business", biz)} disabled={saving === "business"}>
              {saving === "business" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Business Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social */}
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Social Media Links</CardTitle>
          <CardDescription>Displayed in the footer and Contact page. Leave blank or "#" to hide.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div><Label>Facebook</Label><Input value={soc.facebook} onChange={(e) => setSoc({ ...soc, facebook: e.target.value })} /></div>
          <div><Label>Instagram</Label><Input value={soc.instagram} onChange={(e) => setSoc({ ...soc, instagram: e.target.value })} /></div>
          <div><Label>X (Twitter)</Label><Input value={soc.twitter} onChange={(e) => setSoc({ ...soc, twitter: e.target.value })} /></div>
          <div><Label>TikTok</Label><Input value={soc.tiktok} onChange={(e) => setSoc({ ...soc, tiktok: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>WhatsApp URL</Label><Input value={soc.whatsapp} onChange={(e) => setSoc({ ...soc, whatsapp: e.target.value })} placeholder="https://wa.me/234..." /></div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => saveKey("social", soc)} disabled={saving === "social"}>
              {saving === "social" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Social Links
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Footer Content</CardTitle>
          <CardDescription>About text displayed in the site footer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>About / Description</Label><Textarea rows={3} value={foot.about} onChange={(e) => setFoot({ ...foot, about: e.target.value })} /></div>
          <div className="flex justify-end">
            <Button onClick={() => saveKey("footer", foot)} disabled={saving === "footer"}>
              {saving === "footer" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Footer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Your account */}
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Your Account</CardTitle>
          <CardDescription>Signed in as</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <Badge variant="outline" className="bg-honey-cream text-honey-deep border-honey/30 capitalize">{userRole}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
