import * as migration_20261020_063134_initial from './20261020_063134_initial';
import * as migration_20261022_074418_photos_du_site from './20261022_074418_photos_du_site';
import * as migration_20261022_083130_decouvrir_kolda from './20261022_083130_decouvrir_kolda';
import * as migration_20261023_061446_stockage_vercel_blob from './20261023_061446_stockage_vercel_blob';
import * as migration_20261023_164152_opportunites_formations from './20261023_164152_opportunites_formations';
import * as migration_20261029_055059_formations_sessions_inscriptions from './20261029_055059_formations_sessions_inscriptions';
import * as migration_20261108_123929_communes from './20261108_123929_communes';
import * as migration_20261111_153811_espace_pro from './20261111_153811_espace_pro';
import * as migration_20261111_184812_notifications from './20261111_184812_notifications';
import * as migration_20261111_231542_taches_reunions from './20261111_231542_taches_reunions';
import * as migration_20261112_063805_rapports from './20261112_063805_rapports';
import * as migration_20261112_064646_visio from './20261112_064646_visio';

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
    name: '20261023_061446_stockage_vercel_blob',
  },
  {
    up: migration_20261023_164152_opportunites_formations.up,
    down: migration_20261023_164152_opportunites_formations.down,
    name: '20261023_164152_opportunites_formations',
  },
  {
    up: migration_20261029_055059_formations_sessions_inscriptions.up,
    down: migration_20261029_055059_formations_sessions_inscriptions.down,
    name: '20261029_055059_formations_sessions_inscriptions',
  },
  {
    up: migration_20261108_123929_communes.up,
    down: migration_20261108_123929_communes.down,
    name: '20261108_123929_communes',
  },
  {
    up: migration_20261111_153811_espace_pro.up,
    down: migration_20261111_153811_espace_pro.down,
    name: '20261111_153811_espace_pro',
  },
  {
    up: migration_20261111_184812_notifications.up,
    down: migration_20261111_184812_notifications.down,
    name: '20261111_184812_notifications',
  },
  {
    up: migration_20261111_231542_taches_reunions.up,
    down: migration_20261111_231542_taches_reunions.down,
    name: '20261111_231542_taches_reunions',
  },
  {
    up: migration_20261112_063805_rapports.up,
    down: migration_20261112_063805_rapports.down,
    name: '20261112_063805_rapports',
  },
  {
    up: migration_20261112_064646_visio.up,
    down: migration_20261112_064646_visio.down,
    name: '20261112_064646_visio'
  },
];
