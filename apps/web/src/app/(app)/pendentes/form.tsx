"use client";

import { useActionState } from "react";
import { Campo } from "@/components/ui/form-field";
import { SubmitButton, FormError } from "@/components/ui";
import { criarPendencia } from "./actions";

export function PendenciaForm() {
  const [estado, formAction] = useActionState(criarPendencia, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <form action={formAction} className="space-y-4">
      <FormError erro={estado?.erro} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Campo label="Descrição" name="mensagem" required defaultValue={v("mensagem")} />
        </div>
        <Campo label="Data" name="dataLembrete" type="date" defaultValue={v("dataLembrete")} />
        <div className="flex items-end">
          <SubmitButton>Adicionar Pendência</SubmitButton>
        </div>
      </div>
    </form>
  );
}
