"use client"
import { Badge } from "@/components/ui/badge"
import {
  Card,
 
  CardTitle,
} from "@/components/ui/card"
import { Plus, Search, EllipsisVertical, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

import AddDepartmentModal from "./add-department-modal";
import EditDepartmentModal from "./edit-department-modal";
import DeleteDepartmentModal from "./delete-department-modal";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// Exemplu de card pentru un departament
function DepartmentCard({ name, description, lastEdited, avatars, registerNumbers, totalRegistries, id, onEdit, onDelete }) {
  // Determină câți utilizatori să afișezi în funcție de lățimea ecranului
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const maxAvatars = isMobile ? 3 : 5;
  const avatarsToShow = avatars ? avatars.slice(0, maxAvatars) : [];
  const hasMore = avatars && avatars.length > maxAvatars;
  const router = useRouter();

  return (
    <Card className="relative border rounded-xl bg-card p-4  min-h-[120px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 p-0"><EllipsisVertical className="w-4 h-4" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-2">
              <Button variant="ghost" className="w-full justify-start text-sm gap-2" onClick={() => onEdit?.(id)}>
                <Pencil className="w-4 h-4" /> Editează
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm gap-2 text-destructive" onClick={() => onDelete?.(id, name)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                Șterge
              </Button>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="text-sm line-clamp-2 text-muted-foreground">{description}</div>
          
          <div className="flex gap-2 mt-1 flex-wrap mt-6">
            <Badge variant="outline" className="w-full md:w-fit whitespace-nowrap px-2 py-1">Total registru: <b>{totalRegistries}</b></Badge>
            <Badge variant="secondary" className="w-full md:w-fit whitespace-nowrap px-2 py-1">Nr. înregistrări: <b>{registerNumbers}</b></Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Ultima editare: {lastEdited ? format(new Date(lastEdited), "dd.MM.yyyy HH:mm") : "-"}</div>
        </div>
      </div>
      <div className="flex items-center justify-between ">
        <div className="flex -space-x-2">
          <TooltipProvider>
            {avatarsToShow && avatarsToShow.length > 0 ? (
              avatarsToShow.map((avatar, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <Avatar className="w-7 h-7 border-2 border-card bg-muted text-xs" style={{ zIndex: 10 - idx }}>
                      {avatar.image ? (
                        <AvatarImage src={avatar.image} alt={avatar.fallback || "avatar"} />
                      ) : null}
                      <AvatarFallback>{avatar.fallback || "?"}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{avatar.name || avatar.fallback || "Utilizator"}</TooltipContent>
                </Tooltip>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">Fără utilizatori</span>
            )}
            {hasMore && (
              <span className="ml-2 text-xs text-muted-foreground">...</span>
            )}
          </TooltipProvider>
        </div>
        <Button variant="link" className="text-xs px-0" onClick={() => router.push(`/e-registratura/${id}`)}>Vezi registre &rarr;</Button>
      </div>
    </Card>
  );
}

export function SectionDepartments() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const isMobile = useIsMobile();
  const [perPage, setPerPage] = useState(isMobile ? 4 : 12);
  const [search, setSearch] = useState("");
  React.useEffect(() => {
    setPerPage(isMobile ? 4 : 12);
  }, [isMobile]);

  const [page, setPage] = useState(1);

  const { data: departments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await axios.get('/api/department');
      return res.data;
    },
  });

  const handleEdit = (id) => {
    setEditId(id);
    setEditModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteModalOpen(true);
  };

  const filteredDepartments = departments.filter(
    dept =>
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredDepartments.length / perPage);
  const paginatedDepartments = filteredDepartments.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 lg:gap-4 ">
      <AddDepartmentModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={refetch} />
      <EditDepartmentModal open={editModalOpen} onOpenChange={setEditModalOpen} onSuccess={refetch} editId={editId} />
      <DeleteDepartmentModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} departmentId={deleteId} departmentName={deleteName} onSuccess={refetch} />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 lg:px-6 mt-2 mb-2">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="size-4" />
          </span>
          <Input
            placeholder="Caută departament..."
            className="pl-10 w-full"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button
          variant="default"
          className="mt-2 md:mt-0 w-full md:w-auto"
          onClick={() => setModalOpen(true)}
        >
          Adaugă departament 
          <Plus className="ml-2 size-4" />
        </Button>
      </div>

      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-2 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Se încarcă...</div>
        ) : isError ? (
          <div className="col-span-full text-center py-8 text-destructive">Eroare la încărcare departamente.</div>
        ) : (
          paginatedDepartments.map((dept, idx) => (
            <DepartmentCard key={dept.id || idx} {...dept} onEdit={handleEdit} onDelete={handleDelete} />
          ))
        )}
      </div>
      {totalPages > 1 && (
        <Pagination className="">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}