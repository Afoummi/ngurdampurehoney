import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

interface PromoBanner {
  id: string;
  title: string;
  discount_text: string | null;
  promo_code: string | null;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean;
}

export function PromoTab() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_banners')
        .insert({
          title: 'New Promotion',
          discount_text: 'Get a special discount!',
          promo_code: 'PROMO',
          link_url: '/products',
          link_text: 'Shop Now',
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;
      setBanners([data, ...banners]);
      toast.success("Banner created");
    } catch (error) {
      console.error('Error creating banner:', error);
      toast.error("Failed to create banner");
    }
  };

  const handleUpdate = async (banner: PromoBanner) => {
    setSavingId(banner.id);
    try {
      const { error } = await supabase
        .from('promo_banners')
        .update({
          title: banner.title,
          discount_text: banner.discount_text,
          promo_code: banner.promo_code,
          link_url: banner.link_url,
          link_text: banner.link_text,
          is_active: banner.is_active
        })
        .eq('id', banner.id);

      if (error) throw error;
      toast.success("Banner updated");
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error("Failed to update banner");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('promo_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBanners(banners.filter(b => b.id !== id));
      toast.success("Banner deleted");
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error("Failed to delete banner");
    }
  };

  const updateBannerField = (id: string, field: keyof PromoBanner, value: string | boolean) => {
    setBanners(banners.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const handleToggleActive = async (banner: PromoBanner) => {
    const newActiveState = !banner.is_active;
    
    // If activating this banner, deactivate others first
    if (newActiveState) {
      const activeBanners = banners.filter(b => b.is_active && b.id !== banner.id);
      for (const activeBanner of activeBanners) {
        await supabase
          .from('promo_banners')
          .update({ is_active: false })
          .eq('id', activeBanner.id);
      }
      setBanners(banners.map(b => ({
        ...b,
        is_active: b.id === banner.id ? newActiveState : false
      })));
    } else {
      updateBannerField(banner.id, 'is_active', newActiveState);
    }

    try {
      const { error } = await supabase
        .from('promo_banners')
        .update({ is_active: newActiveState })
        .eq('id', banner.id);

      if (error) throw error;
      toast.success(newActiveState ? "Banner activated" : "Banner deactivated");
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error("Failed to update banner status");
      fetchBanners(); // Refresh to get correct state
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Promotional Banners</CardTitle>
            <CardDescription>
              Manage the promotional banner shown on the homepage. Only one banner can be active at a time.
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Banner
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {banners.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No banners yet. Create your first promotional banner.
          </p>
        ) : (
          banners.map(banner => (
            <div 
              key={banner.id} 
              className={`border rounded-lg p-4 space-y-4 ${banner.is_active ? 'border-primary bg-primary/5' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={() => handleToggleActive(banner)}
                  />
                  <span className="text-sm font-medium">
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(banner.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title/Prefix</Label>
                  <Input
                    value={banner.title}
                    onChange={(e) => updateBannerField(banner.id, 'title', e.target.value)}
                    placeholder="e.g., Limited Time Offer:"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Text</Label>
                  <Input
                    value={banner.discount_text || ''}
                    onChange={(e) => updateBannerField(banner.id, 'discount_text', e.target.value)}
                    placeholder="e.g., 20% OFF your first order!"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Promo Code</Label>
                  <Input
                    value={banner.promo_code || ''}
                    onChange={(e) => updateBannerField(banner.id, 'promo_code', e.target.value)}
                    placeholder="e.g., HONEY20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link URL</Label>
                  <Input
                    value={banner.link_url || ''}
                    onChange={(e) => updateBannerField(banner.id, 'link_url', e.target.value)}
                    placeholder="e.g., /products"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={banner.link_text || ''}
                    onChange={(e) => updateBannerField(banner.id, 'link_text', e.target.value)}
                    placeholder="e.g., Shop Now"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleUpdate(banner)}
                  disabled={savingId === banner.id}
                >
                  {savingId === banner.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>

              {/* Preview */}
              {banner.is_active && (
                <div className="mt-4 p-3 rounded-lg bg-honey-gradient text-primary-foreground text-center text-sm">
                  <span className="hidden sm:inline">{banner.title} </span>
                  <span className="font-bold">{banner.discount_text}</span>
                  {banner.promo_code && (
                    <> Use code <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{banner.promo_code}</span></>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
