"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError, CampoMoeda } from "@/components/ui";
import { criarItemCatalogo } from "./actions";

export function NovoItemCatalogoForm() {
  const [estado, formAction] = useActionState(criarItemCatalogo, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <SectionCard title="Novo Item">
      <form action={formAction} className="space-y-4">
        <FormError erro={estado?.erro} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <CampoSelect
            label="Tipo"
            name="tipo"
            defaultValue={v("tipo") || "embarcacao"}
            options={[
              { value: "embarcacao", label: "Embarcação" },
              { value: "motor", label: "Motor" },
              { value: "carreta", label: "Carreta" },
            ]}
          />
          <Campo label="Descrição" name="descricao" required defaultValue={v("descricao")} />
          <Campo label="Marca" name="marca" defaultValue={v("marca")} />
          <Campo label="Modelo" name="modelo" defaultValue={v("modelo")} />
          <CampoMoeda label="Preço" name="preco" defaultValue={v("preco")} />
          <div className="sm:col-span-5">
            <SubmitButton>Adicionar ao Catálogo</SubmitButton>
          </div>
        </div>
      </form>
    </SectionCard>
  );
}
