"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError, CampoMoeda } from "@/components/ui";
import { criarDespesa } from "./actions";

export function NovaDespesaForm() {
  const [estado, formAction] = useActionState(criarDespesa, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <SectionCard title="Nova Despesa">
      <form action={formAction} className="space-y-4">
        <FormError erro={estado?.erro} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Campo label="Descrição" name="descricao" required defaultValue={v("descricao")} />
          <CampoMoeda label="Valor" name="valor" required defaultValue={v("valor")} />
          <Campo label="Data" name="data" type="date" required defaultValue={v("data")} />
          <CampoSelect
            label="Categoria"
            name="categoria"
            defaultValue={v("categoria") || "variavel"}
            options={[
              { value: "fixa", label: "Fixa" },
              { value: "variavel", label: "Variável" },
              { value: "imposto", label: "Imposto" },
              { value: "outra", label: "Outra" },
            ]}
          />
          <label className="flex items-center gap-2 text-body-sm text-primary sm:col-span-4">
            <input type="checkbox" name="recorrente" className="h-4 w-4" />
            Despesa fixa mensal (recorrente)
          </label>
          <div className="sm:col-span-4">
            <SubmitButton>Registrar Despesa</SubmitButton>
          </div>
        </div>
      </form>
    </SectionCard>
  );
}
