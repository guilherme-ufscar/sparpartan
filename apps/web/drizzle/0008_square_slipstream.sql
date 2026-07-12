CREATE TYPE "public"."envio_status" AS ENUM('enviado', 'falhou');--> statement-breakpoint
CREATE TABLE "envios_email" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid,
	"template_id" uuid,
	"destinatario" text NOT NULL,
	"assunto" text NOT NULL,
	"corpo" text NOT NULL,
	"status" "envio_status" DEFAULT 'enviado' NOT NULL,
	"erro" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates_email" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"assunto" text NOT NULL,
	"corpo" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "envios_email" ADD CONSTRAINT "envios_email_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envios_email" ADD CONSTRAINT "envios_email_template_id_templates_email_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates_email"("id") ON DELETE set null ON UPDATE no action;