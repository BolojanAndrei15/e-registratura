"use client";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { Plus, BrainCircuit } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function EditDepartmentModal({ open, onOpenChange, onSuccess, editId }) {
    const [nume, setNume] = useState("");
    const [descriere, setDescriere] = useState("");
    const [descriereError, setDescriereError] = useState("");
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const typingInterval = useRef(null);

    // Preia datele departamentului la deschiderea modalului
    useEffect(() => {
      if (open && editId) {
        setLoading(true);
        axios.get(`/api/department`).then(res => {
          const dept = res.data.find(d => d.id === editId);
          if (dept) {
            setNume(dept.name || "");
            setDescriere(dept.description || "");
          }
        }).finally(() => setLoading(false));
      }
    }, [open, editId]);
  
    const handleAiGenerate = async () => {
      if (!nume || nume.trim().length < 5) {
        setDescriereError("Completează numele departamentului (minim 5 caractere) pentru generare automată.");
        return;
      }
      setDescriereError("");
      setAiLoading(true);
      setDescriere("");
      setTimeout(() => setDescriere("|"), 100); // cursor vizual
      try {
        const res = await axios.post("/api/ai/department", { nume });
        clearInterval(typingInterval.current);
        if (res.data?.descriere) {
          // Animatie typing literă cu literă
          const text = res.data.descriere;
          let i = 0;
          setDescriere("");
          typingInterval.current = setInterval(() => {
            i++;
            setDescriere(text.slice(0, i) + (i < text.length ? "|" : ""));
            if (i >= text.length) {
              clearInterval(typingInterval.current);
              setAiLoading(false);
            }
          }, 40);
        } else {
          setDescriereError("Nu s-a putut genera descrierea automat.");
          setAiLoading(false);
        }
      } catch (e) {
        setDescriereError("Eroare la generarea descrierii cu AI.");
        setAiLoading(false);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setDescriereError("");
      try {
        // Folosește axios.put pentru editare (presupunem că ai id-ul departamentului ca prop sau state)
        const res = await axios.put(`/api/department/${editId}`, { name: nume, description: descriere });
        if (res.data.success) {
          toast.success(res.data.message || "Departament editat cu succes!");
          setNume("");
          setDescriere("");
          onSuccess?.();
          onOpenChange(false);
        } else {
          toast.warning(res.data.message || "Descrierea trebuie completată manual.");
          setDescriereError("Te rog introdu manual descrierea deoarece AI-ul este busy");
          setNume(nume);
          onSuccess?.();
        }
      } catch (err) {
        let errorMsg = "Eroare la editare departament.";
        const error = err.response?.data?.error;
        if (typeof error === "string") errorMsg = error;
        else if (error?.formErrors && Array.isArray(error.formErrors) && error.formErrors[0]) errorMsg = error.formErrors[0];
        else if (error?.fieldErrors) {
          const firstField = Object.values(error.fieldErrors).find(e => Array.isArray(e) && e[0]);
          if (firstField) errorMsg = firstField[0];
        }
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editează departament</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nume" className="mb-1">Nume departament</Label>
              <Input
                id="nume"
                placeholder="Nume departament"
                value={nume}
                onChange={e => setNume(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Label htmlFor="descriere" className="mb-1">Descriere departament</Label>
              <div className="relative">
                <Textarea
                  id="descriere"
                  placeholder="Descriere departament"
                  value={descriere}
                  onChange={e => {
                    setDescriere(e.target.value);
                    setDescriereError("");
                  }}
                  className={
                    (descriereError ? "border-red-500 focus-visible:ring-red-500 " : "") +
                    "pr-12"
                  }
                  disabled={aiLoading}
                /><div className="pointer-events-none absolute right-2 top-2 flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={-1}
                        className="pointer-events-auto p-1 rounded hover:bg-muted focus:outline-none"
                        disabled={aiLoading}
                        onClick={handleAiGenerate}
                        style={{ background: 'transparent', border: 'none' }}
                      >
                        <BrainCircuit className={`w-5 h-5 ${aiLoading ? 'animate-pulse' : ''}`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Generează cu AI</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              </div>
              {descriereError && (
                <div className="text-xs text-red-500 mt-1">{descriereError}</div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading || aiLoading}>
                {loading ? "Se salvează modificările..." : "Editează"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
