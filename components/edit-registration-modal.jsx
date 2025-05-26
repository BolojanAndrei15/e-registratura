"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useQueryClient } from '@tanstack/react-query';
import axios from "axios";

export default function EditRegistrationModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  registration,
  statuses = [], 
  documentTypes = [], 
  users = [] 
}) {
  const [form, setForm] = useState({
    registrationNo: "",
    sentDate: new Date(),
    documentNo: "",
    documentDate: new Date(),
    source: "",
    handlerId: "",
    summary: "",
    statusId: "",
    documentTypeId: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const queryClient = useQueryClient();

  // Populate form when registration data is available
  useEffect(() => {
    if (open && registration) {
      setForm({
        registrationNo: registration.registrationNo || "",
        sentDate: registration.sentDate ? new Date(registration.sentDate) : new Date(),
        documentNo: registration.documentNo || "",
        documentDate: registration.documentDate ? new Date(registration.documentDate) : new Date(),
        source: registration.source || "",
        handlerId: registration.handlerId || "",
        summary: registration.summary || "",
        statusId: registration.statusId || "",
        documentTypeId: registration.documentTypeId || ""
      });
      setError("");
      setFieldErrors({});
    }
  }, [open, registration]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm({
        registrationNo: "",
        sentDate: new Date(),
        documentNo: "",
        documentDate: new Date(),
        source: "",
        handlerId: "",
        summary: "",
        statusId: "",
        documentTypeId: ""
      });
      setError("");
      setFieldErrors({});
    }
  }, [open]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setFieldErrors({});
    
    try {
      const payload = {
        registrationNo: form.registrationNo,
        documentNo: form.documentNo,
        handlerId: form.handlerId || null,
        documentDate: form.documentDate ? new Date(form.documentDate) : null,
        sentDate: form.sentDate ? new Date(form.sentDate) : null,
        source: form.source,
        statusId: form.statusId,
        documentTypeId: form.documentTypeId,
        summary: form.summary,
      };

      // Update registration via API
      await axios.put(`/api/registrations/${registration.id}`, payload);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      
      // Call success callback and close modal
      onSuccess?.();
      onOpenChange(false);
      
    } catch (err) {
      if (err?.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      }
      setError(err?.response?.data?.error || "Eroare la actualizare.");
    } finally {
      setLoading(false);
    }
  };

  if (!registration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Editează înregistrare</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 pb-2">
          <div>
            <Label>Număr înregistrare*</Label>
            <Input 
              name="registrationNo"
              value={form.registrationNo} 
              onChange={handleChange}
              className={fieldErrors.registrationNo ? "border-red-500 focus-visible:ring-red-500" : ""} 
            />
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
            <Input 
              name="documentNo" 
              value={form.documentNo} 
              onChange={handleChange} 
            />
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
            <Input 
              name="source" 
              value={form.source} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <Label>Destinatar</Label>
            <Select value={form.handlerId} onValueChange={v => handleSelect("handlerId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alege utilizatorul" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.statusId} onValueChange={v => handleSelect("statusId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alege statusul" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tip document</Label>
            <Select value={form.documentTypeId} onValueChange={v => handleSelect("documentTypeId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alege tipul documentului" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(dt => <SelectItem key={dt.id} value={dt.id}>{dt.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Rezumat</Label>
            <Textarea 
              name="summary" 
              value={form.summary} 
              onChange={handleChange} 
              rows={4}
            />
          </div>
          {error && <div className="text-destructive text-sm md:col-span-2">{error}</div>}
          <DialogFooter className="md:col-span-2 flex-row gap-2 justify-end">
            <Button variant="" type="submit" disabled={loading}>
              {loading ? "Se actualizează..." : "Actualizează"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Anulează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
