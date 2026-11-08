import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_territoires_type" ADD VALUE 'commune';
  ALTER TABLE "territoires" ADD COLUMN "departement_id" integer;
  ALTER TABLE "territoires" ADD COLUMN "arrondissement" varchar;
  ALTER TABLE "territoires" ADD COLUMN "habitants" numeric;
  ALTER TABLE "territoires" ADD COLUMN "habitants_source" varchar DEFAULT 'ANSD, RGPH-5 (2023)';
  ALTER TABLE "territoires" ADD CONSTRAINT "territoires_departement_id_territoires_id_fk" FOREIGN KEY ("departement_id") REFERENCES "public"."territoires"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "territoires_departement_idx" ON "territoires" USING btree ("departement_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "territoires" DROP CONSTRAINT "territoires_departement_id_territoires_id_fk";
  
  ALTER TABLE "territoires" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "territoires" ALTER COLUMN "type" SET DEFAULT 'departement'::text;
  DROP TYPE "public"."enum_territoires_type";
  CREATE TYPE "public"."enum_territoires_type" AS ENUM('region', 'departement');
  ALTER TABLE "territoires" ALTER COLUMN "type" SET DEFAULT 'departement'::"public"."enum_territoires_type";
  ALTER TABLE "territoires" ALTER COLUMN "type" SET DATA TYPE "public"."enum_territoires_type" USING "type"::"public"."enum_territoires_type";
  DROP INDEX "territoires_departement_idx";
  ALTER TABLE "territoires" DROP COLUMN "departement_id";
  ALTER TABLE "territoires" DROP COLUMN "arrondissement";
  ALTER TABLE "territoires" DROP COLUMN "habitants";
  ALTER TABLE "territoires" DROP COLUMN "habitants_source";`)
}
