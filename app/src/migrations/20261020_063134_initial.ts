import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_realisations_axe" AS ENUM('capacites', 'partenariats', 'ressources', 'innovation', 'suivi');
  CREATE TYPE "public"."enum_realisations_statut" AS ENUM('en-cours', 'termine', 'a-venir');
  CREATE TYPE "public"."enum_realisations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__realisations_v_version_axe" AS ENUM('capacites', 'partenariats', 'ressources', 'innovation', 'suivi');
  CREATE TYPE "public"."enum__realisations_v_version_statut" AS ENUM('en-cours', 'termine', 'a-venir');
  CREATE TYPE "public"."enum__realisations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__realisations_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_actualites_categorie" AS ENUM('vie-associative', 'formation', 'partenariat', 'evenement', 'territoire');
  CREATE TYPE "public"."enum_actualites_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__actualites_v_version_categorie" AS ENUM('vie-associative', 'formation', 'partenariat', 'evenement', 'territoire');
  CREATE TYPE "public"."enum__actualites_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__actualites_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_partenaires_type" AS ENUM('public', 'collectivite', 'technique', 'international', 'prive', 'societe-civile');
  CREATE TYPE "public"."enum_documents_categorie" AS ENUM('rapport', 'institutionnel', 'etude', 'plaquette');
  CREATE TYPE "public"."enum_messages_langue" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_messages_objet" AS ENUM('information', 'partenariat', 'adhesion', 'formation', 'autre');
  CREATE TYPE "public"."enum_abonnes_langue" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editeur');
  CREATE TYPE "public"."enum_coordonnees_reseaux_reseau" AS ENUM('facebook', 'linkedin', 'x', 'instagram', 'youtube', 'tiktok');
  CREATE TABLE "realisations_chiffres" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valeur" varchar
  );
  
  CREATE TABLE "realisations_chiffres_locales" (
  	"libelle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "realisations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"slug" varchar,
  	"axe" "enum_realisations_axe",
  	"statut" "enum_realisations_statut" DEFAULT 'termine',
  	"date_debut" timestamp(3) with time zone,
  	"date_fin" timestamp(3) with time zone,
  	"en_avant" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_realisations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "realisations_locales" (
  	"titre" varchar,
  	"resume" varchar,
  	"contenu" jsonb,
  	"lieu" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "realisations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"partenaires_id" integer
  );
  
  CREATE TABLE "_realisations_v_version_chiffres" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"valeur" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_realisations_v_version_chiffres_locales" (
  	"libelle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_realisations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer,
  	"version_slug" varchar,
  	"version_axe" "enum__realisations_v_version_axe",
  	"version_statut" "enum__realisations_v_version_statut" DEFAULT 'termine',
  	"version_date_debut" timestamp(3) with time zone,
  	"version_date_fin" timestamp(3) with time zone,
  	"version_en_avant" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__realisations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__realisations_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_realisations_v_locales" (
  	"version_titre" varchar,
  	"version_resume" varchar,
  	"version_contenu" jsonb,
  	"version_lieu" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_realisations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"partenaires_id" integer
  );
  
  CREATE TABLE "actualites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"slug" varchar,
  	"date" timestamp(3) with time zone,
  	"categorie" "enum_actualites_categorie" DEFAULT 'vie-associative',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_actualites_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "actualites_locales" (
  	"titre" varchar,
  	"resume" varchar,
  	"contenu" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_actualites_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer,
  	"version_slug" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_categorie" "enum__actualites_v_version_categorie" DEFAULT 'vie-associative',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__actualites_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__actualites_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_actualites_v_locales" (
  	"version_titre" varchar,
  	"version_resume" varchar,
  	"version_contenu" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "partenaires" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar NOT NULL,
  	"logo_id" integer,
  	"type" "enum_partenaires_type" DEFAULT 'technique',
  	"site_web" varchar,
  	"ordre" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partenaires_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "equipe" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar NOT NULL,
  	"departement_id" integer,
  	"photo_id" integer,
  	"ordre" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "equipe_locales" (
  	"fonction" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "departements_missions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "departements_missions_locales" (
  	"texte" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "departements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sigle" varchar,
  	"ordre" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departements_locales" (
  	"nom" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"categorie" "enum_documents_categorie" DEFAULT 'rapport',
  	"annee" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "documents_locales" (
  	"titre" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_vignette_url" varchar,
  	"sizes_vignette_width" numeric,
  	"sizes_vignette_height" numeric,
  	"sizes_vignette_mime_type" varchar,
  	"sizes_vignette_filesize" numeric,
  	"sizes_vignette_filename" varchar,
  	"sizes_carte_url" varchar,
  	"sizes_carte_width" numeric,
  	"sizes_carte_height" numeric,
  	"sizes_carte_mime_type" varchar,
  	"sizes_carte_filesize" numeric,
  	"sizes_carte_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar NOT NULL,
  	"email" varchar,
  	"telephone" varchar,
  	"organisation" varchar,
  	"langue" "enum_messages_langue",
  	"objet" "enum_messages_objet",
  	"message" varchar NOT NULL,
  	"traite" boolean,
  	"empreinte" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "abonnes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"langue" "enum_abonnes_langue" DEFAULT 'fr',
  	"actif" boolean DEFAULT true,
  	"consentement" timestamp(3) with time zone,
  	"empreinte" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"realisations_id" integer,
  	"actualites_id" integer,
  	"partenaires_id" integer,
  	"equipe_id" integer,
  	"departements_id" integer,
  	"documents_id" integer,
  	"media_id" integer,
  	"messages_id" integer,
  	"abonnes_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "association_chiffres" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valeur" varchar NOT NULL
  );
  
  CREATE TABLE "association_chiffres_locales" (
  	"libelle" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "association_valeurs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "association_valeurs_locales" (
  	"titre" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "association_axes_objectifs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "association_axes_objectifs_locales" (
  	"texte" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "association_axes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "association_axes_locales" (
  	"titre" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "association_demarche" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "association_demarche_locales" (
  	"titre" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "association_regions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "association_regions_locales" (
  	"nom" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "association" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sigle" varchar DEFAULT 'ADET' NOT NULL,
  	"image_accueil_id" integer,
  	"citation_auteur" varchar,
  	"citation_photo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "association_locales" (
  	"nom" varchar NOT NULL,
  	"accroche" varchar,
  	"introduction" varchar,
  	"constat" varchar,
  	"reponse" varchar,
  	"citation" varchar,
  	"citation_fonction" varchar,
  	"vision" varchar NOT NULL,
  	"mission" varchar NOT NULL,
  	"zone_titre" varchar DEFAULT 'La Casamance naturelle, notre point de départ',
  	"zone_texte" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "coordonnees_telephones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"numero" varchar NOT NULL
  );
  
  CREATE TABLE "coordonnees_reseaux" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reseau" "enum_coordonnees_reseaux_reseau" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "coordonnees" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"adresse" varchar,
  	"email" varchar,
  	"whatsapp" varchar,
  	"recepisse" varchar,
  	"ninea" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "realisations_chiffres" ADD CONSTRAINT "realisations_chiffres_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations_chiffres_locales" ADD CONSTRAINT "realisations_chiffres_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations_chiffres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations_locales" ADD CONSTRAINT "realisations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations_rels" ADD CONSTRAINT "realisations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations_rels" ADD CONSTRAINT "realisations_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations_rels" ADD CONSTRAINT "realisations_rels_partenaires_fk" FOREIGN KEY ("partenaires_id") REFERENCES "public"."partenaires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v_version_chiffres" ADD CONSTRAINT "_realisations_v_version_chiffres_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_realisations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v_version_chiffres_locales" ADD CONSTRAINT "_realisations_v_version_chiffres_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_realisations_v_version_chiffres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_parent_id_realisations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."realisations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v_locales" ADD CONSTRAINT "_realisations_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_realisations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v_rels" ADD CONSTRAINT "_realisations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_realisations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v_rels" ADD CONSTRAINT "_realisations_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v_rels" ADD CONSTRAINT "_realisations_v_rels_partenaires_fk" FOREIGN KEY ("partenaires_id") REFERENCES "public"."partenaires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "actualites" ADD CONSTRAINT "actualites_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "actualites_locales" ADD CONSTRAINT "actualites_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."actualites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_actualites_v" ADD CONSTRAINT "_actualites_v_parent_id_actualites_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."actualites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_actualites_v" ADD CONSTRAINT "_actualites_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_actualites_v_locales" ADD CONSTRAINT "_actualites_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_actualites_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partenaires" ADD CONSTRAINT "partenaires_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partenaires_locales" ADD CONSTRAINT "partenaires_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partenaires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "equipe" ADD CONSTRAINT "equipe_departement_id_departements_id_fk" FOREIGN KEY ("departement_id") REFERENCES "public"."departements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "equipe" ADD CONSTRAINT "equipe_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "equipe_locales" ADD CONSTRAINT "equipe_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."equipe"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departements_missions" ADD CONSTRAINT "departements_missions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departements_missions_locales" ADD CONSTRAINT "departements_missions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departements_missions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departements_locales" ADD CONSTRAINT "departements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_locales" ADD CONSTRAINT "documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_realisations_fk" FOREIGN KEY ("realisations_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_actualites_fk" FOREIGN KEY ("actualites_id") REFERENCES "public"."actualites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partenaires_fk" FOREIGN KEY ("partenaires_id") REFERENCES "public"."partenaires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_equipe_fk" FOREIGN KEY ("equipe_id") REFERENCES "public"."equipe"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departements_fk" FOREIGN KEY ("departements_id") REFERENCES "public"."departements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_abonnes_fk" FOREIGN KEY ("abonnes_id") REFERENCES "public"."abonnes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_chiffres" ADD CONSTRAINT "association_chiffres_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_chiffres_locales" ADD CONSTRAINT "association_chiffres_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association_chiffres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_valeurs" ADD CONSTRAINT "association_valeurs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_valeurs_locales" ADD CONSTRAINT "association_valeurs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association_valeurs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_axes_objectifs" ADD CONSTRAINT "association_axes_objectifs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association_axes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_axes_objectifs_locales" ADD CONSTRAINT "association_axes_objectifs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association_axes_objectifs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_axes" ADD CONSTRAINT "association_axes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_axes_locales" ADD CONSTRAINT "association_axes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association_axes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_demarche" ADD CONSTRAINT "association_demarche_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_demarche_locales" ADD CONSTRAINT "association_demarche_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association_demarche"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_regions" ADD CONSTRAINT "association_regions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association_regions_locales" ADD CONSTRAINT "association_regions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association_regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "association" ADD CONSTRAINT "association_image_accueil_id_media_id_fk" FOREIGN KEY ("image_accueil_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "association" ADD CONSTRAINT "association_citation_photo_id_media_id_fk" FOREIGN KEY ("citation_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "association_locales" ADD CONSTRAINT "association_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."association"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coordonnees_telephones" ADD CONSTRAINT "coordonnees_telephones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coordonnees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coordonnees_reseaux" ADD CONSTRAINT "coordonnees_reseaux_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coordonnees"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "realisations_chiffres_order_idx" ON "realisations_chiffres" USING btree ("_order");
  CREATE INDEX "realisations_chiffres_parent_id_idx" ON "realisations_chiffres" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "realisations_chiffres_locales_locale_parent_id_unique" ON "realisations_chiffres_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "realisations_chiffres_locales_parent_id_idx" ON "realisations_chiffres_locales" USING btree ("_parent_id");
  CREATE INDEX "realisations_image_idx" ON "realisations" USING btree ("image_id");
  CREATE UNIQUE INDEX "realisations_slug_idx" ON "realisations" USING btree ("slug");
  CREATE INDEX "realisations_updated_at_idx" ON "realisations" USING btree ("updated_at");
  CREATE INDEX "realisations_created_at_idx" ON "realisations" USING btree ("created_at");
  CREATE INDEX "realisations__status_idx" ON "realisations" USING btree ("_status");
  CREATE UNIQUE INDEX "realisations_locales_locale_parent_id_unique" ON "realisations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "realisations_locales_parent_id_idx" ON "realisations_locales" USING btree ("_parent_id");
  CREATE INDEX "realisations_rels_order_idx" ON "realisations_rels" USING btree ("order");
  CREATE INDEX "realisations_rels_parent_idx" ON "realisations_rels" USING btree ("parent_id");
  CREATE INDEX "realisations_rels_path_idx" ON "realisations_rels" USING btree ("path");
  CREATE INDEX "realisations_rels_media_id_idx" ON "realisations_rels" USING btree ("media_id");
  CREATE INDEX "realisations_rels_partenaires_id_idx" ON "realisations_rels" USING btree ("partenaires_id");
  CREATE INDEX "_realisations_v_version_chiffres_order_idx" ON "_realisations_v_version_chiffres" USING btree ("_order");
  CREATE INDEX "_realisations_v_version_chiffres_parent_id_idx" ON "_realisations_v_version_chiffres" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_realisations_v_version_chiffres_locales_locale_parent_id_un" ON "_realisations_v_version_chiffres_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_realisations_v_version_chiffres_locales_parent_id_idx" ON "_realisations_v_version_chiffres_locales" USING btree ("_parent_id");
  CREATE INDEX "_realisations_v_parent_idx" ON "_realisations_v" USING btree ("parent_id");
  CREATE INDEX "_realisations_v_version_version_image_idx" ON "_realisations_v" USING btree ("version_image_id");
  CREATE INDEX "_realisations_v_version_version_slug_idx" ON "_realisations_v" USING btree ("version_slug");
  CREATE INDEX "_realisations_v_version_version_updated_at_idx" ON "_realisations_v" USING btree ("version_updated_at");
  CREATE INDEX "_realisations_v_version_version_created_at_idx" ON "_realisations_v" USING btree ("version_created_at");
  CREATE INDEX "_realisations_v_version_version__status_idx" ON "_realisations_v" USING btree ("version__status");
  CREATE INDEX "_realisations_v_created_at_idx" ON "_realisations_v" USING btree ("created_at");
  CREATE INDEX "_realisations_v_updated_at_idx" ON "_realisations_v" USING btree ("updated_at");
  CREATE INDEX "_realisations_v_snapshot_idx" ON "_realisations_v" USING btree ("snapshot");
  CREATE INDEX "_realisations_v_published_locale_idx" ON "_realisations_v" USING btree ("published_locale");
  CREATE INDEX "_realisations_v_latest_idx" ON "_realisations_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_realisations_v_locales_locale_parent_id_unique" ON "_realisations_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_realisations_v_locales_parent_id_idx" ON "_realisations_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_realisations_v_rels_order_idx" ON "_realisations_v_rels" USING btree ("order");
  CREATE INDEX "_realisations_v_rels_parent_idx" ON "_realisations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_realisations_v_rels_path_idx" ON "_realisations_v_rels" USING btree ("path");
  CREATE INDEX "_realisations_v_rels_media_id_idx" ON "_realisations_v_rels" USING btree ("media_id");
  CREATE INDEX "_realisations_v_rels_partenaires_id_idx" ON "_realisations_v_rels" USING btree ("partenaires_id");
  CREATE INDEX "actualites_image_idx" ON "actualites" USING btree ("image_id");
  CREATE UNIQUE INDEX "actualites_slug_idx" ON "actualites" USING btree ("slug");
  CREATE INDEX "actualites_updated_at_idx" ON "actualites" USING btree ("updated_at");
  CREATE INDEX "actualites_created_at_idx" ON "actualites" USING btree ("created_at");
  CREATE INDEX "actualites__status_idx" ON "actualites" USING btree ("_status");
  CREATE UNIQUE INDEX "actualites_locales_locale_parent_id_unique" ON "actualites_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "actualites_locales_parent_id_idx" ON "actualites_locales" USING btree ("_parent_id");
  CREATE INDEX "_actualites_v_parent_idx" ON "_actualites_v" USING btree ("parent_id");
  CREATE INDEX "_actualites_v_version_version_image_idx" ON "_actualites_v" USING btree ("version_image_id");
  CREATE INDEX "_actualites_v_version_version_slug_idx" ON "_actualites_v" USING btree ("version_slug");
  CREATE INDEX "_actualites_v_version_version_updated_at_idx" ON "_actualites_v" USING btree ("version_updated_at");
  CREATE INDEX "_actualites_v_version_version_created_at_idx" ON "_actualites_v" USING btree ("version_created_at");
  CREATE INDEX "_actualites_v_version_version__status_idx" ON "_actualites_v" USING btree ("version__status");
  CREATE INDEX "_actualites_v_created_at_idx" ON "_actualites_v" USING btree ("created_at");
  CREATE INDEX "_actualites_v_updated_at_idx" ON "_actualites_v" USING btree ("updated_at");
  CREATE INDEX "_actualites_v_snapshot_idx" ON "_actualites_v" USING btree ("snapshot");
  CREATE INDEX "_actualites_v_published_locale_idx" ON "_actualites_v" USING btree ("published_locale");
  CREATE INDEX "_actualites_v_latest_idx" ON "_actualites_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_actualites_v_locales_locale_parent_id_unique" ON "_actualites_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_actualites_v_locales_parent_id_idx" ON "_actualites_v_locales" USING btree ("_parent_id");
  CREATE INDEX "partenaires_logo_idx" ON "partenaires" USING btree ("logo_id");
  CREATE INDEX "partenaires_updated_at_idx" ON "partenaires" USING btree ("updated_at");
  CREATE INDEX "partenaires_created_at_idx" ON "partenaires" USING btree ("created_at");
  CREATE UNIQUE INDEX "partenaires_locales_locale_parent_id_unique" ON "partenaires_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "partenaires_locales_parent_id_idx" ON "partenaires_locales" USING btree ("_parent_id");
  CREATE INDEX "equipe_departement_idx" ON "equipe" USING btree ("departement_id");
  CREATE INDEX "equipe_photo_idx" ON "equipe" USING btree ("photo_id");
  CREATE INDEX "equipe_updated_at_idx" ON "equipe" USING btree ("updated_at");
  CREATE INDEX "equipe_created_at_idx" ON "equipe" USING btree ("created_at");
  CREATE UNIQUE INDEX "equipe_locales_locale_parent_id_unique" ON "equipe_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "equipe_locales_parent_id_idx" ON "equipe_locales" USING btree ("_parent_id");
  CREATE INDEX "departements_missions_order_idx" ON "departements_missions" USING btree ("_order");
  CREATE INDEX "departements_missions_parent_id_idx" ON "departements_missions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "departements_missions_locales_locale_parent_id_unique" ON "departements_missions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departements_missions_locales_parent_id_idx" ON "departements_missions_locales" USING btree ("_parent_id");
  CREATE INDEX "departements_updated_at_idx" ON "departements" USING btree ("updated_at");
  CREATE INDEX "departements_created_at_idx" ON "departements" USING btree ("created_at");
  CREATE UNIQUE INDEX "departements_locales_locale_parent_id_unique" ON "departements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departements_locales_parent_id_idx" ON "departements_locales" USING btree ("_parent_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE UNIQUE INDEX "documents_locales_locale_parent_id_unique" ON "documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "documents_locales_parent_id_idx" ON "documents_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_vignette_sizes_vignette_filename_idx" ON "media" USING btree ("sizes_vignette_filename");
  CREATE INDEX "media_sizes_carte_sizes_carte_filename_idx" ON "media" USING btree ("sizes_carte_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "messages_empreinte_idx" ON "messages" USING btree ("empreinte");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "abonnes_email_idx" ON "abonnes" USING btree ("email");
  CREATE INDEX "abonnes_empreinte_idx" ON "abonnes" USING btree ("empreinte");
  CREATE INDEX "abonnes_updated_at_idx" ON "abonnes" USING btree ("updated_at");
  CREATE INDEX "abonnes_created_at_idx" ON "abonnes" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_realisations_id_idx" ON "payload_locked_documents_rels" USING btree ("realisations_id");
  CREATE INDEX "payload_locked_documents_rels_actualites_id_idx" ON "payload_locked_documents_rels" USING btree ("actualites_id");
  CREATE INDEX "payload_locked_documents_rels_partenaires_id_idx" ON "payload_locked_documents_rels" USING btree ("partenaires_id");
  CREATE INDEX "payload_locked_documents_rels_equipe_id_idx" ON "payload_locked_documents_rels" USING btree ("equipe_id");
  CREATE INDEX "payload_locked_documents_rels_departements_id_idx" ON "payload_locked_documents_rels" USING btree ("departements_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_locked_documents_rels_abonnes_id_idx" ON "payload_locked_documents_rels" USING btree ("abonnes_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "association_chiffres_order_idx" ON "association_chiffres" USING btree ("_order");
  CREATE INDEX "association_chiffres_parent_id_idx" ON "association_chiffres" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "association_chiffres_locales_locale_parent_id_unique" ON "association_chiffres_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "association_chiffres_locales_parent_id_idx" ON "association_chiffres_locales" USING btree ("_parent_id");
  CREATE INDEX "association_valeurs_order_idx" ON "association_valeurs" USING btree ("_order");
  CREATE INDEX "association_valeurs_parent_id_idx" ON "association_valeurs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "association_valeurs_locales_locale_parent_id_unique" ON "association_valeurs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "association_valeurs_locales_parent_id_idx" ON "association_valeurs_locales" USING btree ("_parent_id");
  CREATE INDEX "association_axes_objectifs_order_idx" ON "association_axes_objectifs" USING btree ("_order");
  CREATE INDEX "association_axes_objectifs_parent_id_idx" ON "association_axes_objectifs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "association_axes_objectifs_locales_locale_parent_id_unique" ON "association_axes_objectifs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "association_axes_objectifs_locales_parent_id_idx" ON "association_axes_objectifs_locales" USING btree ("_parent_id");
  CREATE INDEX "association_axes_order_idx" ON "association_axes" USING btree ("_order");
  CREATE INDEX "association_axes_parent_id_idx" ON "association_axes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "association_axes_locales_locale_parent_id_unique" ON "association_axes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "association_axes_locales_parent_id_idx" ON "association_axes_locales" USING btree ("_parent_id");
  CREATE INDEX "association_demarche_order_idx" ON "association_demarche" USING btree ("_order");
  CREATE INDEX "association_demarche_parent_id_idx" ON "association_demarche" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "association_demarche_locales_locale_parent_id_unique" ON "association_demarche_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "association_demarche_locales_parent_id_idx" ON "association_demarche_locales" USING btree ("_parent_id");
  CREATE INDEX "association_regions_order_idx" ON "association_regions" USING btree ("_order");
  CREATE INDEX "association_regions_parent_id_idx" ON "association_regions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "association_regions_locales_locale_parent_id_unique" ON "association_regions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "association_regions_locales_parent_id_idx" ON "association_regions_locales" USING btree ("_parent_id");
  CREATE INDEX "association_image_accueil_idx" ON "association" USING btree ("image_accueil_id");
  CREATE INDEX "association_citation_photo_idx" ON "association" USING btree ("citation_photo_id");
  CREATE UNIQUE INDEX "association_locales_locale_parent_id_unique" ON "association_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "association_locales_parent_id_idx" ON "association_locales" USING btree ("_parent_id");
  CREATE INDEX "coordonnees_telephones_order_idx" ON "coordonnees_telephones" USING btree ("_order");
  CREATE INDEX "coordonnees_telephones_parent_id_idx" ON "coordonnees_telephones" USING btree ("_parent_id");
  CREATE INDEX "coordonnees_reseaux_order_idx" ON "coordonnees_reseaux" USING btree ("_order");
  CREATE INDEX "coordonnees_reseaux_parent_id_idx" ON "coordonnees_reseaux" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "realisations_chiffres" CASCADE;
  DROP TABLE "realisations_chiffres_locales" CASCADE;
  DROP TABLE "realisations" CASCADE;
  DROP TABLE "realisations_locales" CASCADE;
  DROP TABLE "realisations_rels" CASCADE;
  DROP TABLE "_realisations_v_version_chiffres" CASCADE;
  DROP TABLE "_realisations_v_version_chiffres_locales" CASCADE;
  DROP TABLE "_realisations_v" CASCADE;
  DROP TABLE "_realisations_v_locales" CASCADE;
  DROP TABLE "_realisations_v_rels" CASCADE;
  DROP TABLE "actualites" CASCADE;
  DROP TABLE "actualites_locales" CASCADE;
  DROP TABLE "_actualites_v" CASCADE;
  DROP TABLE "_actualites_v_locales" CASCADE;
  DROP TABLE "partenaires" CASCADE;
  DROP TABLE "partenaires_locales" CASCADE;
  DROP TABLE "equipe" CASCADE;
  DROP TABLE "equipe_locales" CASCADE;
  DROP TABLE "departements_missions" CASCADE;
  DROP TABLE "departements_missions_locales" CASCADE;
  DROP TABLE "departements" CASCADE;
  DROP TABLE "departements_locales" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "abonnes" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "association_chiffres" CASCADE;
  DROP TABLE "association_chiffres_locales" CASCADE;
  DROP TABLE "association_valeurs" CASCADE;
  DROP TABLE "association_valeurs_locales" CASCADE;
  DROP TABLE "association_axes_objectifs" CASCADE;
  DROP TABLE "association_axes_objectifs_locales" CASCADE;
  DROP TABLE "association_axes" CASCADE;
  DROP TABLE "association_axes_locales" CASCADE;
  DROP TABLE "association_demarche" CASCADE;
  DROP TABLE "association_demarche_locales" CASCADE;
  DROP TABLE "association_regions" CASCADE;
  DROP TABLE "association_regions_locales" CASCADE;
  DROP TABLE "association" CASCADE;
  DROP TABLE "association_locales" CASCADE;
  DROP TABLE "coordonnees_telephones" CASCADE;
  DROP TABLE "coordonnees_reseaux" CASCADE;
  DROP TABLE "coordonnees" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_realisations_axe";
  DROP TYPE "public"."enum_realisations_statut";
  DROP TYPE "public"."enum_realisations_status";
  DROP TYPE "public"."enum__realisations_v_version_axe";
  DROP TYPE "public"."enum__realisations_v_version_statut";
  DROP TYPE "public"."enum__realisations_v_version_status";
  DROP TYPE "public"."enum__realisations_v_published_locale";
  DROP TYPE "public"."enum_actualites_categorie";
  DROP TYPE "public"."enum_actualites_status";
  DROP TYPE "public"."enum__actualites_v_version_categorie";
  DROP TYPE "public"."enum__actualites_v_version_status";
  DROP TYPE "public"."enum__actualites_v_published_locale";
  DROP TYPE "public"."enum_partenaires_type";
  DROP TYPE "public"."enum_documents_categorie";
  DROP TYPE "public"."enum_messages_langue";
  DROP TYPE "public"."enum_messages_objet";
  DROP TYPE "public"."enum_abonnes_langue";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_coordonnees_reseaux_reseau";`)
}
