"use client";

import { useActionState } from "react";
import { Campo, SubmitButton, FormError } from "@/components/ui";
import type { EstadoForm } from "@/lib/validacao";

export function ProvaForm({
  action,
  valoresIniciais,
}: {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  valoresIniciais?: { titulo?: string; descricao?: string; notaMinima?: number };
}) {
  const [estado, formAction] = useActionState(action, null);
  const v = (nome: string, fallback?: string) => estado?.valores?.[nome] ?? fallback ?? "";

  return (
    <form
      action={formAction}
      className="max-w-3xl space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
    >
      <FormError erro={estado?.erro} />

      <Campo label="Título" name="titulo" required defaultValue={v("titulo", valoresIniciais?.titulo)} />

      <label className="flex flex-col gap-1">
        <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">Descrição</span>
        <textarea
          name="descricao"
          rows={3}
          defaultValue={v("descricao", valoresIniciais?.descricao)}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
        />
      </label>

      <Campo
        label="Nota mínima para aprovação (%)"
        name="notaMinima"
        type="number"
        defaultValue={v("notaMinima", String(valoresIniciais?.notaMinima ?? 60))}
      />

      <SubmitButton>Salvar Prova</SubmitButton>
    </form>
  );
}
