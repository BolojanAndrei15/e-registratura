"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useState } from "react"

export function LoginForm({
  className,
  ...props
}) {
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const email = e.target.email.value;
    const password = e.target.password.value;
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      setError("Email sau parolă incorectă");
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
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
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>
      <div className="text-center text-sm">
  Toate drepturile rezervate &copy; {new Date().getFullYear()} E-Registratura
</div>
    </form>
  );
}
