"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { lembretes } from "@/db/schema";

export async function resolverLembrete(lembreteId: string) {
  await db.update(lembretes).set({ resolvido: true }).where(eq(lembretes.id, lembreteId));
  revalidatePath("/lembretes");
}

export async function resolverTodosLembretes() {
  // origem='manual' são as pendências avulsas do operador — vivem em /pendentes,
  // não em /lembretes, então "Resolver todos" aqui não deve varrê-las junto.
  await db
    .update(lembretes)
    .set({ resolvido: true })
    .where(and(eq(lembretes.resolvido, false), ne(lembretes.origem, "manual")));
  revalidatePath("/lembretes");
}
