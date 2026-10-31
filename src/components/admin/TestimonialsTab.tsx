import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Star, Trash2, Pencil } from "lucide-react";

interface Testimonial {
  id: string;
  author_name: string;
  author_location: string | null;
  quote: string;
  rating: number;
  is_published: boolean;
  sort_order: number;
}

const empty: Omit<Testimonial, "id"> = {
  author_name: "",
  author_location: "",
  quote: "",
  rating: 5,
  is_published: true,
  sort_order: 0,
};

export function TestimonialsTab() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load testimonials");
    setItems((data as Testimonial[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      author_name: t.author_name,
      author_location: t.author_location || "",
      quote: t.quote,
      rating: t.rating,
      is_published: t.is_published,
      sort_order: t.sort_order,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.author_name.trim() || !form.quote.trim()) {
      toast.error("Name and quote are required");
      return;
    }
    setSaving(true);
    const payload = { ...form, author_location: form.author_location || null };
    const { error } = editing
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Testimonial updated" : "Testimonial added");
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const togglePublished = async (t: Testimonial) => {
    const { error } = await supabase
      .from("testimonials").update({ is_published: !t.is_published }).eq("id", t.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>Manage customer reviews shown on the homepage</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Testimonial</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "New"} Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name *</Label><Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={form.author_location || ""} onChange={(e) => setForm({ ...form, author_location: e.target.value })} placeholder="Lagos, Nigeria" /></div>
              </div>
              <div><Label>Quote *</Label><Textarea rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Rating (1–5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) })} /></div>
                <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <Label>Published (visible on site)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No testimonials yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-medium">{t.author_name}</div>
                    {t.author_location && <div className="text-xs text-muted-foreground">{t.author_location}</div>}
                  </TableCell>
                  <TableCell className="max-w-md"><p className="text-sm text-muted-foreground line-clamp-2">{t.quote}</p></TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (<Star key={i} className="w-3.5 h-3.5 fill-honey text-honey" />))}
                    </div>
                  </TableCell>
                  <TableCell>{t.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={t.is_published ? "default" : "secondary"} className="cursor-pointer" onClick={() => togglePublished(t)}>
                      {t.is_published ? "Live" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(t.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
