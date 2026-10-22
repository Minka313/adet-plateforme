import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "photos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"accueil1_id" integer,
  	"accueil2_id" integer,
  	"accueil3_id" integer,
  	"kolda_id" integer,
  	"opportunites_id" integer,
  	"formations_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "photos" ADD CONSTRAINT "photos_accueil1_id_media_id_fk" FOREIGN KEY ("accueil1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_accueil2_id_media_id_fk" FOREIGN KEY ("accueil2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_accueil3_id_media_id_fk" FOREIGN KEY ("accueil3_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_kolda_id_media_id_fk" FOREIGN KEY ("kolda_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_opportunites_id_media_id_fk" FOREIGN KEY ("opportunites_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_formations_id_media_id_fk" FOREIGN KEY ("formations_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "photos_accueil1_idx" ON "photos" USING btree ("accueil1_id");
  CREATE INDEX "photos_accueil2_idx" ON "photos" USING btree ("accueil2_id");
  CREATE INDEX "photos_accueil3_idx" ON "photos" USING btree ("accueil3_id");
  CREATE INDEX "photos_kolda_idx" ON "photos" USING btree ("kolda_id");
  CREATE INDEX "photos_opportunites_idx" ON "photos" USING btree ("opportunites_id");
  CREATE INDEX "photos_formations_idx" ON "photos" USING btree ("formations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "photos" CASCADE;`)
}
