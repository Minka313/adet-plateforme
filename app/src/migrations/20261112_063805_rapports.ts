import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_rapports_statut" AS ENUM('brouillon', 'soumis', 'a-corriger', 'valide');
  CREATE TYPE "public"."enum_modeles_rapport_roles_auteurs" AS ENUM('admin', 'editeur', 'bureau', 'responsable', 'membre', 'formateur');
  CREATE TYPE "public"."enum_modeles_rapport_periodicite" AS ENUM('mensuel', 'trimestriel', 'ponctuel');
  CREATE TABLE "rapports_reponses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intitule" varchar NOT NULL,
  	"valeur" varchar
  );
  
  CREATE TABLE "rapports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"modele_id" integer NOT NULL,
  	"periode" varchar NOT NULL,
  	"auteur_id" integer,
  	"statut" "enum_rapports_statut" DEFAULT 'brouillon' NOT NULL,
  	"commentaire" varchar,
  	"valide_par_id" integer,
  	"soumis_le" timestamp(3) with time zone,
  	"valide_le" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rapports_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "modeles_rapport_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intitule" varchar NOT NULL,
  	"aide" varchar,
  	"obligatoire" boolean DEFAULT true
  );
  
  CREATE TABLE "modeles_rapport_roles_auteurs" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_modeles_rapport_roles_auteurs",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "modeles_rapport" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"description" varchar,
  	"periodicite" "enum_modeles_rapport_periodicite" DEFAULT 'mensuel' NOT NULL,
  	"jour_limite" numeric DEFAULT 5,
  	"actif" boolean DEFAULT true,
  	"relances" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "modeles_rapport_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departements_id" integer,
  	"users_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rapports_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "modeles_rapport_id" integer;
  ALTER TABLE "rapports_reponses" ADD CONSTRAINT "rapports_reponses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rapports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rapports" ADD CONSTRAINT "rapports_modele_id_modeles_rapport_id_fk" FOREIGN KEY ("modele_id") REFERENCES "public"."modeles_rapport"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rapports" ADD CONSTRAINT "rapports_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rapports" ADD CONSTRAINT "rapports_valide_par_id_users_id_fk" FOREIGN KEY ("valide_par_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rapports_rels" ADD CONSTRAINT "rapports_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rapports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rapports_rels" ADD CONSTRAINT "rapports_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modeles_rapport_sections" ADD CONSTRAINT "modeles_rapport_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modeles_rapport"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modeles_rapport_roles_auteurs" ADD CONSTRAINT "modeles_rapport_roles_auteurs_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."modeles_rapport"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modeles_rapport_rels" ADD CONSTRAINT "modeles_rapport_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."modeles_rapport"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modeles_rapport_rels" ADD CONSTRAINT "modeles_rapport_rels_departements_fk" FOREIGN KEY ("departements_id") REFERENCES "public"."departements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modeles_rapport_rels" ADD CONSTRAINT "modeles_rapport_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "rapports_reponses_order_idx" ON "rapports_reponses" USING btree ("_order");
  CREATE INDEX "rapports_reponses_parent_id_idx" ON "rapports_reponses" USING btree ("_parent_id");
  CREATE INDEX "rapports_modele_idx" ON "rapports" USING btree ("modele_id");
  CREATE INDEX "rapports_periode_idx" ON "rapports" USING btree ("periode");
  CREATE INDEX "rapports_auteur_idx" ON "rapports" USING btree ("auteur_id");
  CREATE INDEX "rapports_statut_idx" ON "rapports" USING btree ("statut");
  CREATE INDEX "rapports_valide_par_idx" ON "rapports" USING btree ("valide_par_id");
  CREATE INDEX "rapports_updated_at_idx" ON "rapports" USING btree ("updated_at");
  CREATE INDEX "rapports_created_at_idx" ON "rapports" USING btree ("created_at");
  CREATE INDEX "rapports_rels_order_idx" ON "rapports_rels" USING btree ("order");
  CREATE INDEX "rapports_rels_parent_idx" ON "rapports_rels" USING btree ("parent_id");
  CREATE INDEX "rapports_rels_path_idx" ON "rapports_rels" USING btree ("path");
  CREATE INDEX "rapports_rels_users_id_idx" ON "rapports_rels" USING btree ("users_id");
  CREATE INDEX "modeles_rapport_sections_order_idx" ON "modeles_rapport_sections" USING btree ("_order");
  CREATE INDEX "modeles_rapport_sections_parent_id_idx" ON "modeles_rapport_sections" USING btree ("_parent_id");
  CREATE INDEX "modeles_rapport_roles_auteurs_order_idx" ON "modeles_rapport_roles_auteurs" USING btree ("order");
  CREATE INDEX "modeles_rapport_roles_auteurs_parent_idx" ON "modeles_rapport_roles_auteurs" USING btree ("parent_id");
  CREATE INDEX "modeles_rapport_updated_at_idx" ON "modeles_rapport" USING btree ("updated_at");
  CREATE INDEX "modeles_rapport_created_at_idx" ON "modeles_rapport" USING btree ("created_at");
  CREATE INDEX "modeles_rapport_rels_order_idx" ON "modeles_rapport_rels" USING btree ("order");
  CREATE INDEX "modeles_rapport_rels_parent_idx" ON "modeles_rapport_rels" USING btree ("parent_id");
  CREATE INDEX "modeles_rapport_rels_path_idx" ON "modeles_rapport_rels" USING btree ("path");
  CREATE INDEX "modeles_rapport_rels_departements_id_idx" ON "modeles_rapport_rels" USING btree ("departements_id");
  CREATE INDEX "modeles_rapport_rels_users_id_idx" ON "modeles_rapport_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rapports_fk" FOREIGN KEY ("rapports_id") REFERENCES "public"."rapports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_modeles_rapport_fk" FOREIGN KEY ("modeles_rapport_id") REFERENCES "public"."modeles_rapport"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_rapports_id_idx" ON "payload_locked_documents_rels" USING btree ("rapports_id");
  CREATE INDEX "payload_locked_documents_rels_modeles_rapport_id_idx" ON "payload_locked_documents_rels" USING btree ("modeles_rapport_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "rapports_reponses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rapports" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rapports_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "modeles_rapport_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "modeles_rapport_roles_auteurs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "modeles_rapport" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "modeles_rapport_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "rapports_reponses" CASCADE;
  DROP TABLE "rapports" CASCADE;
  DROP TABLE "rapports_rels" CASCADE;
  DROP TABLE "modeles_rapport_sections" CASCADE;
  DROP TABLE "modeles_rapport_roles_auteurs" CASCADE;
  DROP TABLE "modeles_rapport" CASCADE;
  DROP TABLE "modeles_rapport_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rapports_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_modeles_rapport_fk";
  
  DROP INDEX "payload_locked_documents_rels_rapports_id_idx";
  DROP INDEX "payload_locked_documents_rels_modeles_rapport_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rapports_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "modeles_rapport_id";
  DROP TYPE "public"."enum_rapports_statut";
  DROP TYPE "public"."enum_modeles_rapport_roles_auteurs";
  DROP TYPE "public"."enum_modeles_rapport_periodicite";`)
}
