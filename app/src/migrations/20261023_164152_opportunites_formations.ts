import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_opportunites_type" AS ENUM('financement', 'appel-a-projets', 'emploi', 'formation', 'concours');
  CREATE TYPE "public"."enum_opportunites_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__opportunites_v_version_type" AS ENUM('financement', 'appel-a-projets', 'emploi', 'formation', 'concours');
  CREATE TYPE "public"."enum__opportunites_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__opportunites_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_structures_type" AS ENUM('financement', 'accompagnement', 'emploi', 'formation');
  CREATE TYPE "public"."enum_formations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__formations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__formations_v_published_locale" AS ENUM('fr', 'en');
  CREATE TABLE "opportunites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_opportunites_type",
  	"date_limite" timestamp(3) with time zone,
  	"structure_id" integer,
  	"lien" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_opportunites_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "opportunites_locales" (
  	"titre" varchar,
  	"resume" varchar,
  	"public_cible" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_opportunites_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__opportunites_v_version_type",
  	"version_date_limite" timestamp(3) with time zone,
  	"version_structure_id" integer,
  	"version_lien" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__opportunites_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__opportunites_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_opportunites_v_locales" (
  	"version_titre" varchar,
  	"version_resume" varchar,
  	"version_public_cible" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "structures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sigle" varchar,
  	"type" "enum_structures_type" NOT NULL,
  	"ordre" numeric DEFAULT 10,
  	"source" varchar,
  	"site_web" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "structures_locales" (
  	"nom" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"a_kolda" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "formations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lieu" varchar,
  	"prochaine_session" timestamp(3) with time zone,
  	"inscriptions_ouvertes" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_formations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "formations_locales" (
  	"titre" varchar,
  	"resume" varchar,
  	"public_cible" varchar,
  	"duree" varchar,
  	"cout" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_formations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_lieu" varchar,
  	"version_prochaine_session" timestamp(3) with time zone,
  	"version_inscriptions_ouvertes" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__formations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__formations_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_formations_v_locales" (
  	"version_titre" varchar,
  	"version_resume" varchar,
  	"version_public_cible" varchar,
  	"version_duree" varchar,
  	"version_cout" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "opportunites_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "structures_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "formations_id" integer;
  ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_structure_id_structures_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."structures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opportunites_locales" ADD CONSTRAINT "opportunites_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunites_v" ADD CONSTRAINT "_opportunites_v_parent_id_opportunites_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunites_v" ADD CONSTRAINT "_opportunites_v_version_structure_id_structures_id_fk" FOREIGN KEY ("version_structure_id") REFERENCES "public"."structures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunites_v_locales" ADD CONSTRAINT "_opportunites_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunites_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "structures_locales" ADD CONSTRAINT "structures_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."structures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "formations_locales" ADD CONSTRAINT "formations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_formations_v" ADD CONSTRAINT "_formations_v_parent_id_formations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."formations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formations_v_locales" ADD CONSTRAINT "_formations_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_formations_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "opportunites_structure_idx" ON "opportunites" USING btree ("structure_id");
  CREATE INDEX "opportunites_updated_at_idx" ON "opportunites" USING btree ("updated_at");
  CREATE INDEX "opportunites_created_at_idx" ON "opportunites" USING btree ("created_at");
  CREATE INDEX "opportunites__status_idx" ON "opportunites" USING btree ("_status");
  CREATE UNIQUE INDEX "opportunites_locales_locale_parent_id_unique" ON "opportunites_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "opportunites_locales_parent_id_idx" ON "opportunites_locales" USING btree ("_parent_id");
  CREATE INDEX "_opportunites_v_parent_idx" ON "_opportunites_v" USING btree ("parent_id");
  CREATE INDEX "_opportunites_v_version_version_structure_idx" ON "_opportunites_v" USING btree ("version_structure_id");
  CREATE INDEX "_opportunites_v_version_version_updated_at_idx" ON "_opportunites_v" USING btree ("version_updated_at");
  CREATE INDEX "_opportunites_v_version_version_created_at_idx" ON "_opportunites_v" USING btree ("version_created_at");
  CREATE INDEX "_opportunites_v_version_version__status_idx" ON "_opportunites_v" USING btree ("version__status");
  CREATE INDEX "_opportunites_v_created_at_idx" ON "_opportunites_v" USING btree ("created_at");
  CREATE INDEX "_opportunites_v_updated_at_idx" ON "_opportunites_v" USING btree ("updated_at");
  CREATE INDEX "_opportunites_v_snapshot_idx" ON "_opportunites_v" USING btree ("snapshot");
  CREATE INDEX "_opportunites_v_published_locale_idx" ON "_opportunites_v" USING btree ("published_locale");
  CREATE INDEX "_opportunites_v_latest_idx" ON "_opportunites_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_opportunites_v_locales_locale_parent_id_unique" ON "_opportunites_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_opportunites_v_locales_parent_id_idx" ON "_opportunites_v_locales" USING btree ("_parent_id");
  CREATE INDEX "structures_updated_at_idx" ON "structures" USING btree ("updated_at");
  CREATE INDEX "structures_created_at_idx" ON "structures" USING btree ("created_at");
  CREATE UNIQUE INDEX "structures_locales_locale_parent_id_unique" ON "structures_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "structures_locales_parent_id_idx" ON "structures_locales" USING btree ("_parent_id");
  CREATE INDEX "formations_updated_at_idx" ON "formations" USING btree ("updated_at");
  CREATE INDEX "formations_created_at_idx" ON "formations" USING btree ("created_at");
  CREATE INDEX "formations__status_idx" ON "formations" USING btree ("_status");
  CREATE UNIQUE INDEX "formations_locales_locale_parent_id_unique" ON "formations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "formations_locales_parent_id_idx" ON "formations_locales" USING btree ("_parent_id");
  CREATE INDEX "_formations_v_parent_idx" ON "_formations_v" USING btree ("parent_id");
  CREATE INDEX "_formations_v_version_version_updated_at_idx" ON "_formations_v" USING btree ("version_updated_at");
  CREATE INDEX "_formations_v_version_version_created_at_idx" ON "_formations_v" USING btree ("version_created_at");
  CREATE INDEX "_formations_v_version_version__status_idx" ON "_formations_v" USING btree ("version__status");
  CREATE INDEX "_formations_v_created_at_idx" ON "_formations_v" USING btree ("created_at");
  CREATE INDEX "_formations_v_updated_at_idx" ON "_formations_v" USING btree ("updated_at");
  CREATE INDEX "_formations_v_snapshot_idx" ON "_formations_v" USING btree ("snapshot");
  CREATE INDEX "_formations_v_published_locale_idx" ON "_formations_v" USING btree ("published_locale");
  CREATE INDEX "_formations_v_latest_idx" ON "_formations_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_formations_v_locales_locale_parent_id_unique" ON "_formations_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_formations_v_locales_parent_id_idx" ON "_formations_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opportunites_fk" FOREIGN KEY ("opportunites_id") REFERENCES "public"."opportunites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_structures_fk" FOREIGN KEY ("structures_id") REFERENCES "public"."structures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_formations_fk" FOREIGN KEY ("formations_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_opportunites_id_idx" ON "payload_locked_documents_rels" USING btree ("opportunites_id");
  CREATE INDEX "payload_locked_documents_rels_structures_id_idx" ON "payload_locked_documents_rels" USING btree ("structures_id");
  CREATE INDEX "payload_locked_documents_rels_formations_id_idx" ON "payload_locked_documents_rels" USING btree ("formations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "opportunites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "opportunites_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_opportunites_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_opportunites_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "structures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "structures_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "formations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "formations_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_formations_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_formations_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "opportunites" CASCADE;
  DROP TABLE "opportunites_locales" CASCADE;
  DROP TABLE "_opportunites_v" CASCADE;
  DROP TABLE "_opportunites_v_locales" CASCADE;
  DROP TABLE "structures" CASCADE;
  DROP TABLE "structures_locales" CASCADE;
  DROP TABLE "formations" CASCADE;
  DROP TABLE "formations_locales" CASCADE;
  DROP TABLE "_formations_v" CASCADE;
  DROP TABLE "_formations_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_opportunites_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_structures_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_formations_fk";
  
  DROP INDEX "payload_locked_documents_rels_opportunites_id_idx";
  DROP INDEX "payload_locked_documents_rels_structures_id_idx";
  DROP INDEX "payload_locked_documents_rels_formations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "opportunites_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "structures_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "formations_id";
  DROP TYPE "public"."enum_opportunites_type";
  DROP TYPE "public"."enum_opportunites_status";
  DROP TYPE "public"."enum__opportunites_v_version_type";
  DROP TYPE "public"."enum__opportunites_v_version_status";
  DROP TYPE "public"."enum__opportunites_v_published_locale";
  DROP TYPE "public"."enum_structures_type";
  DROP TYPE "public"."enum_formations_status";
  DROP TYPE "public"."enum__formations_v_version_status";
  DROP TYPE "public"."enum__formations_v_published_locale";`)
}
