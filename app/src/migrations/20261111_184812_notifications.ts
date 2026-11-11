import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_notifications_type" AS ENUM('annonce', 'inscription', 'message', 'tache', 'reunion', 'systeme');
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"destinataire_id" integer NOT NULL,
  	"titre" varchar NOT NULL,
  	"texte" varchar,
  	"lien" varchar,
  	"type" "enum_notifications_type" DEFAULT 'systeme' NOT NULL,
  	"lue" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "abonnements_push" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"utilisateur_id" integer NOT NULL,
  	"endpoint" varchar NOT NULL,
  	"p256dh" varchar NOT NULL,
  	"auth" varchar NOT NULL,
  	"appareil" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notifications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "abonnements_push_id" integer;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_destinataire_id_users_id_fk" FOREIGN KEY ("destinataire_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "abonnements_push" ADD CONSTRAINT "abonnements_push_utilisateur_id_users_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "notifications_destinataire_idx" ON "notifications" USING btree ("destinataire_id");
  CREATE INDEX "notifications_lue_idx" ON "notifications" USING btree ("lue");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE INDEX "abonnements_push_utilisateur_idx" ON "abonnements_push" USING btree ("utilisateur_id");
  CREATE UNIQUE INDEX "abonnements_push_endpoint_idx" ON "abonnements_push" USING btree ("endpoint");
  CREATE INDEX "abonnements_push_updated_at_idx" ON "abonnements_push" USING btree ("updated_at");
  CREATE INDEX "abonnements_push_created_at_idx" ON "abonnements_push" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_abonnements_push_fk" FOREIGN KEY ("abonnements_push_id") REFERENCES "public"."abonnements_push"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_abonnements_push_id_idx" ON "payload_locked_documents_rels" USING btree ("abonnements_push_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "abonnements_push" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "abonnements_push" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notifications_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_abonnements_push_fk";
  
  DROP INDEX "payload_locked_documents_rels_notifications_id_idx";
  DROP INDEX "payload_locked_documents_rels_abonnements_push_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notifications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "abonnements_push_id";
  DROP TYPE "public"."enum_notifications_type";`)
}
