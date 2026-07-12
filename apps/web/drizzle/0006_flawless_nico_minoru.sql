CREATE TYPE "public"."orcamento_status" AS ENUM('pendente', 'aprovado', 'recusado', 'expirado');--> statement-breakpoint
CREATE TYPE "public"."pagamento_status" AS ENUM('pendente', 'pago', 'atrasado');--> statement-breakpoint
CREATE TABLE "orcamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" text NOT NULL,
	"cliente_id" uuid NOT NULL,
	"servico_id" uuid NOT NULL,
	"embarcacao_id" uuid,
	"valor" numeric NOT NULL,
	"status" "orcamento_status" DEFAULT 'pendente' NOT NULL,
	"valido_ate" date,
	"pdf_caminho" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orcamentos_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"servico_contratado_id" uuid NOT NULL,
	"valor" numeric NOT NULL,
	"data_pagamento" date,
	"forma_pagamento" text,
	"status" "pagamento_status" DEFAULT 'pendente' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servicos_contratados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orcamento_id" uuid,
	"cliente_id" uuid NOT NULL,
	"servico_id" uuid NOT NULL,
	"processo_id" uuid,
	"valor" numeric NOT NULL,
	"data_contratacao" date NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_servico_id_servicos_id_fk" FOREIGN KEY ("servico_id") REFERENCES "public"."servicos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_embarcacao_id_embarcacoes_id_fk" FOREIGN KEY ("embarcacao_id") REFERENCES "public"."embarcacoes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_servico_contratado_id_servicos_contratados_id_fk" FOREIGN KEY ("servico_contratado_id") REFERENCES "public"."servicos_contratados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos_contratados" ADD CONSTRAINT "servicos_contratados_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos_contratados" ADD CONSTRAINT "servicos_contratados_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos_contratados" ADD CONSTRAINT "servicos_contratados_servico_id_servicos_id_fk" FOREIGN KEY ("servico_id") REFERENCES "public"."servicos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos_contratados" ADD CONSTRAINT "servicos_contratados_processo_id_processos_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE set null ON UPDATE no action;