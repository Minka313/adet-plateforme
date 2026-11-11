import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_taches_statut" AS ENUM('a-faire', 'en-cours', 'fait');
  CREATE TYPE "public"."enum_taches_priorite" AS ENUM('basse', 'normale', 'haute');
  CREATE TABLE "taches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"description" varchar,
  	"statut" "enum_taches_statut" DEFAULT 'a-faire' NOT NULL,
  	"priorite" "enum_taches_priorite" DEFAULT 'normale' NOT NULL,
  	"echeance" timestamp(3) with time zone,
  	"pole_id" integer,
  	"cree_par_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "taches_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "reunions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"debut" timestamp(3) with time zone NOT NULL,
  	"duree" numeric DEFAULT 60,
  	"lieu" varchar,
  	"ordre_du_jour" varchar,
  	"toute_l_equipe" boolean DEFAULT true,
  	"compte_rendu" varchar,
  	"organisateur_id" integer,
  	"rappel_veille" boolean DEFAULT false,
  	"rappel_jour" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reunions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "taches_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reunions_id" integer;
  ALTER TABLE "taches" ADD CONSTRAINT "taches_pole_id_departements_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."departements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "taches" ADD CONSTRAINT "taches_cree_par_id_users_id_fk" FOREIGN KEY ("cree_par_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "taches_rels" ADD CONSTRAINT "taches_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."taches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "taches_rels" ADD CONSTRAINT "taches_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reunions" ADD CONSTRAINT "reunions_organisateur_id_users_id_fk" FOREIGN KEY ("organisateur_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reunions_rels" ADD CONSTRAINT "reunions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reunions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reunions_rels" ADD CONSTRAINT "reunions_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "taches_statut_idx" ON "taches" USING btree ("statut");
  CREATE INDEX "taches_echeance_idx" ON "taches" USING btree ("echeance");
  CREATE INDEX "taches_pole_idx" ON "taches" USING btree ("pole_id");
  CREATE INDEX "taches_cree_par_idx" ON "taches" USING btree ("cree_par_id");
  CREATE INDEX "taches_updated_at_idx" ON "taches" USING btree ("updated_at");
  CREATE INDEX "taches_created_at_idx" ON "taches" USING btree ("created_at");
  CREATE INDEX "taches_rels_order_idx" ON "taches_rels" USING btree ("order");
  CREATE INDEX "taches_rels_parent_idx" ON "taches_rels" USING btree ("parent_id");
  CREATE INDEX "taches_rels_path_idx" ON "taches_rels" USING btree ("path");
  CREATE INDEX "taches_rels_users_id_idx" ON "taches_rels" USING btree ("users_id");
  CREATE INDEX "reunions_debut_idx" ON "reunions" USING btree ("debut");
  CREATE INDEX "reunions_organisateur_idx" ON "reunions" USING btree ("organisateur_id");
  CREATE INDEX "reunions_updated_at_idx" ON "reunions" USING btree ("updated_at");
  CREATE INDEX "reunions_created_at_idx" ON "reunions" USING btree ("created_at");
  CREATE INDEX "reunions_rels_order_idx" ON "reunions_rels" USING btree ("order");
  CREATE INDEX "reunions_rels_parent_idx" ON "reunions_rels" USING btree ("parent_id");
  CREATE INDEX "reunions_rels_path_idx" ON "reunions_rels" USING btree ("path");
  CREATE INDEX "reunions_rels_users_id_idx" ON "reunions_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_taches_fk" FOREIGN KEY ("taches_id") REFERENCES "public"."taches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reunions_fk" FOREIGN KEY ("reunions_id") REFERENCES "public"."reunions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_taches_id_idx" ON "payload_locked_documents_rels" USING btree ("taches_id");
  CREATE INDEX "payload_locked_documents_rels_reunions_id_idx" ON "payload_locked_documents_rels" USING btree ("reunions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "taches" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "taches_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reunions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reunions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "taches" CASCADE;
  DROP TABLE "taches_rels" CASCADE;
  DROP TABLE "reunions" CASCADE;
  DROP TABLE "reunions_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_taches_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reunions_fk";
  
  DROP INDEX "payload_locked_documents_rels_taches_id_idx";
  DROP INDEX "payload_locked_documents_rels_reunions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "taches_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reunions_id";
  DROP TYPE "public"."enum_taches_statut";
  DROP TYPE "public"."enum_taches_priorite";`)
}
