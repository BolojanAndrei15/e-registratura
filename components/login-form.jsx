import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}) {
  return (
    (<form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Bine ai venit in aplicație</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Introdu adresa de email și parola 
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Parolă</Label>
            
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Logează-te
        </Button>
       
      </div>
      <div className="text-center text-sm">
  Toate drepturile rezervate &copy; {new Date().getFullYear()} E-Registratura
</div>
    </form>)
  );
}
