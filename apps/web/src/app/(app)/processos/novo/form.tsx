"use client";

import { useActionState } from "react";
import { CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError } from "@/components/ui";
import { criarProcesso } from "../actions";

export function NovoProcessoForm({
  listaClientes,
  listaServicos,
}: {
  listaClientes: { id: string; nome: string }[];
  listaServicos: { id: string; nome: string }[];
}) {
  const [estado, formAction] = useActionState(criarProcesso, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <FormError erro={estado?.erro} />

      <SectionCard title="1. Cliente e Serviço">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoSelect
            label="Cliente"
            name="clienteId"
            required
            defaultValue={v("clienteId")}
            options={[
              { value: "", label: "Selecione..." },
              ...listaClientes.map((c) => ({ value: c.id, label: c.nome })),
            ]}
          />
          <CampoSelect
            label="Serviço"
            name="servicoId"
            required
            defaultValue={v("servicoId")}
            options={[
              { value: "", label: "Selecione..." },
              ...listaServicos.map((s) => ({ value: s.id, label: s.nome })),
            ]}
          />
        </div>
        <p className="mt-4 text-sm text-outline">
          Embarcação e checklist de anexos são configurados na próxima tela.
        </p>
      </SectionCard>

      <SubmitButton>Abrir Processo</SubmitButton>
    </form>
  );
}
