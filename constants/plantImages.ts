/**
 * Mapping aset foto tanaman dari assets/images/tanaman/
 */

export const PLANT_IMAGES: Record<string, any> = {
  'bawang-merah': require('../assets/images/tanaman/bawang-merah.svg'),
  'bawang-putih': require('../assets/images/tanaman/bawang-putih.svg'),
  'bayam': require('../assets/images/tanaman/bayam.svg'),
  'cabai-merah': require('../assets/images/tanaman/cabai-merah.svg'),
  'cabai-rawit': require('../assets/images/tanaman/cabai-rawit.svg'),
  'daun-bawang': require('../assets/images/tanaman/daun-bawang.svg'),
  'jahe': require('../assets/images/tanaman/jahe.svg'),
  'kale': require('../assets/images/tanaman/kale.svg'),
  'kangkung': require('../assets/images/tanaman/kangkung.svg'),
  'kemangi': require('../assets/images/tanaman/kemangi.svg'),
  'kubis': require('../assets/images/tanaman/kubis.svg'),
  'kunyit': require('../assets/images/tanaman/kunyit.svg'),
  'melon': require('../assets/images/tanaman/melon.svg'),
  'pakcoy': require('../assets/images/tanaman/pakcoy.svg'),
  'sawi': require('../assets/images/tanaman/sawi.svg'),
  'seledri': require('../assets/images/tanaman/seledri.svg'),
  'stroberi': require('../assets/images/tanaman/stroberi.svg'),
  'terong': require('../assets/images/tanaman/terong.svg'),
  'timun': require('../assets/images/tanaman/timun.svg'),
  'tomat': require('../assets/images/tanaman/tomat.svg'),
};

/**
 * Mendapatkan aset foto tanaman berdasarkan nama atau jenis tanaman.
 * Memiliki fuzzy matching sehingga mendukung variasi penulisan.
 */
export function getPlantImage(jenisTanaman?: string | null): any {
  if (!jenisTanaman) {
    return PLANT_IMAGES['tomat'];
  }

  const raw = jenisTanaman.trim().toLowerCase().replace(/_/g, ' ');

  // 1. Exact slug match
  const slug = raw.replace(/\s+/g, '-');
  if (PLANT_IMAGES[slug]) {
    return PLANT_IMAGES[slug];
  }
  if (PLANT_IMAGES[raw]) {
    return PLANT_IMAGES[raw];
  }

  // 2. Keyword matching
  if (raw.includes('rawit')) {
    return PLANT_IMAGES['cabai-rawit'];
  }
  if (raw.includes('cabai merah') || raw.includes('cabe merah')) {
    return PLANT_IMAGES['cabai-merah'];
  }
  if (raw.includes('cabai') || raw.includes('cabe') || raw.includes('chili') || raw.includes('chilli')) {
    return PLANT_IMAGES['cabai-merah'];
  }
  if (raw.includes('daun bawang') || raw.includes('daun-bawang') || raw.includes('leek') || raw.includes('scallion')) {
    return PLANT_IMAGES['daun-bawang'];
  }
  if (raw.includes('putih') && raw.includes('bawang')) {
    return PLANT_IMAGES['bawang-putih'];
  }
  if (raw.includes('bawang') || raw.includes('shallot') || raw.includes('onion')) {
    return PLANT_IMAGES['bawang-merah'];
  }
  if (raw.includes('pakcoy') || raw.includes('pak choy') || raw.includes('bok choy') || raw.includes('pakchoi')) {
    return PLANT_IMAGES['pakcoy'];
  }
  if (raw.includes('sawi') || raw.includes('mustard')) {
    return PLANT_IMAGES['sawi'];
  }
  if (raw.includes('kubis') || raw.includes('kol') || raw.includes('cabbage') || raw.includes('selada') || raw.includes('lettuce')) {
    return PLANT_IMAGES['kubis'];
  }
  if (raw.includes('kangkung') || raw.includes('water spinach')) {
    return PLANT_IMAGES['kangkung'];
  }
  if (raw.includes('bayam') || raw.includes('spinach')) {
    return PLANT_IMAGES['bayam'];
  }
  if (raw.includes('terong') || raw.includes('eggplant') || raw.includes('aubergine')) {
    return PLANT_IMAGES['terong'];
  }
  if (raw.includes('timun') || raw.includes('mentimun') || raw.includes('cucumber')) {
    return PLANT_IMAGES['timun'];
  }
  if (raw.includes('seledri') || raw.includes('celery')) {
    return PLANT_IMAGES['seledri'];
  }
  if (raw.includes('kemangi') || raw.includes('basil')) {
    return PLANT_IMAGES['kemangi'];
  }
  if (raw.includes('jahe') || raw.includes('ginger')) {
    return PLANT_IMAGES['jahe'];
  }
  if (raw.includes('kunyit') || raw.includes('turmeric')) {
    return PLANT_IMAGES['kunyit'];
  }
  if (raw.includes('melon')) {
    return PLANT_IMAGES['melon'];
  }
  if (raw.includes('stroberi') || raw.includes('strawberry')) {
    return PLANT_IMAGES['stroberi'];
  }
  if (raw.includes('tomat') || raw.includes('tomato')) {
    return PLANT_IMAGES['tomat'];
  }
  if (raw.includes('kale')) {
    return PLANT_IMAGES['kale'];
  }

  // 3. Fallback default
  return PLANT_IMAGES['tomat'];
}
