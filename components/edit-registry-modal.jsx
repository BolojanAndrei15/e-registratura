"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { BrainCircuit } from "lucide-react";

export default function EditRegistryModal({ open, onOpenChange, registryId, onSuccess, registerTypes: initialRegisterTypes }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    year: new Date().getFullYear(),
    minNumber: "",
    maxNumber: "",
    registerTypeId: ""
  });
  const [previousName, setPreviousName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [typingDesc, setTypingDesc] = useState(false);
  const [registerTypes, setRegisterTypes] = useState(initialRegisterTypes || []);

  useEffect(() => {
    if (open) {
      axios.get("/api/registerType").then(res => setRegisterTypes(res.data));
    }
  }, [open]);

  useEffect(() => {
    if (open && registryId) {
      setLoading(true);
      axios.get(`/api/registry?id=${registryId}`)
        .then(res => {
          let reg = null;
          if (Array.isArray(res.data)) {
            reg = res.data.find(r => r.id === registryId);
          } else {
            reg = res.data;
          }
          if (reg) {
            setForm({
              name: reg.name || "",
              description: reg.description || "",
              year: reg.year || new Date().getFullYear(),
              minNumber: reg.minNumber ?? "",
              maxNumber: reg.maxNumber ?? "",
              registerTypeId: reg.registerTypeId || ""
            });
            setPreviousName(reg.name || "");
          }
        })
        .catch(() => setError("Eroare la încărcarea datelor registrului."))
        .finally(() => setLoading(false));
    }
    if (!open) {
      setForm({
        name: "",
        description: "",
        year: new Date().getFullYear(),
        minNumber: "",
        maxNumber: "",
        registerTypeId: ""
      });
      setPreviousName("");
      setError("");
      setFieldErrors({});
      setTouched({});
      setAiError("");
    }
  }, [open, registryId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const handleSelect = (value) => {
    setForm((f) => ({ ...f, registerTypeId: value }));
    setTouched((t) => ({ ...t, registerTypeId: true }));
    setFieldErrors((fe) => ({ ...fe, registerTypeId: undefined }));
  };

  useEffect(() => {
    if (form.name && form.name.length < 15) {
      setFieldErrors(fe => ({ ...fe, name: "Numele registrului trebuie să conțină cel puțin 15 caractere." }));
    } else {
      setFieldErrors(fe => {
        const { name, ...rest } = fe;
        return rest;
      });
    }
    if (form.description && form.description.length < 15) {
      setFieldErrors(fe => ({ ...fe, description: "Descrierea este obligatorie și trebuie să aibă cel puțin 15 caractere." }));
    } else if (form.description && form.description.length >= 15) {
      setFieldErrors(fe => {
        const { description, ...rest } = fe;
        return rest;
      });
    }
  }, [form.name, form.description]);

  async function handleAIGenerate() {
    setAiError("");
    if (!form.name) {
      setAiError("Completează numele registrului pentru a genera automat.");
      return;
    }
    setAiLoading(true);
    setTypingDesc(true);
    setForm(f => ({ ...f, description: "" }));
    try {
      const res = await axios.post("/api/ai/registry", { name: form.name });
      const { description, recommendedType } = res.data;
      let recommendedTypeId = "";
      if (recommendedType && registerTypes?.length) {
        const found = registerTypes.find(rt => rt.name === recommendedType);
        if (found) recommendedTypeId = found.id;
      }
      let i = 0;
      function typeDesc() {
        if (!description) {
          setForm(f => ({ ...f, description: "" }));
          setTypingDesc(false);
          return;
        }
        if (i <= description.length) {
          setForm(f => ({ ...f, description: description.slice(0, i) }));
          i++;
          setTimeout(typeDesc, 18);
        } else {
          setTypingDesc(false);
        }
      }
      typeDesc();
      setForm(f => ({
        ...f,
        registerTypeId: recommendedTypeId || f.registerTypeId
      }));
    } catch (err) {
      setAiError(err?.response?.data?.error || "Eroare AI");
      setTypingDesc(false);
    } finally {
      setAiLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const yearNum = Number(form.year);
    const newFieldErrors = {};
    if (!form.name) newFieldErrors.name = "Numele este obligatoriu.";
    else if (form.name.length < 15) newFieldErrors.name = "Numele registrului trebuie să conțină cel puțin 15 caractere.";
    if (!form.description) newFieldErrors.description = "Descrierea este obligatorie.";
    else if (form.description.length < 15) newFieldErrors.description = "Descrierea este obligatorie și trebuie să aibă cel puțin 15 caractere.";
    if (!yearNum) newFieldErrors.year = "Anul este obligatoriu.";
    if (!form.registerTypeId) newFieldErrors.registerTypeId = "Tipul de registru este obligatoriu.";
    setFieldErrors(newFieldErrors);
    setTouched({ name: true, description: true, year: true, registerTypeId: true });
    if (Object.keys(newFieldErrors).length > 0) {
      setError("Completează toate câmpurile obligatorii.");
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      year: yearNum,
      minNumber: form.minNumber !== "" ? Number(form.minNumber) : null,
      maxNumber: form.maxNumber !== "" ? Number(form.maxNumber) : null,
      id: registryId,
      ...(form.name !== previousName ? { oldName: previousName, newName: form.name } : {})
    };
    try {
      await axios.put(`/api/registry/${registryId}`, payload);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Eroare la editarea registrului");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editează registru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name" className="mb-1 block">Nume registru*</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nume registru*"
              value={form.name}
              onChange={handleChange}
              required
              className={fieldErrors.name && touched.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {fieldErrors.name && touched.name && (
              <div className="text-destructive text-xs mt-1">{fieldErrors.name}</div>
            )}
          </div>
          <div>
            <Label htmlFor="description" className="mb-1 block">Descriere</Label>
            <div className="relative">
              <Input
                id="description"
                name="description"
                placeholder="Descriere (opțional)"
                value={form.description}
                onChange={handleChange}
                disabled={typingDesc}
                className={fieldErrors.description && touched.description ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>
            {typingDesc && (
              <div className="text-xs text-muted-foreground animate-pulse mt-1">AI scrie descrierea...</div>
            )}
            {fieldErrors.description && touched.description && (
              <div className="text-destructive text-xs mt-1">{fieldErrors.description}</div>
            )}
            {aiError && <div className="text-destructive text-xs mt-1">{aiError}</div>}
          </div>
          <div>
            <Label htmlFor="year" className="mb-1 block">An*</Label>
            <Input
              id="year"
              name="year"
              type="number"
              placeholder="An*"
              value={form.year}
              onChange={handleChange}
              min={1900}
              max={new Date().getFullYear() + 10}
              required
              className={fieldErrors.year && touched.year ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {fieldErrors.year && touched.year && (
              <div className="text-destructive text-xs mt-1">{fieldErrors.year}</div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="minNumber" className="mb-1 block">Număr minim</Label>
              <Input
                id="minNumber"
                name="minNumber"
                type="number"
                placeholder="Număr minim"
                value={form.minNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="maxNumber" className="mb-1 block">Număr maxim</Label>
              <Input
                id="maxNumber"
                name="maxNumber"
                type="number"
                placeholder="Număr maxim"
                value={form.maxNumber}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="registerTypeId" className="mb-1 block">Tip registru*</Label>
            <Select value={form.registerTypeId} onValueChange={handleSelect} required>
              <SelectTrigger id="registerTypeId"
                className={fieldErrors.registerTypeId && touched.registerTypeId ? "border-red-500 focus-visible:ring-red-500" : ""}
              >
                <SelectValue placeholder="Tip registru*" />
              </SelectTrigger>
              <SelectContent>
                {registerTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.registerTypeId && touched.registerTypeId && (
              <div className="text-destructive text-xs mt-1">{fieldErrors.registerTypeId}</div>
            )}
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <DialogFooter>
            <div className="flex w-full gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleAIGenerate} disabled={aiLoading || !form.name || fieldErrors.name || fieldErrors.description}>
                <BrainCircuit className="mr-2" />
                {aiLoading ? "Se generează..." : "Generează cu AI"}
              </Button>
              <Button type="submit" disabled={loading || aiLoading || typingDesc || fieldErrors.description}>
                {loading ? "Se salvează..." : "Salvează"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
