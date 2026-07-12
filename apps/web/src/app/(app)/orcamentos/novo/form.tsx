"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError, CampoMoeda } from "@/components/ui";
import { criarOrcamento } from "../actions";

export function NovoOrcamentoForm({
  listaClientes,
  listaServicos,
}: {
  listaClientes: { id: string; nome: string }[];
  listaServicos: { id: string; nome: string; valor: string | null }[];
}) {
  const [estado, formAction] = useActionState(criarOrcamento, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <FormError erro={estado?.erro} />

      <SectionCard title="Dados do Orçamento">
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
          <CampoMoeda label="Valor" name="valor" required defaultValue={v("valor")} />
          <Campo label="Válido até" name="validoAte" type="date" defaultValue={v("validoAte")} />
        </div>
      </SectionCard>

      <SubmitButton>Criar Orçamento</SubmitButton>
    </form>
  );
}
