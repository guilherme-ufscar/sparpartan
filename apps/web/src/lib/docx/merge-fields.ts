const RUN_REGEX = /<w:r\b[^>]*>[\s\S]*?<\/w:r>/g;
const FLDCHAR_REGEX = /<w:fldChar[^>]*w:fldCharType="(begin|separate|end)"[^>]*\/?>/;
const INSTR_TEXT_REGEX = /<w:instrText[^>]*>([\s\S]*?)<\/w:instrText>/g;
const RPR_REGEX = /<w:rPr>[\s\S]*?<\/w:rPr>/;

type FieldBlock = {
  runs: string[];
  fieldName: string | null;
};

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Word can break a single MERGEFIELD instruction (e.g. "MERGEFIELD N_INSC")
 * across several <w:instrText> runs after a spell-check re-flow. Walking
 * run-by-run and buffering everything between fldChar "begin" and "end"
 * is the only reliable way to recover the full field name.
 */
function walkFieldBlocks(xml: string, onBlock: (block: FieldBlock) => string): string {
  let result = "";
  let cursor = 0;
  let inField = false;
  let currentRuns: string[] = [];
  let currentInstrText = "";

  RUN_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = RUN_REGEX.exec(xml)) !== null) {
    const run = match[0];
    result += xml.slice(cursor, match.index);
    cursor = RUN_REGEX.lastIndex;

    const fldCharMatch = run.match(FLDCHAR_REGEX);

    if (fldCharMatch?.[1] === "begin") {
      inField = true;
      currentRuns = [run];
      currentInstrText = "";
      continue;
    }

    if (inField) {
      currentRuns.push(run);
      let instrMatch: RegExpExecArray | null;
      INSTR_TEXT_REGEX.lastIndex = 0;
      while ((instrMatch = INSTR_TEXT_REGEX.exec(run)) !== null) {
        currentInstrText += decodeXmlEntities(instrMatch[1]);
      }

      if (fldCharMatch?.[1] === "end") {
        inField = false;
        const fieldMatch = currentInstrText.match(/MERGEFIELD\s+([^\s\\]+)/);
        result += onBlock({ runs: currentRuns, fieldName: fieldMatch?.[1] ?? null });
        currentRuns = [];
      }
      continue;
    }

    result += run;
  }

  result += xml.slice(cursor);
  return result;
}

export function extractMergeFields(documentXml: string): string[] {
  const seen = new Set<string>();
  walkFieldBlocks(documentXml, (block) => {
    if (block.fieldName) seen.add(block.fieldName);
    return "";
  });
  return Array.from(seen);
}

export function fillMergeFields(
  documentXml: string,
  values: Record<string, string>
): string {
  return walkFieldBlocks(documentXml, (block) => {
    if (!block.fieldName) return block.runs.join("");

    const value = values[block.fieldName] ?? "";
    const rPrSource = block.runs[block.runs.length - 1] ?? block.runs[0];
    const rPrMatch = rPrSource.match(RPR_REGEX);
    const rPr = rPrMatch ? rPrMatch[0] : "";

    return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r>`;
  });
}
