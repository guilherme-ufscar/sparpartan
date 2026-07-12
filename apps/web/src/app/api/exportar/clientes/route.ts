import { NextResponse } from "next/server";
import { isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { clientes } from "@/db/schema";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const lista = await db
    .select({
      nome: clientes.nome,
      cpfCnpj: clientes.cpfCnpj,
      email: clientes.email,
      telefone: clientes.telefone,
      celular: clientes.celular,
      cidade: clientes.cidade,
      uf: clientes.uf,
    })
    .from(clientes)
    .where(isNull(clientes.excluidoEm))
    .orderBy(desc(clientes.criadoEm));

  const linhas = [
    "Nome,CPF/CNPJ,Email,Telefone,Celular,Cidade,UF",
    ...lista.map((c) =>
      [c.nome, c.cpfCnpj, c.email ?? "", c.telefone ?? "", c.celular ?? "", c.cidade ?? "", c.uf ?? ""]
        .map(csvEscape)
        .join(",")
    ),
  ];

  return new NextResponse(linhas.join("\n"), {
    headers: {
      "Content-Disposition": 'attachment; filename="clientes.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
