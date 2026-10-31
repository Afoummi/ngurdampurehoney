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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_published: boolean;
  sort_order: number;
}

const CATEGORIES = ["quality", "orders", "support", "general"];
const empty: Omit<Faq, "id"> = { question: "", answer: "", category: "general", is_published: true, sort_order: 0 };

export function FaqsTab() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState<Omit<Faq, "id">>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
    if (error) toast.error("Failed to load FAQs");
    setItems((data as Faq[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (f: Faq) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category, is_published: f.is_published, sort_order: f.sort_order });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) { toast.error("Question and answer are required"); return; }
    setSaving(true);
    const { error } = editing
      ? await supabase.from("faqs").update(form).eq("id", editing.id)
      : await supabase.from("faqs").insert(form);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "FAQ updated" : "FAQ added");
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const togglePublished = async (f: Faq) => {
    const { error } = await supabase.from("faqs").update({ is_published: !f.is_published }).eq("id", f.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>FAQs</CardTitle>
          <CardDescription>Manage the questions shown on the FAQ page and homepage</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add FAQ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} FAQ</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Question *</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
              <div><Label>Answer *</Label><Textarea rows={5} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <Label>Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No FAQs yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <div className="font-medium">{f.question}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">{f.answer}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{f.category}</Badge></TableCell>
                  <TableCell>{f.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={f.is_published ? "default" : "secondary"} className="cursor-pointer" onClick={() => togglePublished(f)}>
                      {f.is_published ? "Live" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(f.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
