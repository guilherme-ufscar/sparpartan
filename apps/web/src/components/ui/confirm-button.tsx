"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

/**
 * Submit que exige confirmação. Antes, "Excluir" na linha da tabela apagava com um
 * clique acidental, sem perguntar nada.
 *
 * `icon` é `ReactNode` (já renderizado, ex: `<Trash2 size={14} />`), não o componente
 * do ícone — passar o componente (uma função) de um Server Component para este Client
 * Component quebra a serialização RSC ("Functions cannot be passed directly...").
 */
export function ConfirmButton({
  children,
  mensagem,
  variant = "danger",
  size = "sm",
  icon,
}: {
  children: React.ReactNode;
  mensagem: string;
  variant?: "filled" | "tonal" | "outlined" | "text" | "danger";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(mensagem)) e.preventDefault();
      }}
    >
      {icon}
      {pending ? "Excluindo..." : children}
    </Button>
  );
}
