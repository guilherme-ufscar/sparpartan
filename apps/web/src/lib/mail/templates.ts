export function resolverVariaveis(texto: string, variaveis: Record<string, string>): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (_, chave) => variaveis[chave] ?? "");
}
