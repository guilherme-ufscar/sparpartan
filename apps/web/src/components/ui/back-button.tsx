import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Link "Voltar" reutilizável para o topo de páginas de detalhe/edição. */
export function BackButton({ href, label = "Voltar" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-body-sm text-outline hover:text-primary hover:underline"
    >
      <ArrowLeft size={14} />
      {label}
    </Link>
  );
}
