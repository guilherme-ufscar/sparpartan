CREATE TYPE "public"."evento_status" AS ENUM('pendente', 'confirmado', 'concluido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."evento_tipo" AS ENUM('compromisso', 'prova', 'vencimento');--> statement-breakpoint
CREATE TABLE "agenda_eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid,
	"processo_id" uuid,
	"titulo" text NOT NULL,
	"data_hora" timestamp NOT NULL,
	"tipo" "evento_tipo" DEFAULT 'compromisso' NOT NULL,
	"status" "evento_status" DEFAULT 'pendente' NOT NULL,
	"observacoes" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lembretes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid,
	"mensagem" text NOT NULL,
	"data_lembrete" date NOT NULL,
	"resolvido" boolean DEFAULT false NOT NULL,
	"origem" text DEFAULT 'manual' NOT NULL,
	"referencia_tipo" text,
	"referencia_id" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agenda_eventos" ADD CONSTRAINT "agenda_eventos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_eventos" ADD CONSTRAINT "agenda_eventos_processo_id_processos_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lembretes" ADD CONSTRAINT "lembretes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;