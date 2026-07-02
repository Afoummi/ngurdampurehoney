import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2, Pencil, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "./ImageUploader";
import { useAuth } from "@/hooks/useAuth";
import type { SiteMediaEntry, SiteMediaSlot } from "@/hooks/useSiteMedia";

const SLOTS: { key: SiteMediaSlot; label: string; description: string; folder: string; aspect: "wide" | "square" }[] = [
  { key: "hero_slide", label: "Hero Slideshow", description: "Rotating images on the homepage hero.", folder: "hero", aspect: "wide" },
  { key: "blog_featured", label: "Blog Featured", description: "Featured images for journal posts.", folder: "blog", aspect: "wide" },
  { key: "banner", label: "Banners", description: "Promotional banner artwork.", folder: "banners", aspect: "wide" },
  { key: "gallery", label: "Gallery", description: "General gallery photography.", folder: "gallery", aspect: "square" },
  { key: "trust", label: "Trust Section", description: "Certifications and trust visuals.", folder: "trust", aspect: "square" },
  { key: "about", label: "About Page", description: "Story and behind-the-scenes photos.", folder: "about", aspect: "wide" },
];

export function MediaTab() {
  const { isAdmin } = useAuth();
  const [activeSlot, setActiveSlot] = useState<SiteMediaSlot>("hero_slide");
  const [items, setItems] = useState<SiteMediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiteMediaEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    caption: "",
    link_url: "",
    image_url: "",
    storage_path: "",
    sort_order: 0,
    is_active: true,
  });

  const slotMeta = SLOTS.find((s) => s.key === activeSlot)!;

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_media" as never)
      .select("*")
      .eq("slot", activeSlot)
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as unknown as SiteMediaEntry[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "", subtitle: "", caption: "", link_url: "",
      image_url: "", storage_path: "", sort_order: items.length, is_active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (m: SiteMediaEntry) => {
    setEditing(m);
    setForm({
      title: m.title ?? "",
      subtitle: m.subtitle ?? "",
      caption: m.caption ?? "",
      link_url: m.link_url ?? "",
      image_url: m.image_url,
      storage_path: m.storage_path ?? "",
      sort_order: m.sort_order,
      is_active: m.is_active,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.image_url) {
      toast.error("Please upload or paste an image URL");
      return;
    }
    setSaving(true);
    const payload = {
      slot: activeSlot,
      title: form.title || null,
      subtitle: form.subtitle || null,
      caption: form.caption || null,
      link_url: form.link_url || null,
      image_url: form.image_url,
      storage_path: form.storage_path || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };
    const client = supabase as unknown as {
      from: (t: string) => {
        update: (v: unknown) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
        insert: (v: unknown) => Promise<{ error: unknown }>;
        delete: () => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
      };
    };
    const { error } = editing
      ? await client.from("site_media").update(payload).eq("id", editing.id)
      : await client.from("site_media").insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Media updated" : "Media added");
    setDialogOpen(false);
    fetchItems();
  };

  const remove = async (m: SiteMediaEntry) => {
    const { error } = await supabase.from("site_media" as never).delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    if (m.storage_path) {
      await supabase.storage.from("product-images").remove([m.storage_path]);
    }
    toast.success("Deleted");
    fetchItems();
  };

  const toggleActive = async (m: SiteMediaEntry) => {
    const { error } = await supabase
      .from("site_media" as never)
      .update({ is_active: !m.is_active } as never)
      .eq("id", m.id);
    if (error) return toast.error(error.message);
    fetchItems();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" /> Media Library
            </CardTitle>
            <CardDescription>
              Manage every image shown on the website — no code required.
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add {slotMeta.label}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSlot} onValueChange={(v) => setActiveSlot(v as SiteMediaSlot)}>
          <TabsList className="flex flex-wrap h-auto">
            {SLOTS.map((s) => (
              <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>
            ))}
          </TabsList>
          {SLOTS.map((s) => (
            <TabsContent key={s.key} value={s.key} className="mt-6">
              <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-honey-deep" />
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No {s.label.toLowerCase()} yet.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                    <Plus className="w-4 h-4" /> Add first item
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((m) => (
                    <div key={m.id} className="group rounded-xl border border-border overflow-hidden bg-card">
                      <div className={`${s.aspect === "wide" ? "aspect-[16/9]" : "aspect-square"} bg-muted overflow-hidden`}>
                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                        <img src={m.image_url} alt={m.title ?? "Media image"} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{m.title || "(no title)"}</p>
                            {m.subtitle && <p className="text-xs text-muted-foreground truncate">{m.subtitle}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Switch checked={m.is_active} onCheckedChange={() => toggleActive(m)} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Order: {m.sort_order}</span>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(m)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This removes the entry and its storage file permanently.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => remove(m)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit media" : `Add ${slotMeta.label}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ImageUploader
              value={form.image_url || null}
              onChange={(url, path) =>
                setForm((f) => ({ ...f, image_url: url ?? "", storage_path: path ?? "" }))
              }
              folder={slotMeta.folder}
              aspect={slotMeta.aspect}
              label={slotMeta.label}
            />
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle / Category</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Caption / Excerpt</Label>
              <Textarea rows={3} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Link URL (optional)</Label>
              <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/blog/post-slug or https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Active</Label>
                <div className="h-10 flex items-center">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
