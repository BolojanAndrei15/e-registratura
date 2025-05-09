"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export default function DeleteRegistryModal({ open, onOpenChange, registryId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/api/registry/${registryId}`);
      toast.success("Registrul a fost șters cu succes!");
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Eroare la ștergerea registrului");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Șterge registru</DialogTitle>
        </DialogHeader>
        <div className="mb-4">Ești sigur că vrei să ștergi acest registru? Această acțiune este ireversibilă.</div>
        {error && <div className="text-destructive text-sm mb-2">{error}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Anulează
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
