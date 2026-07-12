CREATE TYPE "public"."material_tipo" AS ENUM('pdf', 'video', 'link');--> statement-breakpoint
CREATE TABLE "materiais_estudo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"servico_id" uuid NOT NULL,
	"categoria" text,
	"titulo" text NOT NULL,
	"tipo" "material_tipo" DEFAULT 'pdf' NOT NULL,
	"url" text NOT NULL,
	"ordem" integer DEFAULT 1 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progresso_estudo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	"concluido" boolean DEFAULT false NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "materiais_estudo" ADD CONSTRAINT "materiais_estudo_servico_id_servicos_id_fk" FOREIGN KEY ("servico_id") REFERENCES "public"."servicos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progresso_estudo" ADD CONSTRAINT "progresso_estudo_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progresso_estudo" ADD CONSTRAINT "progresso_estudo_material_id_materiais_estudo_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materiais_estudo"("id") ON DELETE cascade ON UPDATE no action;