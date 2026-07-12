import { AlertTriangle } from "lucide-react";

/** Mensagem de erro inline do formulário. Antes, uma validação que falhava virava tela 500. */
export function FormError({ erro }: { erro?: string | null }) {
  if (!erro) return null;

  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-danger-container px-4 py-3 text-body-sm text-on-danger-container"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      {erro}
    </p>
  );
}
