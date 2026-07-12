"use client";

import { useActionState } from "react";
import { CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError } from "@/components/ui";
import { enviarEmailCliente } from "../actions";

export function EnviarEmailForm({
  listaClientes,
  listaTemplates,
}: {
  listaClientes: { id: string; nome: string; email: string | null }[];
  listaTemplates: { id: string; nome: string }[];
}) {
  const [estado, formAction] = useActionState(enviarEmailCliente, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <FormError erro={estado?.erro} />

      <SectionCard title="Destinatário e Template">
        <div className="grid grid-cols-1 gap-4">
          <CampoSelect
            label="Cliente"
            name="clienteId"
            required
            defaultValue={v("clienteId")}
            options={[
              { value: "", label: "Selecione..." },
              ...listaClientes.map((c) => ({
                value: c.id,
                label: c.email ? c.nome : `${c.nome} (sem e-mail)`,
              })),
            ]}
          />
          <CampoSelect
            label="Template"
            name="templateId"
            required
            defaultValue={v("templateId")}
            options={[
              { value: "", label: "Selecione..." },
              ...listaTemplates.map((t) => ({ value: t.id, label: t.nome })),
            ]}
          />
        </div>
      </SectionCard>

      <SubmitButton>Enviar</SubmitButton>
    </form>
  );
}
