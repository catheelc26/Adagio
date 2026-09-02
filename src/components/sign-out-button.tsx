import { signOut } from "@/auth";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className={`text-sm text-cream-dim/80 hover:text-gold transition-colors ${className}`}
      >
        Salir
      </button>
    </form>
  );
}
