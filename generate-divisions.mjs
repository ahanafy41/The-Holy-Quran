import { getRubAlHizbMeta, meta } from 'quran-meta';

const rubStartPoints = [];

for (let i = 1; i <= meta.numRubAlHizbs; i++) {
  const rubMeta = getRubAlHizbMeta(i);
  // Corrected to use the 'first' property which is an array [surah, ayah]
  rubStartPoints.push({ surah: rubMeta.first[0], ayah: rubMeta.first[1] });
}

// Final formatting for direct use in the .ts file
const output = `[
${rubStartPoints.map(p => `    { surah: ${p.surah}, ayah: ${p.ayah} }`).join(',\n')}
]`;

console.log(output);
