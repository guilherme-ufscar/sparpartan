"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { salvatagemItens } from "@/db/schema";

export async function adicionarItemSalvatagem(embarcacaoId: string, formData: FormData) {
  const item = String(formData.get("item") ?? "").trim();
  if (!item) throw new Error("Item é obrigatório");

  await db.insert(salvatagemItens).values({
    embarcacaoId,
    item,
    quantidade: Number(formData.get("quantidade") ?? 1) || 1,
    validade: String(formData.get("validade") ?? "") || null,
  });

  revalidatePath(`/embarcacoes/${embarcacaoId}`);
}
