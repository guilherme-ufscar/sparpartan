"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { engenheiros } from "@/db/schema";

export async function criarEngenheiro(formData: FormData) {
  const nomeCompleto = String(formData.get("nomeCompleto") ?? "").trim();
  if (!nomeCompleto) throw new Error("Informe o nome completo do engenheiro.");

  await db.insert(engenheiros).values({
    nomeCompleto,
    cpf: String(formData.get("cpf") ?? "").trim() || null,
    crea: String(formData.get("crea") ?? "").trim() || null,
    tituloProfissional: String(formData.get("tituloProfissional") ?? "").trim() || null,
  });

  revalidatePath("/obras/engenheiros");
  revalidatePath("/obras/novo");
}
