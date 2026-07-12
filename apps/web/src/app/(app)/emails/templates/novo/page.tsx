"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError } from "@/components/ui";
import { criarTemplate } from "../../actions";

export default function NovoTemplatePage() {
  const [estado, formAction] = useActionState(criarTemplate, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <div className="space-y-gutter">
      <h1 className="font-display text-headline-lg font-bold text-primary">Novo Template</h1>
      <p className="max-w-2xl text-sm text-outline">
        Use <code>{"{{nome}}"}</code> e <code>{"{{email}}"}</code> no assunto ou corpo — o sistema
        substitui pelos dados do cliente no momento do envio.
      </p>

      <form action={formAction} className="max-w-2xl space-y-6">
        <FormError erro={estado?.erro} />

        <SectionCard title="Template">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Nome" name="nome" required defaultValue={v("nome")} />
            <CampoSelect
              label="Tipo"
              name="tipo"
              defaultValue={v("tipo") || "geral"}
              options={[
                { value: "orcamento", label: "Orçamento" },
                { value: "vencimento", label: "Vencimento" },
                { value: "agendamento", label: "Agendamento" },
                { value: "cobranca", label: "Cobrança" },
                { value: "protocolo", label: "Protocolo" },
                { value: "prova", label: "Prova" },
                { value: "aniversario", label: "Aniversário" },
                { value: "geral", label: "Geral" },
              ]}
            />
          </div>
          <div className="mt-4">
            <Campo label="Assunto" name="assunto" required defaultValue={v("assunto")} />
          </div>
          <label className="mt-4 flex flex-col gap-1">
            <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">
              Corpo (HTML)
            </span>
            <textarea
              name="corpo"
              rows={8}
              required
              defaultValue={v("corpo")}
              className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
            />
          </label>
        </SectionCard>

        <SubmitButton>Salvar Template</SubmitButton>
      </form>
    </div>
  );
}
