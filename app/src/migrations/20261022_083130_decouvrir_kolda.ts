import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_territoires_type" AS ENUM('region', 'departement');
  CREATE TYPE "public"."enum_filieres_icone" AS ENUM('ressources', 'partenariats', 'capacites', 'innovation', 'suivi');
  CREATE TABLE "territoires_indicateurs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valeur" varchar NOT NULL,
  	"source" varchar NOT NULL,
  	"annee" varchar NOT NULL,
  	"lien" varchar
  );
  
  CREATE TABLE "territoires_indicateurs_locales" (
  	"libelle" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "territoires_reperes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "territoires_reperes_locales" (
  	"titre" varchar NOT NULL,
  	"texte" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "territoires" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"type" "enum_territoires_type" DEFAULT 'departement' NOT NULL,
  	"ordre" numeric DEFAULT 10,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "territoires_locales" (
  	"nom" varchar NOT NULL,
  	"resume" varchar NOT NULL,
  	"presentation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "filieres_indicateurs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valeur" varchar NOT NULL,
  	"source" varchar NOT NULL,
  	"annee" varchar NOT NULL,
  	"lien" varchar
  );
  
  CREATE TABLE "filieres_indicateurs_locales" (
  	"libelle" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "filieres_reperes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "filieres_reperes_locales" (
  	"titre" varchar NOT NULL,
  	"texte" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "filieres" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"ordre" numeric DEFAULT 10,
  	"icone" "enum_filieres_icone" DEFAULT 'ressources',
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "filieres_locales" (
  	"nom" varchar NOT NULL,
  	"resume" varchar NOT NULL,
  	"presentation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "territoires_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "filieres_id" integer;
  ALTER TABLE "territoires_indicateurs" ADD CONSTRAINT "territoires_indicateurs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."territoires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "territoires_indicateurs_locales" ADD CONSTRAINT "territoires_indicateurs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."territoires_indicateurs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "territoires_reperes" ADD CONSTRAINT "territoires_reperes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."territoires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "territoires_reperes_locales" ADD CONSTRAINT "territoires_reperes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."territoires_reperes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "territoires" ADD CONSTRAINT "territoires_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "territoires_locales" ADD CONSTRAINT "territoires_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."territoires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "filieres_indicateurs" ADD CONSTRAINT "filieres_indicateurs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."filieres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "filieres_indicateurs_locales" ADD CONSTRAINT "filieres_indicateurs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."filieres_indicateurs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "filieres_reperes" ADD CONSTRAINT "filieres_reperes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."filieres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "filieres_reperes_locales" ADD CONSTRAINT "filieres_reperes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."filieres_reperes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "filieres" ADD CONSTRAINT "filieres_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "filieres_locales" ADD CONSTRAINT "filieres_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."filieres"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "territoires_indicateurs_order_idx" ON "territoires_indicateurs" USING btree ("_order");
  CREATE INDEX "territoires_indicateurs_parent_id_idx" ON "territoires_indicateurs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "territoires_indicateurs_locales_locale_parent_id_unique" ON "territoires_indicateurs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "territoires_indicateurs_locales_parent_id_idx" ON "territoires_indicateurs_locales" USING btree ("_parent_id");
  CREATE INDEX "territoires_reperes_order_idx" ON "territoires_reperes" USING btree ("_order");
  CREATE INDEX "territoires_reperes_parent_id_idx" ON "territoires_reperes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "territoires_reperes_locales_locale_parent_id_unique" ON "territoires_reperes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "territoires_reperes_locales_parent_id_idx" ON "territoires_reperes_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "territoires_slug_idx" ON "territoires" USING btree ("slug");
  CREATE INDEX "territoires_photo_idx" ON "territoires" USING btree ("photo_id");
  CREATE INDEX "territoires_updated_at_idx" ON "territoires" USING btree ("updated_at");
  CREATE INDEX "territoires_created_at_idx" ON "territoires" USING btree ("created_at");
  CREATE UNIQUE INDEX "territoires_locales_locale_parent_id_unique" ON "territoires_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "territoires_locales_parent_id_idx" ON "territoires_locales" USING btree ("_parent_id");
  CREATE INDEX "filieres_indicateurs_order_idx" ON "filieres_indicateurs" USING btree ("_order");
  CREATE INDEX "filieres_indicateurs_parent_id_idx" ON "filieres_indicateurs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "filieres_indicateurs_locales_locale_parent_id_unique" ON "filieres_indicateurs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "filieres_indicateurs_locales_parent_id_idx" ON "filieres_indicateurs_locales" USING btree ("_parent_id");
  CREATE INDEX "filieres_reperes_order_idx" ON "filieres_reperes" USING btree ("_order");
  CREATE INDEX "filieres_reperes_parent_id_idx" ON "filieres_reperes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "filieres_reperes_locales_locale_parent_id_unique" ON "filieres_reperes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "filieres_reperes_locales_parent_id_idx" ON "filieres_reperes_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "filieres_slug_idx" ON "filieres" USING btree ("slug");
  CREATE INDEX "filieres_photo_idx" ON "filieres" USING btree ("photo_id");
  CREATE INDEX "filieres_updated_at_idx" ON "filieres" USING btree ("updated_at");
  CREATE INDEX "filieres_created_at_idx" ON "filieres" USING btree ("created_at");
  CREATE UNIQUE INDEX "filieres_locales_locale_parent_id_unique" ON "filieres_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "filieres_locales_parent_id_idx" ON "filieres_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_territoires_fk" FOREIGN KEY ("territoires_id") REFERENCES "public"."territoires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_filieres_fk" FOREIGN KEY ("filieres_id") REFERENCES "public"."filieres"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_territoires_id_idx" ON "payload_locked_documents_rels" USING btree ("territoires_id");
  CREATE INDEX "payload_locked_documents_rels_filieres_id_idx" ON "payload_locked_documents_rels" USING btree ("filieres_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "territoires_indicateurs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "territoires_indicateurs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "territoires_reperes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "territoires_reperes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "territoires" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "territoires_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "filieres_indicateurs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "filieres_indicateurs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "filieres_reperes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "filieres_reperes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "filieres" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "filieres_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "territoires_indicateurs" CASCADE;
  DROP TABLE "territoires_indicateurs_locales" CASCADE;
  DROP TABLE "territoires_reperes" CASCADE;
  DROP TABLE "territoires_reperes_locales" CASCADE;
  DROP TABLE "territoires" CASCADE;
  DROP TABLE "territoires_locales" CASCADE;
  DROP TABLE "filieres_indicateurs" CASCADE;
  DROP TABLE "filieres_indicateurs_locales" CASCADE;
  DROP TABLE "filieres_reperes" CASCADE;
  DROP TABLE "filieres_reperes_locales" CASCADE;
  DROP TABLE "filieres" CASCADE;
  DROP TABLE "filieres_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_territoires_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_filieres_fk";
  
  DROP INDEX "payload_locked_documents_rels_territoires_id_idx";
  DROP INDEX "payload_locked_documents_rels_filieres_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "territoires_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "filieres_id";
  DROP TYPE "public"."enum_territoires_type";
  DROP TYPE "public"."enum_filieres_icone";`)
}
