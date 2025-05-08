import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export default function DeleteDepartmentModal({ open, onOpenChange, departmentId, departmentName, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/department/${departmentId}`);
      toast.success("Departament șters cu succes!");
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error("Eroare la ștergerea departamentului.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Șterge departamentul</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Sigur vrei să ștergi departamentul <b>{departmentName}</b>? Această acțiune este ireversibilă.
        </div>
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
