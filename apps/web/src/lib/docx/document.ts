import JSZip from "jszip";
import { extractMergeFields, fillMergeFields } from "./merge-fields";

const DOCUMENT_XML_PATH = "word/document.xml";
const SETTINGS_XML_PATH = "word/settings.xml";

export async function extractFieldsFromDocx(buffer: Buffer): Promise<string[]> {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file(DOCUMENT_XML_PATH)?.async("string");
  if (!documentXml) throw new Error("word/document.xml não encontrado no .docx");
  return extractMergeFields(documentXml);
}

/**
 * Alguns modelos (ex.: NORMAM-202) foram criados com o recurso de Mala Direta do
 * Word, apontando para uma planilha Excel que só existia no computador de quem
 * criou o modelo (`word/settings.xml` guarda um `<w:mailMerge>` com o caminho
 * absoluto da planilha). Como só reescrevemos `document.xml` — os MERGEFIELDs já
 * viram texto estático — esse bloco de mala direta fica órfão, mas ainda marca o
 * documento como "mainDocumentType=formLetters" ligado a uma fonte de dados
 * inexistente. O LibreOffice (usado pelo Gotenberg para converter para PDF) tenta
 * processar essa mala direta ao abrir o arquivo e, sem conseguir achar a planilha,
 * pode renderizar seções do documento em branco. Removendo o bloco, o documento
 * volta a ser tratado como um .docx normal na conversão.
 */
function removerMalaDireta(settingsXml: string): string {
  return settingsXml.replace(/<w:mailMerge>[\s\S]*?<\/w:mailMerge>/, "");
}

export async function renderDocx(
  buffer: Buffer,
  values: Record<string, string>
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file(DOCUMENT_XML_PATH)?.async("string");
  if (!documentXml) throw new Error("word/document.xml não encontrado no .docx");

  const filledXml = fillMergeFields(documentXml, values);
  zip.file(DOCUMENT_XML_PATH, filledXml);

  const settingsXml = await zip.file(SETTINGS_XML_PATH)?.async("string");
  if (settingsXml?.includes("<w:mailMerge>")) {
    zip.file(SETTINGS_XML_PATH, removerMalaDireta(settingsXml));
  }

  return zip.generateAsync({ type: "nodebuffer" });
}
