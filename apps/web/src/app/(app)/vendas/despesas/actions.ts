"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { despesas } from "@/db/schema";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";

export async function criarDespesa(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor = String(formData.get("valor") ?? "");
  const data = String(formData.get("data") ?? "");
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!descricao, "Informe a descrição.")
    .exigir(!!valor && Number(valor) > 0, "Informe um valor válido.")
    .exigir(!!data, "Informe a data.").erro;
  if (erro) return { erro, valores };

  await db.insert(despesas).values({
    descricao,
    valor,
    data,
    categoria: String(formData.get("categoria") ?? "variavel") as
      | "fixa"
      | "variavel"
      | "imposto"
      | "outra",
  });

  redirect("/vendas/despesas");
}
