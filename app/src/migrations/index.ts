import * as migration_20261020_063134_initial from './20261020_063134_initial';
import * as migration_20261022_074418_photos_du_site from './20261022_074418_photos_du_site';
import * as migration_20261022_083130_decouvrir_kolda from './20261022_083130_decouvrir_kolda';

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
    name: '20261022_083130_decouvrir_kolda'
  },
];
