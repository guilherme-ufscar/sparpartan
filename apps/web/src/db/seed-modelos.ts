import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./index";
import { modelosDocumento } from "./schema";
import { extractFieldsFromDocx } from "../lib/docx/document";

function uploadsDir() {
  return process.env.UPLOADS_DIR ?? "./data/uploads";
}

/** Pasta empacotada dentro da imagem com os modelos de documento da Marinha. */
function documentosDir() {
  return path.join(process.cwd(), "documentos");
}

const CATEGORIA_POR_PASTA: Record<string, string> = {
  "carteira de trabalho nautico": "Carteira de Trabalho Náutico",
  embarcacao: "Embarcação",
  "embarcação comercial": "Embarcação Comercial",
  "habilitação nautica arrais amador": "Habilitação Náutica — Arrais Amador",
  "habilitação nautica motonauta": "Habilitação Náutica — Motonauta",
  jetski: "Jetski",
  "preenchimento de obras - normam-303": "Obras (NORMAM-303)",
};

function detectarNorma(nomeArquivo: string): string | null {
  const match = /normam[\s-]?\d+/i.exec(nomeArquivo);
  return match ? match[0].toUpperCase().replace(/\s+/g, " ") : null;
}

/**
 * Varre `documentos/<categoria>/*.docx` (empacotada na imagem — ver Dockerfile)
 * e importa cada modelo ainda não cadastrado, replicando o que
 * `importarModelo` faz manualmente pela tela /documentos. Idempotente: pula
 * modelos já existentes (mesmo nome + categoria), então rodar de novo em um
 * deploy futuro só adiciona o que for novo na pasta.
 */
export async function importarModelosLocais() {
  let pastas: string[];
  try {
    pastas = await readdir(documentosDir(), { withFileTypes: true }).then((entradas) =>
      entradas.filter((e) => e.isDirectory()).map((e) => e.name)
    );
  } catch {
    console.log("Pasta documentos/ não encontrada — pulando importação automática de modelos.");
    return;
  }

  const existentes = await db.select({ nome: modelosDocumento.nome, categoria: modelosDocumento.categoria }).from(modelosDocumento);
  const jaImportados = new Set(existentes.map((m) => `${m.categoria ?? ""}::${m.nome}`));

  const modelosDir = path.join(uploadsDir(), "modelos");
  await mkdir(modelosDir, { recursive: true });

  let importados = 0;

  for (const pasta of pastas) {
    const categoria = CATEGORIA_POR_PASTA[pasta] ?? pasta;
    const pastaCompleta = path.join(documentosDir(), pasta);
    const arquivos = await readdir(pastaCompleta);

    for (const arquivo of arquivos) {
      if (!arquivo.toLowerCase().endsWith(".docx")) continue;

      const nome = arquivo.replace(/\.docx$/i, "").trim();
      const chave = `${categoria}::${nome}`;
      if (jaImportados.has(chave)) continue;

      const bytes = await readFile(path.join(pastaCompleta, arquivo));
      const campos = await extractFieldsFromDocx(bytes);

      const nomeArquivoDestino = `${randomUUID()}.docx`;
      await writeFile(path.join(modelosDir, nomeArquivoDestino), bytes);

      await db.insert(modelosDocumento).values({
        nome,
        categoria,
        norma: detectarNorma(arquivo),
        arquivoCaminho: path.join("modelos", nomeArquivoDestino),
        campos,
      });

      importados++;
      console.log(`Modelo importado: [${categoria}] ${nome} (${campos.length} campos)`);
    }
  }

  console.log(importados > 0 ? `${importados} modelo(s) novo(s) importado(s).` : "Nenhum modelo novo para importar.");
}
