/**
 * Heurísticas sobre o texto cru do Tesseract para RG/CPF/CNH/CRLV brasileiros.
 * OCR de foto de documento é ruim por natureza — cada regex é tolerante a
 * espaços/quebras de linha extras e nunca lança erro, só retorna o que achar.
 */
export type CamposExtraidos = {
  nome?: string;
  cpfCnpj?: string;
  rg?: string;
  dataNascimento?: string;
};

function normalizar(texto: string) {
  return texto.replace(/\r/g, "").replace(/[ \t]+/g, " ");
}

function extrairCpf(texto: string): string | undefined {
  const match = texto.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);
  if (!match) return undefined;
  const digitos = match[0].replace(/\D/g, "");
  if (digitos.length !== 11) return undefined;
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

function extrairCnpj(texto: string): string | undefined {
  const match = texto.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
  if (!match) return undefined;
  const digitos = match[0].replace(/\D/g, "");
  if (digitos.length !== 14) return undefined;
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
}

function extrairRg(texto: string): string | undefined {
  // RG costuma aparecer perto de um rótulo — "REGISTRO GERAL", "RG", "IDENTIDADE".
  const linhaComRotulo = texto.match(/(?:REGISTRO\s*GERAL|IDENTIDADE|\bRG\b)[^\d]{0,15}([\d.\-]{7,12})/i);
  if (linhaComRotulo) {
    const digitos = linhaComRotulo[1].replace(/\D/g, "");
    if (digitos.length >= 7 && digitos.length <= 9) return linhaComRotulo[1].trim();
  }
  return undefined;
}

function extrairDataNascimento(texto: string): string | undefined {
  const rotulo = texto.match(/NASC[^\d]{0,15}(\d{2})[./-](\d{2})[./-](\d{4})/i);
  const generico = rotulo ?? texto.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
  if (!generico) return undefined;
  const [, dia, mes, ano] = generico;
  const anoNum = Number(ano);
  if (anoNum < 1900 || anoNum > new Date().getFullYear()) return undefined;
  return `${ano}-${mes}-${dia}`;
}

function extrairNome(texto: string): string | undefined {
  // "NOME" seguido da linha seguinte é o padrão mais comum em RG/CNH brasileiros.
  const linhas = texto.split("\n").map((l) => l.trim()).filter(Boolean);
  const idxRotulo = linhas.findIndex((l) => /^NOME\b/i.test(l));
  if (idxRotulo >= 0) {
    const mesmaLinha = linhas[idxRotulo].replace(/^NOME\s*[:\-]?\s*/i, "").trim();
    if (mesmaLinha.length >= 4) return tituloCase(mesmaLinha);
    const proximaLinha = linhas[idxRotulo + 1];
    if (proximaLinha && /^[A-ZÀ-Ú\s]{4,}$/.test(proximaLinha)) return tituloCase(proximaLinha);
  }
  return undefined;
}

function tituloCase(texto: string) {
  return texto
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}

export function extrairCampos(textoOcr: string): CamposExtraidos {
  const texto = normalizar(textoOcr);

  return {
    nome: extrairNome(texto),
    cpfCnpj: extrairCpf(texto) ?? extrairCnpj(texto),
    rg: extrairRg(texto),
    dataNascimento: extrairDataNascimento(texto),
  };
}
