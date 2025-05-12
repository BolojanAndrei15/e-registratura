"use client";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";

export default function AddRegistrationModal({ open, onOpenChange, onSuccess, registerId, registrantId, departmentId, statuses = [], documentTypes = [], users = [], nextRegistrationNo }) {
  const { data: session } = useSession();
  const today = new Date();
  const [form, setForm] = useState({
    registrationNo: nextRegistrationNo || "",
    sentDate: today,
    documentNo: "",
    documentDate: today,
    source: "",
    handlerId: "",
    summary: ""
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [useAI, setUseAI] = useState(true);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [typing, setTyping] = useState({ documentNo: false, source: false, summary: false });
  const [processingAI, setProcessingAI] = useState(false);
  const typingTimeout = useRef();
  const queryClient = useQueryClient();

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];

  useEffect(() => {
    if (open && nextRegistrationNo) {
      setForm(f => ({ ...f, registrationNo: nextRegistrationNo }));
    }
  }, [open, nextRegistrationNo]);

  useEffect(() => {
    if (!open) {
      setForm({
        registrationNo: "",
        sentDate: today,
        documentNo: "",
        documentDate: today,
        source: "",
        handlerId: "",
        summary: ""
      });
      setFile(null);
      setUseAI(true);
      setError("");
      setFieldErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (useAI && file) {
      (async () => {
        setProcessingAI(true);
        setError("");
        try {
          const aiFormData = new FormData();
          aiFormData.append("file", file, file.name);
          aiFormData.append("fileType", file.type);
          aiFormData.append("fileTitle", file.name);
          const aiRes = await axios.post("/api/ai/registries", aiFormData);
          console.log("AI webhook response:", aiRes.data); // DEBUG
          let aiData = null;
          if (Array.isArray(aiRes.data?.n8n)) {
            aiData = aiRes.data.n8n[0]?.output;
          } else if (aiRes.data?.n8n?.output) {
            aiData = aiRes.data.n8n.output;
          } else if (aiRes.data?.output) {
            aiData = aiRes.data.output;
          }
          if (aiData) {
            if (aiData.numar_document) animateTyping("documentNo", aiData.numar_document);
            if (aiData.data_document) handleDateChange("documentDate", new Date(aiData.data_document.split(".").reverse().join("-")));
            if (aiData.sursa) animateTyping("source", aiData.sursa);
            if (aiData.rezumat) animateTyping("summary", aiData.rezumat);
          } else {
            setError("Nu s-au putut extrage date din document.");
          }
        } catch (err) {
          setError(err?.response?.data?.error || "Eroare la trimiterea documentului.");
        } finally {
          setProcessingAI(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, useAI]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const handleSelect = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const handleDateChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && allowedTypes.includes(f.type)) {
      setFile(f);
      setError("");
    } else if (f) {
      setError("Poți încărca doar documente PDF, DOC, DOCX, XLSX.");
      setFile(null);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f && allowedTypes.includes(f.type)) {
      setFile(f);
      setError("");
    } else if (f) {
      setError("Poți încărca doar documente PDF, DOC, DOCX, XLSX.");
      setFile(null);
    }
  };

  const animateTyping = (field, value) => {
    setTyping(t => ({ ...t, [field]: true }));
    let i = 0;
    function typeChar() {
      setForm(f => ({ ...f, [field]: value.slice(0, i) }));
      if (i <= value.length) {
        i++;
        setTimeout(typeChar, 18);
      } else {
        setTyping(t => ({ ...t, [field]: false }));
      }
    }
    typeChar();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setFieldErrors({});
    try {
      // Compose payload for registration
      const payload = {
        registerId,
        departmentId, // from props, not form
        documentNo: form.documentNo,
        registrantId: session?.user?.id, // use logged-in user id from session
        handlerId: form.handlerId || null,
        documentDate: form.documentDate ? new Date(form.documentDate) : null,
        sentDate: form.sentDate ? new Date(form.sentDate) : null,
        source: form.source,
        statusId: statuses[0]?.id, // default to first status if not selectable
        documentTypeId: documentTypes[0]?.id, // default to first doc type if not selectable
        summary: form.summary,
      };
      // If you have status/documentType selection, use those values from form
      // Otherwise, use the first available as default
      const res = await axios.post("/api/registrations", payload);
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      onSuccess?.();
      onOpenChange(false);
      setForm({
        registrationNo: "",
        sentDate: today,
        documentNo: "",
        documentDate: today,
        source: "",
        handlerId: "",
        summary: ""
      });
    } catch (err) {
      if (err?.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      }
      setError(err?.response?.data?.error || "Eroare la salvare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={processingAI ? undefined : onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Adaugă înregistrare</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 pb-2">
          <div>
            <Label>Număr înregistrare*</Label>
            <Input value={form.registrationNo} readOnly className={fieldErrors.registrationNo ? "border-red-500 focus-visible:ring-red-500" : ""} />
            {fieldErrors.registrationNo && <div className="text-destructive text-xs mt-1">{fieldErrors.registrationNo}</div>}
          </div>
          <div>
            <Label>Data expedierii*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={"w-full justify-start text-left font-normal " + (fieldErrors.sentDate ? "border-red-500 focus-visible:ring-red-500" : "")}
                >
                  {form.sentDate ? format(form.sentDate, "dd.MM.yyyy") : "Alege data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.sentDate}
                  onSelect={date => handleDateChange("sentDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {fieldErrors.sentDate && <div className="text-destructive text-xs mt-1">{fieldErrors.sentDate}</div>}
          </div>
          <div>
            <Label>Număr document</Label>
            <Input name="documentNo" value={form.documentNo} onChange={handleChange} disabled={typing.documentNo} />
          </div>
          <div>
            <Label>Data document</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {form.documentDate ? format(form.documentDate, "dd.MM.yyyy") : "Alege data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.documentDate}
                  onSelect={date => handleDateChange("documentDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Sursă</Label>
            <Input name="source" value={form.source} onChange={handleChange} disabled={typing.source} />
          </div>
          <div>
            <Label className="w-full">Destinatar</Label>
            <Select  value={form.handlerId} onValueChange={v => handleSelect("handlerId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alege utilizatorul" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Rezumat</Label>
            <Textarea name="summary" value={form.summary} onChange={handleChange} disabled={typing.summary} />
          </div>
          <div className="md:col-span-2 flex items-center gap-2 mb-2">
            <Switch checked={useAI} onCheckedChange={setUseAI} id="ai-switch" disabled={processingAI} />
            <Label htmlFor="ai-switch" className="cursor-pointer select-none">Foloseste AI pentru document</Label>
            {processingAI && <span className="text-muted-foreground animate-pulse ml-2">Se procesează documentul cu AI...</span>}
          </div>
          <div className="md:col-span-2">
            <Label>Fișier atașat</Label>
            <div
              className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-muted' : 'border-input'}`}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-upload-input').click()}
              style={{ minHeight: 100 }}
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChange}
              />
              <UploadCloud className="mb-2 text-muted-foreground" />
              {file ? (
                <span className="text-sm text-foreground">{file.name}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Trage și plasează un fișier PDF, DOC, DOCX, XLSX aici sau apasă pentru a selecta</span>
              )}
            </div>
          </div>
          {error && <div className="text-destructive text-sm md:col-span-2">{error}</div>}
          <DialogFooter className="md:col-span-2 flex-row gap-2 justify-end">
            <Button variant="" type="submit" disabled={loading}>{loading ? "Se salvează..." : "Adaugă"}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Anulează</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}