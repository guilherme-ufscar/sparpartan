import { Search } from "lucide-react";

/** Busca via GET — sem JS, preserva outros params através de campos hidden. */
export function SearchBox({
  placeholder,
  valorAtual,
  hiddenParams = {},
}: {
  placeholder: string;
  valorAtual?: string;
  hiddenParams?: Record<string, string | undefined>;
}) {
  return (
    <form method="get" className="flex items-center gap-2">
      {Object.entries(hiddenParams).map(([chave, valor]) =>
        valor ? <input key={chave} type="hidden" name={chave} value={valor} /> : null
      )}
      <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2">
        <Search size={14} className="shrink-0 text-outline" />
        <input
          type="text"
          name="q"
          defaultValue={valorAtual}
          placeholder={placeholder}
          className="w-full bg-transparent text-body-sm text-primary outline-none"
        />
      </div>
    </form>
  );
}
