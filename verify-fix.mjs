import { juzs } from './data/quranicDivisions.ts';
import { getJuzMeta, meta } from 'quran-meta';

let allMatch = true;

console.log('--- Verifying Juz Division Data ---');

for (let i = 1; i <= meta.numJuzs; i++) {
  const appJuz = juzs[i - 1];
  const truthJuz = getJuzMeta(i);

  const appStart = appJuz.start;
  const truthStart = { surah: truthJuz.first[0], ayah: truthJuz.first[1] };

  const appEnd = appJuz.end;
  const truthEnd = { surah: truthJuz.last[0], ayah: truthJuz.last[1] };

  const startMatch = appStart.surah === truthStart.surah && appStart.ayah === truthStart.ayah;
  const endMatch = appEnd.surah === truthEnd.surah && appEnd.ayah === truthEnd.ayah;

  if (!startMatch || !endMatch) {
    allMatch = false;
    console.error(`\n❌ Mismatch found for Juz ${i}:`);
    if (!startMatch) {
        console.error(`  - START: App data is {${appStart.surah}:${appStart.ayah}}, but should be {${truthStart.surah}:${truthStart.ayah}}`);
    }
    if (!endMatch) {
        console.error(`  - END:   App data is {${appEnd.surah}:${appEnd.ayah}}, but should be {${truthEnd.surah}:${truthEnd.ayah}}`);
    }
  }
}

console.log('\\n-----------------------------------');

if (allMatch) {
  console.log('✅ SUCCESS: All 30 Juz start and end points are correct.');
} else {
  console.log('❗ FAILURE: One or more Juz divisions are incorrect.');
}
