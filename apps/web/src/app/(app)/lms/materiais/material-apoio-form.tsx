"use client";

import { useActionState, useState } from "react";
import { Campo, SubmitButton, FormError } from "@/components/ui";
import type { EstadoForm } from "@/lib/validacao";

/**
 * Formulário de material de apoio (upload local OU link/Drive) — os campos
 * condicionais (arquivo vs. URL) dependem do tipo escolhido, por isso é client
 * component; o restante (server action já vinculada ao escopo capítulo/aula)
 * continua rodando no servidor via `<form action={...}>`.
 */
export function MaterialApoioForm({
  action,
}: {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction] = useActionState(action, null);
  const [tipo, setTipo] = useState<"upload" | "drive" | "link">("upload");

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-outline-variant p-4"
    >
      <FormError erro={estado?.erro} />

      <div className="min-w-[180px] flex-1">
        <Campo label="Título" name="titulo" required defaultValue={estado?.valores?.titulo} />
      </div>

      <label className="flex w-40 flex-col gap-1">
        <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">Tipo</span>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "upload" | "drive" | "link")}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
        >
          <option value="upload">Upload</option>
          <option value="drive">Google Drive</option>
          <option value="link">Link externo</option>
        </select>
      </label>

      {tipo === "upload" ? (
        <div className="min-w-[200px] flex-1">
          <span className="mb-1 block font-mono-caps text-[11px] uppercase tracking-wide text-outline">Arquivo</span>
          <input
            type="file"
            name="arquivo"
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
          />
        </div>
      ) : (
        <div className="min-w-[220px] flex-1">
          <Campo label="URL" name="url" defaultValue={estado?.valores?.url} />
        </div>
      )}

      <SubmitButton size="sm">+ Adicionar Material</SubmitButton>
    </form>
  );
}
