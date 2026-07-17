"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { mensagens } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function enviarMensagem(formData: FormData) {
  const corpo = String(formData.get("corpo") ?? "").trim();
  if (!corpo) return;

  const session = await auth();
  const usuario = session?.user as { id?: string; name?: string; tipo?: string } | undefined;
  if (usuario?.tipo !== "equipe") throw new Error("Somente a equipe pode usar o chat.");

  await db.insert(mensagens).values({
    usuarioId: usuario.id ?? null,
    usuarioNome: usuario.name ?? "Equipe",
    corpo,
  });

  revalidatePath("/chat");
}
