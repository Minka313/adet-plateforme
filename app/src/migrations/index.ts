import * as migration_20261020_063134_initial from './20261020_063134_initial';
import * as migration_20261022_074418_photos_du_site from './20261022_074418_photos_du_site';
import * as migration_20261022_083130_decouvrir_kolda from './20261022_083130_decouvrir_kolda';
import * as migration_20261023_061446_stockage_vercel_blob from './20261023_061446_stockage_vercel_blob';

export const migrations = [
  {
    up: migration_20261020_063134_initial.up,
    down: migration_20261020_063134_initial.down,
    name: '20261020_063134_initial',
  },
  {
    up: migration_20261022_074418_photos_du_site.up,
    down: migration_20261022_074418_photos_du_site.down,
    name: '20261022_074418_photos_du_site',
  },
  {
    up: migration_20261022_083130_decouvrir_kolda.up,
    down: migration_20261022_083130_decouvrir_kolda.down,
    name: '20261022_083130_decouvrir_kolda',
  },
  {
    up: migration_20261023_061446_stockage_vercel_blob.up,
    down: migration_20261023_061446_stockage_vercel_blob.down,
    name: '20261023_061446_stockage_vercel_blob'
  },
];
