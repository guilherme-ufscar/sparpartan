"use client";

import { AlertOctagon } from "lucide-react";
import { Button, LinkButton } from "@/components/ui";

export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="rounded-pill bg-danger-container p-4 text-on-danger-container">
        <AlertOctagon size={28} />
      </span>
      <div>
        <h1 className="font-display text-headline-md font-bold text-primary">
          Algo deu errado
        </h1>
        <p className="mt-2 max-w-md text-body-md text-outline">
          {error.message || "Não foi possível concluir a operação."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <LinkButton href="/" variant="outlined">
          Voltar para a Home
        </LinkButton>
      </div>
    </div>
  );
}
