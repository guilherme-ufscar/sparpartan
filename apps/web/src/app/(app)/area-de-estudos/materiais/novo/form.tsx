"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError } from "@/components/ui";
import { criarMaterial } from "../../actions";

export function NovoMaterialForm({ listaServicos }: { listaServicos: { id: string; nome: string }[] }) {
  const [estado, formAction] = useActionState(criarMaterial, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <FormError erro={estado?.erro} />

      <SectionCard title="Material de Estudo">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoSelect
            label="Serviço (libera o material)"
            name="servicoId"
            required
            defaultValue={v("servicoId")}
            options={[
              { value: "", label: "Selecione..." },
              ...listaServicos.map((s) => ({ value: s.id, label: s.nome })),
            ]}
          />
          <Campo label="Categoria" name="categoria" defaultValue={v("categoria")} />
          <Campo label="Título" name="titulo" required defaultValue={v("titulo")} />
          <CampoSelect
            label="Tipo"
            name="tipo"
            defaultValue={v("tipo") || "pdf"}
            options={[
              { value: "pdf", label: "PDF" },
              { value: "video", label: "Vídeo" },
              { value: "link", label: "Link" },
            ]}
          />
        </div>
        <div className="mt-4">
          <Campo label="URL" name="url" required defaultValue={v("url")} />
        </div>
      </SectionCard>

      <SubmitButton>Salvar Material</SubmitButton>
    </form>
  );
}
