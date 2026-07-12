import JSZip from "jszip";
import { extractMergeFields, fillMergeFields } from "./merge-fields";

const DOCUMENT_XML_PATH = "word/document.xml";

export async function extractFieldsFromDocx(buffer: Buffer): Promise<string[]> {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file(DOCUMENT_XML_PATH)?.async("string");
  if (!documentXml) throw new Error("word/document.xml não encontrado no .docx");
  return extractMergeFields(documentXml);
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

  return zip.generateAsync({ type: "nodebuffer" });
}
