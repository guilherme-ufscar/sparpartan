"use client";

import { useState } from "react";
import { CampoSelect, SubmitButton } from "@/components/ui";

export function ConcederAcessoForm({
  action,
  materiasDisponiveis,
}: {
  action: (formData: FormData) => Promise<void>;
  materiasDisponiveis: { id: string; titulo: string }[];
}) {
  const [periodo, setPeriodo] = useState<"sem_limite" | "periodo">("sem_limite");

  if (materiasDisponiveis.length === 0) {
    return (
      <p className="text-body-sm text-outline">
        Todas as matérias já estão liberadas (ou não há matérias cadastradas).
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <CampoSelect
        label="Matéria"
        name="materiaId"
        required
        options={[
          { value: "", label: "Selecione..." },
          ...materiasDisponiveis.map((m) => ({ value: m.id, label: m.titulo })),
        ]}
      />

      <div className="flex flex-col gap-2">
        <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">Período</span>
        <label className="flex items-center gap-2 text-body-sm text-primary">
          <input
            type="radio"
            name="periodo"
            value="sem_limite"
            checked={periodo === "sem_limite"}
            onChange={() => setPeriodo("sem_limite")}
          />
          Sem limite
        </label>
        <label className="flex items-center gap-2 text-body-sm text-primary">
          <input
            type="radio"
            name="periodo"
            value="periodo"
            checked={periodo === "periodo"}
            onChange={() => setPeriodo("periodo")}
          />
          Até uma data
        </label>
        {periodo === "periodo" && (
          <input
            type="date"
            name="expiraEm"
            required
            className="w-fit rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
          />
        )}
      </div>

      <SubmitButton>+ Conceder Acesso</SubmitButton>
    </form>
  );
}
