import fs from 'fs/promises';
import path from 'path';
import https from 'https';

// --- Helper Functions ---

function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchData(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Request Failed. Status Code: ${res.statusCode} at ${url}`));
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

function parseMeaningsFromHtml(html) {
    const meanings = [];
    const tableRegex = /<table class="table"([\s\S]*?)<\/table>/;
    const tableMatch = html.match(tableRegex);

    if (!tableMatch) return meanings;

    const tableHtml = tableMatch[1];
    const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
    let rowMatch;
    rowRegex.exec(tableHtml); // Skip header

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
        const cells = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
            const cleanContent = cellMatch[1].replace(/<[^>]+>/g, '').trim();
            cells.push(cleanContent);
        }

        if (cells.length === 3) {
            // The verse number is part of the meaning string in the source HTML, e.g., "... الآية 15"
            // We'll just use the word and meaning for our map.
            const word = cells[1];
            const meaning = cells[0]; // The columns are swapped on this site
            const verseRef = cells[2];

            if (word && meaning) {
                 // A simple regex to find the verse number in the reference link
                const verseMatch = verseRef.match(/aya-(\d+)-/);
                if(verseMatch && verseMatch[1]) {
                    meanings.push({ verse: verseMatch[1], word, meaning });
                }
            }
        }
    }
    return meanings;
}


// --- Main Logic ---

async function generateCompleteData() {
    console.log('Starting final data generation process...');

    // 1. Scrape Arabic Meanings
    const meaningsMap = new Map();
    console.log('--- Scraping Arabic Meanings ---');
    for (let i = 1; i <= 114; i++) {
        const url = `https://surahquran.com/kalimat.php?sura=${i}`;
        console.log(`Fetching meanings for Surah ${i}...`);
        try {
            const html = await fetchData(url);
            const scrapedMeanings = parseMeaningsFromHtml(html);

            const verseMap = new Map();
            for (const item of scrapedMeanings) {
                // The scraped 'word' can sometimes be a phrase.
                // The 'meaning' is actually the word, and 'word' is the meaning. Let's swap them.
                const key = item.meaning; // The actual Arabic word/phrase
                const value = item.word;  // The meaning
                if (!verseMap.has(item.verse)) {
                    verseMap.set(item.verse, new Map());
                }
                verseMap.get(item.verse).set(key, value);
            }
            meaningsMap.set(String(i), verseMap);
            console.log(`Successfully parsed ${scrapedMeanings.length} meanings for Surah ${i}.`);
        } catch (error) {
            console.error(`Failed to scrape Surah ${i}:`, error.message);
        }
        await new Promise(res => setTimeout(res, 200)); // Be respectful to the server
    }

    // 2. Fetch complete word list from API and merge
    const finalQuranData = {};
    console.log('\n--- Fetching word data from quran.com API and merging ---');
    for (let i = 1; i <= 114; i++) {
        console.log(`Fetching API data for Surah ${i}...`);
        try {
            const apiUrl = `https://api.quran.com/api/v4/verses/by_chapter/${i}?words=true&per_page=300&fields=text_uthmani`;
            const apiData = await fetchData(apiUrl).then(JSON.parse);

            const surahMeanings = meaningsMap.get(String(i)) || new Map();

            const processedVerses = apiData.verses.map(verse => {
                const verseMeanings = surahMeanings.get(String(verse.verse_number)) || new Map();

                const newWords = verse.words.map(word => {
                    const meaning = verseMeanings.get(word.text_uthmani) || '';
                    return {
                        id: word.id,
                        position: word.position,
                        text_uthmani: word.text_uthmani,
                        meaning: meaning,
                        char_type_name: word.char_type_name,
                    };
                });

                // Attempt to match phrases from the original data
                if(verseMeanings.size > 0) {
                    for(const [phrase, meaning] of verseMeanings.entries()) {
                        if(phrase.includes(' ')) { // It's a phrase
                            const verseText = newWords.map(w => w.text_uthmani).join(' ');
                            if(verseText.includes(phrase)){
                                // This is a simple approach: assign the meaning to the first word of the phrase
                                const firstWord = phrase.split(' ')[0];
                                const wordToUpdate = newWords.find(w => w.text_uthmani === firstWord);
                                if(wordToUpdate && !wordToUpdate.meaning) {
                                    wordToUpdate.meaning = meaning;
                                }
                            }
                        }
                    }
                }

                return {
                    verse_number: verse.verse_number,
                    verse_key: verse.verse_key,
                    words: newWords,
                };
            });

            finalQuranData[i] = processedVerses;
            console.log(`Successfully merged data for Surah ${i}.`);
        } catch (error) {
            console.error(`Failed to process API data for Surah ${i}:`, error);
        }
        await new Promise(res => setTimeout(res, 200));
    }

    // 3. Write the final, single, complete JSON file
    const outputPath = path.join(process.cwd(), 'data', 'quran_data_complete.json');
    await fs.writeFile(outputPath, JSON.stringify(finalQuranData, null, 2));
    console.log(`\nFinal data generation complete! New data file created at: ${outputPath}`);
}

generateCompleteData().catch(console.error);
