// Duplicado de apps/web/src/lib/mail/templates.ts — o worker é um pacote npm
// separado, sem path-alias compartilhado com a web, então não dá para importar direto.
export function resolverVariaveis(texto: string, variaveis: Record<string, string>): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (_, chave) => variaveis[chave] ?? "");
}
