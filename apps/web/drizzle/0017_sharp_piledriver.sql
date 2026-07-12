CREATE TYPE "public"."cliente_classificacao" AS ENUM('cliente', 'aluno', 'ambos');--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "classificacao" "cliente_classificacao" DEFAULT 'cliente' NOT NULL;--> statement-breakpoint
ALTER TABLE "envios_email" ADD COLUMN "orcamento_id" uuid;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "vendedor_id" uuid;--> statement-breakpoint
ALTER TABLE "servicos_contratados" ADD COLUMN "vendedor_id" uuid;--> statement-breakpoint
ALTER TABLE "envios_email" ADD CONSTRAINT "envios_email_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_vendedor_id_usuarios_id_fk" FOREIGN KEY ("vendedor_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos_contratados" ADD CONSTRAINT "servicos_contratados_vendedor_id_usuarios_id_fk" FOREIGN KEY ("vendedor_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- Backfill: classifica clientes existentes olhando o que já contrataram.
-- 'ambos' quando tem serviço contratado das duas categorias; senão a categoria única encontrada.
UPDATE clientes c SET classificacao = sub.classificacao::cliente_classificacao
FROM (
  SELECT sc.cliente_id,
    CASE
      WHEN bool_or(s.categoria = 'escola') AND bool_or(s.categoria = 'despachante') THEN 'ambos'
      WHEN bool_or(s.categoria = 'escola') THEN 'aluno'
      ELSE 'cliente'
    END AS classificacao
  FROM servicos_contratados sc
  JOIN servicos s ON s.id = sc.servico_id
  GROUP BY sc.cliente_id
) sub
WHERE c.id = sub.cliente_id;