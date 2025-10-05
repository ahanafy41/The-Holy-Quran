import fs from 'fs/promises';
import path from 'path';

// This script fetches the complete Tafsir Al-Muyassar from an external API
// and saves it as a local JSON file for offline use. This significantly
// improves performance and enables offline access to tafsir.

const TAFSIR_EDITION = 'ar.muyassar';
const TOTAL_SURAHS = 114;
const OUTPUT_DIR = 'data';
const OUTPUT_FILE = 'tafsir_muyassar.json';

// Simple fetch with retry for robustness
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}. Retrying in ${delay}ms...`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

async function fetchSurahTafsir(surahNumber) {
  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/${TAFSIR_EDITION}`;
  console.log(`Fetching tafsir for Surah ${surahNumber}...`);
  const data = await fetchWithRetry(url);
  if (data.status !== 'OK') {
    throw new Error(`API returned an error for Surah ${surahNumber}: ${data.data}`);
  }
  return data.data.ayahs;
}

async function main() {
  console.log('Starting Tafsir download process...');
  const allTafsirs = {};

  try {
    for (let i = 1; i <= TOTAL_SURAHS; i++) {
      const ayahs = await fetchSurahTafsir(i);
      const surahTafsirs = {};
      for (const ayah of ayahs) {
        // We only need the tafsir text, keyed by ayah number in the surah.
        surahTafsirs[ayah.numberInSurah] = ayah.text;
      }
      allTafsirs[i] = surahTafsirs;
      console.log(`Successfully processed Surah ${i}`);
    }

    const outputPath = path.join(process.cwd(), OUTPUT_DIR, OUTPUT_FILE);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(allTafsirs, null, 2));

    console.log(`\n✅ Successfully downloaded all tafsirs!`);
    console.log(`Data saved to: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ An error occurred during the download process:', error);
    process.exit(1);
  }
}

main();