"use client";

import { useActionState } from "react";
import { Campo, SubmitButton, FormError } from "@/components/ui";
import type { EstadoForm } from "@/lib/validacao";

export function CapituloForm({
  action,
  capitulo,
  textoBotao,
}: {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  capitulo?: { titulo: string; descricao: string | null };
  textoBotao?: string;
}) {
  const [estado, formAction] = useActionState(action, null);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-outline-variant p-4"
    >
      <FormError erro={estado?.erro} />
      <div className="min-w-[200px] flex-1">
        <Campo
          label={capitulo ? "Título" : "Novo capítulo — título"}
          name="titulo"
          required
          defaultValue={estado?.valores?.titulo ?? capitulo?.titulo}
        />
      </div>
      <div className="min-w-[200px] flex-1">
        <Campo
          label="Descrição (opcional)"
          name="descricao"
          defaultValue={estado?.valores?.descricao ?? capitulo?.descricao ?? ""}
        />
      </div>
      <SubmitButton size="sm">{textoBotao ?? "+ Adicionar Capítulo"}</SubmitButton>
    </form>
  );
}
