"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

/**
 * Botão de submit que se desabilita durante o envio. Sem isso, um clique em
 * "Gerar PDF" (chamada ao Gotenberg, 2–5s) não dava feedback nenhum e o operador
 * clicava de novo, gerando registro duplicado.
 *
 * `icon` é `ReactNode` (já renderizado), não o componente do ícone — ver o mesmo
 * comentário em `confirm-button.tsx`.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "filled",
  size = "md",
  icon,
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "filled" | "tonal" | "outlined" | "text" | "danger";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      aria-busy={pending}
    >
      {icon}
      {pending ? (pendingLabel ?? "Salvando...") : children}
    </Button>
  );
}
