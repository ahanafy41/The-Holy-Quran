import fs from 'fs/promises';
import path from 'path';

// Source directory for the large JSON files
const sourceDir = 'data';
// Destination directory for the processed data
const outputDir = 'public/hadith-data';

// List of hadith book IDs. This matches the JSON filenames in the data directory.
const hadithBooks = [
  'bukhari',
  'muslim',
  'nasai',
  'abudawud',
  'tirmidhi',
  'ibnmajah',
  'malik',
  'ahmed',
  'darimi',
  'riyad_assalihin',
  'shamail_muhammadiyah',
  'aladab_almufrad',
  'bulugh_almaram',
  'nawawi40',
  'qudsi40',
  'shahwaliullah40',
  'mishkat_almasabih'
];

async function processHadithData() {
  try {
    console.log('Starting Hadith data processing...');
    // Ensure the main output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    for (const bookId of hadithBooks) {
      const inputFile = path.join(sourceDir, `${bookId}.json`);
      const bookOutputDir = path.join(outputDir, bookId);

      console.log(`Processing ${bookId}...`);

      // Ensure the book-specific output directory exists
      await fs.mkdir(bookOutputDir, { recursive: true });

      // Read the large JSON file
      const fileContent = await fs.readFile(inputFile, 'utf-8');
      const bookData = JSON.parse(fileContent);

      // 1. Write the chapters file
      const chapters = bookData.chapters || [];
      const chaptersFile = path.join(bookOutputDir, 'chapters.json');
      await fs.writeFile(chaptersFile, JSON.stringify(chapters, null, 2));
      console.log(`  - Wrote chapters.json for ${bookId}`);

      // 2. Group hadiths by chapterId
      const hadithsByChapter = (bookData.hadiths || []).reduce((acc, hadith) => {
        const chapterId = hadith.chapterId;
        if (!acc[chapterId]) {
          acc[chapterId] = [];
        }
        acc[chapterId].push(hadith);
        return acc;
      }, {});

      // 3. Write a separate JSON file for each chapter's hadiths
      for (const chapterId in hadithsByChapter) {
        const hadiths = hadithsByChapter[chapterId];
        // Use chapter ID for the filename. Replace spaces or invalid chars if necessary (not needed for current data).
        const chapterFile = path.join(bookOutputDir, `${chapterId}.json`);
        await fs.writeFile(chapterFile, JSON.stringify(hadiths, null, 2));
      }
      console.log(`  - Wrote ${Object.keys(hadithsByChapter).length} chapter-specific hadith files for ${bookId}`);
    }

    console.log('Hadith data processing completed successfully!');

  } catch (error) {
    console.error('An error occurred during Hadith data processing:', error);
    process.exit(1); // Exit with an error code
  }
}

processHadithData();
