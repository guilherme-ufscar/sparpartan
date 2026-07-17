CREATE TYPE "public"."embarcacao_classe" AS ENUM('esporte_recreio', 'comercial');--> statement-breakpoint
CREATE TYPE "public"."taxa_status" AS ENUM('pendente', 'pago');--> statement-breakpoint
ALTER TYPE "public"."servico_categoria" ADD VALUE 'engenharia';--> statement-breakpoint
ALTER TYPE "public"."servico_categoria" ADD VALUE 'ultrassom';--> statement-breakpoint
CREATE TABLE "agenda_interessados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"cliente_id" uuid,
	"nome_interessado" text NOT NULL,
	"cpf_interessado" text,
	"servico_solicitado" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arquivos_empresa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categoria" text NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"arquivo_caminho" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engenheiros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_completo" text NOT NULL,
	"cpf" text,
	"crea" text,
	"titulo_profissional" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mensagens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"usuario_nome" text NOT NULL,
	"corpo" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxas_pagar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid,
	"cliente_id" uuid,
	"servico_contratado_id" uuid,
	"descricao" text NOT NULL,
	"valor" numeric NOT NULL,
	"vencimento" date,
	"status" "taxa_status" DEFAULT 'pendente' NOT NULL,
	"arquivo_caminho" text,
	"pago_em" timestamp,
	"forma_pagamento" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agenda_eventos" ADD COLUMN "local" text;--> statement-breakpoint
ALTER TABLE "agenda_eventos" ADD COLUMN "representante_legal" text;--> statement-breakpoint
ALTER TABLE "arquivos" ADD COLUMN "embarcacao_id" uuid;--> statement-breakpoint
ALTER TABLE "despesas" ADD COLUMN "recorrente" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "despesas" ADD COLUMN "dia_vencimento" integer;--> statement-breakpoint
ALTER TABLE "embarcacoes" ADD COLUMN "classe" "embarcacao_classe" DEFAULT 'esporte_recreio' NOT NULL;--> statement-breakpoint
ALTER TABLE "embarcacoes" ADD COLUMN "excluido_em" timestamp;--> statement-breakpoint
ALTER TABLE "obras" ADD COLUMN "engenheiro_id" uuid;--> statement-breakpoint
ALTER TABLE "obras" ADD COLUMN "excluido_em" timestamp;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "descricao" text;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "observacoes" text;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "excluido_em" timestamp;--> statement-breakpoint
ALTER TABLE "processos" ADD COLUMN "excluido_em" timestamp;--> statement-breakpoint
ALTER TABLE "agenda_interessados" ADD CONSTRAINT "agenda_interessados_evento_id_agenda_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."agenda_eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_interessados" ADD CONSTRAINT "agenda_interessados_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxas_pagar" ADD CONSTRAINT "taxas_pagar_processo_id_processos_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxas_pagar" ADD CONSTRAINT "taxas_pagar_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxas_pagar" ADD CONSTRAINT "taxas_pagar_servico_contratado_id_servicos_contratados_id_fk" FOREIGN KEY ("servico_contratado_id") REFERENCES "public"."servicos_contratados"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_embarcacao_id_embarcacoes_id_fk" FOREIGN KEY ("embarcacao_id") REFERENCES "public"."embarcacoes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obras" ADD CONSTRAINT "obras_engenheiro_id_engenheiros_id_fk" FOREIGN KEY ("engenheiro_id") REFERENCES "public"."engenheiros"("id") ON DELETE set null ON UPDATE no action;