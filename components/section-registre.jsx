"use client";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, FileText, Plus, Search } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AddRegistryModal from "./add-registry-modal";
import EditRegistryModal from "./edit-registry-modal";
import DeleteRegistryModal from "./delete-registry-modal";

export default function SectionRegistre({ departmentId }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRegistryId, setEditRegistryId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteRegistryId, setDeleteRegistryId] = useState(null);
  const [registerTypes, setRegisterTypes] = useState([]);
  const isMobile = useIsMobile();
  const perPage = isMobile ? 6 : 14;
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (modalOpen) {
      axios.get("/api/registerType").then(res => setRegisterTypes(res.data));
    }
  }, [modalOpen]);

  // Fetch registre din API
  const { data: registers = [], isLoading, isError } = useQuery({
    queryKey: ["registers", departmentId],
    queryFn: async () => {
      const url = departmentId ? `/api/registry?departmentId=${departmentId}` : "/api/registry";
      const res = await axios.get(url);
      return res.data;
    },
  });

  const totalPages = Math.ceil(registers.length / perPage);
  const paginatedRegisters = registers.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main flex flex-1 flex-col gap-2 lg:gap-4 ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 lg:px-6 mt-2 mb-2">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="size-4" />
            </span>
            <Input
              placeholder="Caută departament..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => {
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
            Adaugă registru
            <Plus className="ml-2 size-4" />
          </Button>
        </div>
      </div>
      <div className="px-4 lg:px-6 overflow-x-auto">
        <div className="rounded-2xl border border-border bg-card w-full overflow-hidden min-w-[700px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Se încarcă registrele...</div>
          ) : isError ? (
            <div className="p-8 text-center text-destructive">Eroare la încărcarea registrelor!</div>
          ) : (
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[26%] text-muted-foreground text-xs font-semibold">NUME REGISTRU</TableHead>
                  <TableHead className="w-[22%] text-muted-foreground text-xs font-semibold">TIP REGISTRU</TableHead>
                  <TableHead className="w-[18%] text-center text-muted-foreground text-xs font-semibold">DATA CREĂRII</TableHead>
                  <TableHead className="w-[18%] text-center text-muted-foreground text-xs font-semibold">ÎNREGISTRĂRI</TableHead>
                  <TableHead className="w-[16%] text-center text-muted-foreground text-xs font-semibold">ACȚIUNI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRegisters.map((reg) => (
                  <TableRow key={reg.id} className="bg-card">
                    <TableCell className="flex items-center gap-2 font-medium text-base text-primary ">
                      <FileText className="text-primary w-5 h-5 shrink-0" />
                      <span className="truncate">{reg.name}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-base border-b border-border last:border-b-0 truncate">
                      <span className="truncate">{reg.registerType || "-"}</span>
                    </TableCell>
                    <TableCell className="text-center text-base font-semibold text-muted-foreground border-b border-border last:border-b-0 truncate">
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-center border-b border-border last:border-b-0 truncate">
                      <Badge className="bg-secondary text-secondary-foreground border-none px-3 py-1 text-sm font-medium">
                        {reg.registrationsCount ?? 0} înregistrări
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center justify-center gap-2 text-primary text-lg border-b border-border last:border-b-0">
                      <Button variant="ghost" size="icon" title="Vezi" className="text-primary hover:bg-primary/10">
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editează"
                        className="text-primary hover:bg-primary/10"
                        onClick={() => {
                          setEditRegistryId(reg.id);
                          setEditModalOpen(true);
                        }}
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Șterge"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setDeleteRegistryId(reg.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  isActive={page === idx + 1}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
                tabIndex={page === totalPages ? -1 : 0}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <AddRegistryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        departmentId={departmentId}
        registerTypes={registerTypes}
      />
      <EditRegistryModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        registryId={editRegistryId}
        onSuccess={() => {
          setEditModalOpen(false);
          queryClient.invalidateQueries(["registers", departmentId]);
        }}
        registerTypes={registerTypes}
      />
      <DeleteRegistryModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        registryId={deleteRegistryId}
        onSuccess={() => {
          setDeleteModalOpen(false);
          queryClient.invalidateQueries(["registers", departmentId]);
        }}
      />
    </div>
  );
}