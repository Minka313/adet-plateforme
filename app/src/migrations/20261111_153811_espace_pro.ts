import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_users_roles" ADD VALUE 'bureau';
  ALTER TYPE "public"."enum_users_roles" ADD VALUE 'responsable';
  ALTER TYPE "public"."enum_users_roles" ADD VALUE 'membre';
  ALTER TYPE "public"."enum_users_roles" ADD VALUE 'formateur';
  CREATE TABLE "annonces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"contenu" varchar NOT NULL,
  	"epinglee" boolean DEFAULT false,
  	"auteur_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "fonction" varchar;
  ALTER TABLE "users" ADD COLUMN "pole_id" integer;
  ALTER TABLE "users" ADD COLUMN "telephone" varchar;
  ALTER TABLE "users" ADD COLUMN "actif" boolean DEFAULT true;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "annonces_id" integer;
  ALTER TABLE "annonces" ADD CONSTRAINT "annonces_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "annonces_auteur_idx" ON "annonces" USING btree ("auteur_id");
  CREATE INDEX "annonces_updated_at_idx" ON "annonces" USING btree ("updated_at");
  CREATE INDEX "annonces_created_at_idx" ON "annonces" USING btree ("created_at");
  ALTER TABLE "users" ADD CONSTRAINT "users_pole_id_departements_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."departements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_annonces_fk" FOREIGN KEY ("annonces_id") REFERENCES "public"."annonces"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_pole_idx" ON "users" USING btree ("pole_id");
  CREATE INDEX "payload_locked_documents_rels_annonces_id_idx" ON "payload_locked_documents_rels" USING btree ("annonces_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "annonces" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "annonces" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_pole_id_departements_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_annonces_fk";
  
  ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_roles";
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editeur');
  ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_roles" USING "value"::"public"."enum_users_roles";
  DROP INDEX "users_pole_idx";
  DROP INDEX "payload_locked_documents_rels_annonces_id_idx";
  ALTER TABLE "users" DROP COLUMN "fonction";
  ALTER TABLE "users" DROP COLUMN "pole_id";
  ALTER TABLE "users" DROP COLUMN "telephone";
  ALTER TABLE "users" DROP COLUMN "actif";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "annonces_id";`)
}
