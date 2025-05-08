import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RegisterCard({ register, onView, onEdit, onDelete }) {
  return (
    <Card className="flex flex-row items-center gap-4 px-4 py-2 h-20 w-full shadow-sm border hover:bg-muted/50 transition-colors">
      {/* Icon + Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img src="/file.svg" alt="file" width={28} height={28} className="shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-base font-semibold truncate">{register.name}</span>
          <span className="text-sm text-muted-foreground truncate">{register.description}</span>
        </div>
      </div>
      {/* Data */}
      <div className="text-sm text-muted-foreground w-28 text-center hidden md:block">{register.date}</div>
      {/* Badge */}
      <Badge variant="secondary" className="whitespace-nowrap text-xs font-medium px-2 py-1">
        {register.count} înregistrări
      </Badge>
      {/* Acțiuni */}
      <div className="flex items-center gap-1 ms-2">
        <Button variant="ghost" size="icon" onClick={onView} title="Vezi">
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeWidth="1.5" d="M1.75 10S4.5 4.75 10 4.75 18.25 10 18.25 10 15.5 15.25 10 15.25 1.75 10 1.75 10Z"/><circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5"/></svg>
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit} title="Editează">
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeWidth="1.5" d="M13.5 3.5l3 3-9 9H4.5v-3l9-9Z"/><path stroke="currentColor" strokeWidth="1.5" d="M11.5 5.5l3 3"/></svg>
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} title="Șterge">
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeWidth="1.5" d="M5 6.5h10M8.5 9.5v4M11.5 9.5v4M3.5 6.5l1 10a1 1 0 0 0 1 .99h8a1 1 0 0 0 1-.99l1-10"/><path stroke="currentColor" strokeWidth="1.5" d="M7.5 6.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5"/></svg>
        </Button>
      </div>
    </Card>
  );
}