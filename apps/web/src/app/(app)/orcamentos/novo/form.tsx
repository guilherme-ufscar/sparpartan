"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError, CampoMoeda } from "@/components/ui";
import { criarOrcamento } from "../actions";
import type { EstadoForm } from "@/lib/validacao";

export function NovoOrcamentoForm({
  listaClientes,
  listaServicos,
  orcamentoInicial,
  action = criarOrcamento,
  submitLabel = "Criar Orçamento",
}: {
  listaClientes: { id: string; nome: string }[];
  listaServicos: { id: string; nome: string; valor: string | null }[];
  orcamentoInicial?: Record<string, unknown>;
  action?: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  submitLabel?: string;
}) {
  const [estado, formAction] = useActionState(action, null);
  const v = (nome: string): string | number =>
    (estado?.valores?.[nome] as string | undefined) ??
    ((orcamentoInicial?.[nome] as string | number | null | undefined) ?? "");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <FormError erro={estado?.erro} />

      <SectionCard title="Dados do Orçamento">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoSelect
            label="Cliente"
            name="clienteId"
            required
            defaultValue={String(v("clienteId"))}
            options={[
              { value: "", label: "Selecione..." },
              ...listaClientes.map((c) => ({ value: c.id, label: c.nome })),
            ]}
          />
          <CampoSelect
            label="Serviço"
            name="servicoId"
            required
            defaultValue={String(v("servicoId"))}
            options={[
              { value: "", label: "Selecione..." },
              ...listaServicos.map((s) => ({ value: s.id, label: s.nome })),
            ]}
          />
          <CampoMoeda label="Valor" name="valor" required defaultValue={v("valor")} />
          <Campo label="Válido até" name="validoAte" type="date" defaultValue={v("validoAte")} />
        </div>
        <label className="mt-4 flex flex-col gap-1">
          <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">
            Descrição do item/serviço (aparece no PDF)
          </span>
          <textarea
            name="descricao"
            rows={2}
            defaultValue={v("descricao")}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
          />
        </label>
        <label className="mt-4 flex flex-col gap-1">
          <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">
            Observações (aparece no PDF)
          </span>
          <textarea
            name="observacoes"
            rows={3}
            defaultValue={v("observacoes")}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
          />
        </label>
      </SectionCard>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
