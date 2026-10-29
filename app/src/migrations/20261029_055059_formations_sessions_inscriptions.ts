import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inscriptions_sexe" AS ENUM('femme', 'homme');
  CREATE TYPE "public"."enum_inscriptions_statut" AS ENUM('recue', 'confirmee', 'attente', 'annulee');
  CREATE TYPE "public"."enum_inscriptions_langue" AS ENUM('fr', 'en');
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"formation_id" integer NOT NULL,
  	"date_debut" timestamp(3) with time zone NOT NULL,
  	"date_fin" timestamp(3) with time zone,
  	"lieu" varchar,
  	"places" numeric,
  	"date_limite_inscription" timestamp(3) with time zone,
  	"inscriptions_ouvertes" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" integer NOT NULL,
  	"nom" varchar NOT NULL,
  	"telephone" varchar NOT NULL,
  	"email" varchar,
  	"commune" varchar,
  	"sexe" "enum_inscriptions_sexe",
  	"age" numeric,
  	"motivation" varchar,
  	"statut" "enum_inscriptions_statut" DEFAULT 'recue' NOT NULL,
  	"langue" "enum_inscriptions_langue",
  	"empreinte" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sessions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inscriptions_id" integer;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_formation_id_formations_id_fk" FOREIGN KEY ("formation_id") REFERENCES "public"."formations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "sessions_formation_idx" ON "sessions" USING btree ("formation_id");
  CREATE INDEX "sessions_date_debut_idx" ON "sessions" USING btree ("date_debut");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "inscriptions_session_idx" ON "inscriptions" USING btree ("session_id");
  CREATE INDEX "inscriptions_statut_idx" ON "inscriptions" USING btree ("statut");
  CREATE INDEX "inscriptions_empreinte_idx" ON "inscriptions" USING btree ("empreinte");
  CREATE INDEX "inscriptions_updated_at_idx" ON "inscriptions" USING btree ("updated_at");
  CREATE INDEX "inscriptions_created_at_idx" ON "inscriptions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inscriptions_fk" FOREIGN KEY ("inscriptions_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_inscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("inscriptions_id");
  -- Une « prochaine session » déjà saisie devient une session (titre complété au prochain enregistrement)
  INSERT INTO "sessions" ("titre", "formation_id", "date_debut", "inscriptions_ouvertes")
  SELECT fl."titre", f."id", f."prochaine_session", COALESCE(f."inscriptions_ouvertes", false)
  FROM "formations" f
  LEFT JOIN "formations_locales" fl ON fl."_parent_id" = f."id" AND fl."_locale" = 'fr'
  WHERE f."prochaine_session" IS NOT NULL;
  ALTER TABLE "formations" DROP COLUMN "prochaine_session";
  ALTER TABLE "formations" DROP COLUMN "inscriptions_ouvertes";
  ALTER TABLE "_formations_v" DROP COLUMN "version_prochaine_session";
  ALTER TABLE "_formations_v" DROP COLUMN "version_inscriptions_ouvertes";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inscriptions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "inscriptions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sessions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inscriptions_fk";
  
  DROP INDEX "payload_locked_documents_rels_sessions_id_idx";
  DROP INDEX "payload_locked_documents_rels_inscriptions_id_idx";
  ALTER TABLE "formations" ADD COLUMN "prochaine_session" timestamp(3) with time zone;
  ALTER TABLE "formations" ADD COLUMN "inscriptions_ouvertes" boolean DEFAULT false;
  ALTER TABLE "_formations_v" ADD COLUMN "version_prochaine_session" timestamp(3) with time zone;
  ALTER TABLE "_formations_v" ADD COLUMN "version_inscriptions_ouvertes" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sessions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inscriptions_id";
  DROP TYPE "public"."enum_inscriptions_sexe";
  DROP TYPE "public"."enum_inscriptions_statut";
  DROP TYPE "public"."enum_inscriptions_langue";`)
}
