import { describe, it, expect } from 'vitest';
import { juzs } from './quranicDivisions';
import { getJuzMeta, meta } from 'quran-meta';

describe('Quranic Division Data', () => {
  it('should have the correct start and end for all 30 Juz', () => {
    expect(juzs.length).toBe(30);

    for (let i = 1; i <= meta.numJuzs; i++) {
      const appJuz = juzs[i - 1];
      const truthJuz = getJuzMeta(i);

      const truthStart = { surah: truthJuz.first[0], ayah: truthJuz.first[1] };
      const truthEnd = { surah: truthJuz.last[0], ayah: truthJuz.last[1] };

      // Check if the start of the Juz matches the source of truth
      expect(appJuz.start).toEqual(truthStart);

      // Check if the end of the Juz matches the source of truth
      expect(appJuz.end).toEqual(truthEnd);
    }
  });
});
