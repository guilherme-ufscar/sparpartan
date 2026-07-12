CREATE TYPE "public"."despesa_categoria" AS ENUM('fixa', 'variavel', 'imposto', 'outra');--> statement-breakpoint
CREATE TABLE "despesas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"descricao" text NOT NULL,
	"valor" numeric NOT NULL,
	"categoria" "despesa_categoria" DEFAULT 'variavel' NOT NULL,
	"data" date NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
