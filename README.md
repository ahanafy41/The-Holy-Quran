# The Holy Quran - Technical Documentation

This document provides a technical overview of the Holy Quran application, its features, and its codebase. It is intended to be a single source of truth for developers working on this project.

## Project Overview

The Holy Quran application is a web-based tool for reading, studying, and listening to the Holy Quran. It also includes a collection of Hadith books. The application is built using React, Vite, and TypeScript.

## Project Structure

The project is organized into the following directories:

-   `components/`: Contains all the React components used in the application.
-   `context/`: Contains the React context providers for managing the application's state.
-   `data/`: Contains the Quranic division data.
-   `hooks/`: Contains custom React hooks.
-   `services/`: Contains services for fetching data from external APIs.
-   `utils/`: Contains utility functions.

## Features

The application has the following features:

-   [x] **Quran Reader:** A feature-rich Quran reader with translation and tafsir.
-   [x] **Advanced Index:** Browse the Quran by Surah, Juz, Hizb, Rub, or Page.

-   [x] **Hadith Collection:** Access to a collection of Hadith books.

-   [x] **Bookmarks:** Save and manage bookmarks for ayahs.

-   [x] **Search:** Search the Quran and Hadith.

-   [x] **Audio Player:** Listen to Quran recitations.

-   [x] **Memorization Tools:** Tools to help with memorizing the Quran.

-   [x] **AI Assistant:** An AI-powered assistant for answering questions about the Quran.

-   [x] **Tafsir:** View tafsir (commentary) for each ayah.

-   [x] **Settings:** Customize the application's appearance and behavior.

-   [x] **Offline Mode:** Access the Quran and other data while offline.

## Components

The application is built using a modular component architecture. Here are some of the main components:

-   `App.tsx`: The root component of the application.
-   `QuranView.tsx`: The main component for displaying the Quran text.
-   `IndexPage.tsx`: The component for browsing the Quran's divisions.
-   `HadithPage.tsx`: The component for displaying the Hadith collection.
-   `ListenPage.tsx`: The component for the audio player.
-   `MemorizationPage.tsx`: The component for the memorization tools.
-   `SearchModal.tsx`: The component for the search functionality.
-   `SettingsModal.tsx`: The component for the application settings.

## Data Sources

-   **Quranic Divisions:** The data for Juz, Hizb, Rub, and Page divisions is located in the `data/quranicDivisions.ts` file. This data is sourced from `tanzil.net`.
-   **Hadith Collection:** The list of Hadith books and their URLs is in the `index.json` file. The actual Hadith data is fetched from the URLs in this file.

## Feature Details

### Quran Reader

The Quran Reader is the core feature of the application. It is responsible for displaying the Quranic text, translations, and tafsir.

**Implementation Details:**

-   **Virtualization:** The reader uses `@tanstack/react-virtual` to efficiently render the long list of ayahs. This ensures a smooth scrolling experience even with a large number of ayahs.
-   **Component Structure:**
    -   `QuranView.tsx`: This is the main component for the reader. It fetches the Quran data for the selected surah or division and renders the list of ayahs using the virtualizer. It also manages the state of the reader, such as the current ayah, translation, and tafsir.
    -   `AyahItem.tsx`: This component represents a single ayah in the list. It displays the Arabic text, the translation, and the ayah number. It also handles user interactions, such as tapping on an ayah to show the action menu.
    -   `TafsirModal.tsx`: This modal component displays the tafsir for the selected ayah. It fetches the tafsir text and displays it in a clean and readable format.
-   **Data Fetching:** The Quran text and translations are fetched from a JSON file. The tafsir is fetched from an external API.
-   **State Management:** The state of the reader is managed using React's `useState` and `useReducer` hooks. The `AppContext` is used to share the global state, such as the selected translation and tafsir.

### Advanced Index

The Advanced Index allows users to browse the Quran by Surah, Juz, Hizb, Rub, or Page.

**Implementation Details:**

-   **Component Structure:**
    -   `IndexPage.tsx`: This component displays the main index grid, where users can select a division type (Surah, Juz, etc.). It uses `framer-motion` for smooth animations between the index grid and the list view.
    -   `DivisionView.tsx`: This component is responsible for displaying the content of a selected division (e.g., a specific Juz or Hizb). It fetches the ayahs within the selected division and displays them.
-   **Data:** The data for the divisions is sourced from the `data/quranicDivisions.ts` file. This file contains the start and end points for each Juz, Hizb, Rub, and Page.
-   **Navigation:** The `useApp` hook provides the `navigateTo` function, which is used to navigate between the index page and the division view.
-   **Data Fetching:** In `DivisionView.tsx`, the `useEffect` hook is used to fetch the surahs that are part of the selected division. The `api.getSurah` function is called to get the data for each surah.
-   **Filtering:** The `useMemo` hook is used to filter the ayahs that belong to the selected division. This ensures that only the relevant ayahs are displayed.
-   **UI:** The UI is built with Tailwind CSS and includes features like sticky headers for surah names and a "Bismillah" display where appropriate.

### Hadith Collection

The Hadith Collection feature allows users to browse and read from a collection of Hadith books.

**Implementation Details:**

-   **Component Structure:**
    -   `HadithPage.tsx`: This is the main component for the Hadith feature. It manages the state of the feature, such as the selected book and the fetched Hadith data. It conditionally renders either the `BookListView` or the `HadithListView`.
    -   `BookListView`: This component displays the list of available Hadith books. It fetches the list of books from a JSON file on GitHub. It also includes a search bar to filter the books.
    -   `HadithListView`: This component displays the hadiths in a selected book. It uses `@tanstack/react-virtual` to efficiently render the list of hadiths and chapters. It also includes a search bar to search within the hadiths of the selected book.
    -   `ChaptersModal`: This modal component displays the list of chapters in the selected book, allowing for quick navigation.
-   **Data Fetching:**
    -   The list of Hadith books is fetched from `https://raw.githubusercontent.com/ahanafy41/The-Holy-Quran/main/hadith-data/index.json`.
    -   The content of each Hadith book (chapters and hadiths) is fetched from a separate JSON file on the same GitHub repository, based on the selected book's ID.
-   **State Management:** The `useState` hook is used to manage the state of the selected book, the search queries, and the loading/error states.
-   **UI:** The UI is built with Tailwind CSS and uses `framer-motion` for animations between the book list and the hadith list views.

### Bookmarks

The Bookmarks feature allows users to save their favorite ayahs for quick access later.

**Implementation Details:**

-   **Component Structure:**
    -   `BookmarksPage.tsx`: This component displays a list of all the saved bookmarks. It allows users to navigate to a bookmarked ayah or delete a bookmark.
    -   `AddBookmarkModal.tsx`: This modal component allows users to add a new bookmark. It automatically suggests a name for the bookmark based on the surah and ayah number, but the user can customize it.
-   **State Management:** The bookmarks are managed through the `useApp` hook, which provides the following functions:
    -   `bookmarks`: An array of bookmark objects.
    -   `addBookmark`: A function to add a new bookmark.
    -   `removeBookmark`: A function to remove an existing bookmark.
-   **Data Persistence:** The bookmarks are saved to the browser's local storage, so they persist between sessions.
-   **UI:** The UI is built with Tailwind CSS and uses `framer-motion` for the modal animation. The `focus-trap-react` library is used to ensure the modal is accessible.

### Search

The Search feature allows users to search the entire Quran for specific words or phrases.

**Implementation Details:**

-   **Component Structure:**
    -   `SearchModal.tsx`: This is the main component for the search feature. It is a modal that contains a search input and a list of search results.
-   **Debouncing:** The `useDebounce` custom hook is used to delay the search execution until the user has stopped typing for a certain amount of time (300ms). This prevents excessive API calls and improves performance.
-   **Search Service:** The actual search logic is encapsulated in the `searchService`. The `searchService.searchQuran` function is called to perform the search.
-   **State Management:** The `useState` hook is used to manage the search query, the search results, and the loading state.
-   **UI:** The UI is built with Tailwind CSS and uses `framer-motion` for the modal animation. The `useFocusTrap` custom hook is used to keep the focus within the modal for accessibility.
-   **Navigation:** When a user clicks on a search result, the `navigateTo` function from the `useApp` hook is used to navigate to the corresponding ayah in the Quran Reader.

### Audio Player

The Audio Player feature allows users to listen to Quran recitations from various reciters.

**Implementation Details:**

-   **Component Structure:**
    -   `ListenPage.tsx`: This is the main component for the audio player feature. It manages the view state, allowing the user to select a reciter, then a surah, and finally displaying the player. It uses `framer-motion` for smooth transitions between views.
    -   `ReciterListView`: This component displays a list of available reciters. It includes a search bar to filter the reciters.
    -   `SurahListView`: This component displays a list of available surahs for the selected reciter.
    -   `ListenPlayerView.tsx`: This is the actual audio player component. It includes play/pause, seek, and next/previous track controls. It uses the HTML5 `<audio>` element to play the audio.
-   **Data Fetching:** The list of reciters is fetched from the `listeningReciters` array provided by the `useApp` hook. The audio files are streamed from the server URL provided in the reciter object.
-   **State Management:** The `useState` hook is used to manage the current view, the selected reciter, the selected surah, the playing state, and the audio progress.
-   **Global Player Control:** The `ListenPlayerView` component dispatches a `global-player-stop` event when it mounts, which pauses any other audio players in the application. This ensures that only one audio player is active at a time.
-   **UI:** The UI is built with Tailwind CSS and includes a custom-styled range input for the seek bar.

### Memorization Tools

The Memorization Tools feature helps users memorize the Quran by providing a specialized audio player with repetition and delay controls.

**Implementation Details:**

-   **Component Structure:**
    -   `MemorizationPage.tsx`: This component is not present in the provided file list, but it is referenced in the feature list. It is likely responsible for selecting the section of the Quran to memorize.
    -   `MemorizationPlayerView.tsx`: This is the main component for the memorization player. It takes a playlist of ayahs and provides a specialized UI for memorization.
-   **Audio Visualization:** The player uses the `wavesurfer.js` library to display a waveform of the audio, which provides visual feedback to the user.
-   **Repetition and Delay:** The user can configure the number of times each ayah is repeated and the delay between repetitions. This is managed using the `useState` hook.
-   **Playback Control:** The `useEffect` hook is used to manage the playback logic. When an ayah finishes playing, a `finish` event is triggered. The event handler then checks the repetition count and either repeats the ayah or moves to the next one after the specified delay.
-   **Error Handling:** The player includes error handling for audio loading. If an audio source fails to load, it tries the next available source from the `audioSecondarys` array.
-   **State Management:** The `useState` hook is used to manage the player's state, such as the current ayah, the repetition count, and the settings. The `useRef` hook is used to keep track of the `WaveSurfer` instance and other mutable values without triggering re-renders.
-   **UI:** The UI is built with Tailwind CSS and includes custom select inputs for configuring the repetition, delay, and playback speed.

### AI Assistant

The AI Assistant feature provides users with an AI-powered chat interface to ask questions and get explanations about a specific ayah.

**Implementation Details:**

-   **Component Structure:**
    -   `AIAssistantModal.tsx`: This is the main component for the AI assistant. It is a modal that displays a chat interface with messages and a text input for the user to ask questions.
-   **AI Service:** The feature uses the `@google/genai` library to interact with the Google Gemini API. The `gemini-2.5-flash` model is used for generating the responses.
-   **System Instruction:** A system instruction is provided to the AI model to set the context and tone of the conversation. The instruction tells the AI to be a helpful and respectful assistant for studying the Quran, to base its answers on established Islamic scholarship, and to respond in Arabic.
-   **Chat History:** The chat history is managed using the `useState` hook. The messages are displayed in a scrollable view, and the view automatically scrolls to the latest message.
-   **Streaming Responses:** The `sendMessageStream` method is used to get a streaming response from the AI model. This allows the response to be displayed to the user as it is being generated, which improves the user experience.
-   **UI:** The UI is built with Tailwind CSS and uses `framer-motion` for animations. It includes a loading indicator while the AI is responding and displays suggestion prompts to guide the user.
-   **API Key:** The feature requires a Google AI API key, which is provided through the `useApp` hook. If the API key is not available, the feature is disabled and an error message is displayed.

### Settings

The Settings feature allows users to customize the application's behavior and appearance.

**Implementation Details:**

-   **Component Structure:**
    -   `SettingsModal.tsx`: This is the main component for the settings feature. It is a modal that contains various settings options.
    -   `SettingSelect`: A reusable component for creating select inputs for settings.
    -   `OfflineManager`: A component for managing the offline data.
    -   `ManualInstallInstructions`: A component that provides instructions on how to manually install the application.
-   **Settings Options:**
    -   **App Installation:** Users can install the application as a Progressive Web App (PWA) for a better user experience. The `isStandalone`, `canInstall`, and `triggerInstall` properties from the `useApp` hook are used to manage the installation flow.
    -   **Reciter Selection:** Users can select their preferred reciter for the memorization and audio player features.
    -   **Tafsir Selection:** Users can select their preferred tafsir.
    -   **Offline Management:** The `OfflineManager` component allows users to download and manage offline data.
    -   **AI Assistant API Key:** Users can enter their Google AI API key to enable the AI Assistant feature. The key is saved locally in the browser's local storage.
-   **State Management:** The `settings` object and the `updateSettings` function from the `useApp` hook are used to manage the application's settings. The `useState` hook is used to manage the local state of the API key input.
-   **UI:** The UI is built with Tailwind CSS and uses `framer-motion` for the modal animation. The `useFocusTrap` custom hook is used to keep the focus within the modal for accessibility.

### Offline Mode

The Offline Mode feature allows users to download Quran data and audio recitations for offline access.

**Implementation Details:**

-   **Component Structure:**
    -   `OfflineManager.tsx`: This component provides the UI for managing offline data. It allows users to download or delete the Quran text data and the audio files for each reciter. It also displays the download progress.
-   **Service Worker:** The `sw.js` file contains the service worker logic. It uses the `workbox-precaching` library to precache the application shell and other static assets.
-   **Caching Strategy:**
    -   **Quran Data:** The Quran text data is cached in a dedicated cache named `quran-app-data-v1`.
    -   **Audio Files:** The audio files for each reciter are cached in separate caches, prefixed with `quran-audio-`. This allows for individual management of the audio data for each reciter.
    -   **Cache Management:** The service worker includes logic to clean up outdated caches on activation.
-   **Offline Service:** The `offlineService.ts` (not read, but inferred from `OfflineManager.tsx`) encapsulates the logic for downloading and managing offline data. It likely interacts with the service worker to cache the data.
-   **State Management:** The `OfflineManager.tsx` component uses the `useState` and `useEffect` hooks to manage the download status and progress for each item.
-   **UI:** The UI is built with Tailwind CSS and includes buttons for downloading and deleting data, as well as progress bars to show the download progress.

### Known Issues

-   **Ayah Context Menu not appearing in Development Server:** When running the application on the development server (`npm run dev`), the context menu that should appear upon clicking an ayah does not show up. However, this feature works as expected in the production build (`npm run build`). This suggests a potential discrepancy in how the application behaves between development and production environments, possibly related to CSS, JavaScript execution, or `framer-motion` interactions in a development context.

## Azkar Feature Integration Plan

This section outlines the plan to integrate the "Hisn al-Muslim" (Fortress of the Muslim) Azkar feature into the application.

### ١. خطة دمج ميزة الأذكار

١. **إنشاء مستودع جديد على GitHub:** سيتم إنشاء مستودع جديد باسم `azkar-data` لرفع ملفات الأذكار (النصية والصوتية).
٢. **تنظيم وهيكلة البيانات:** سيتم تنظيم ملفات الأذكار في المستودع بطريقة تسهل الوصول إليها برمجياً (e.g., a JSON file for text and a directory for audio files).
٣. **تعديل تطبيق القرآن الكريم:**
    - إضافة شاشة جديدة لعرض الأذكار.
    - ربط التطبيق بالمستودع على GitHub لجلب قائمة الأذكار.
    - عرض الأذكار النصية مع إمكانية تشغيل الملفات الصوتية المقابلة.
٤. **الاختبار والنشر:** اختبار الميزة الجديدة والتأكد من عملها بشكل صحيح قبل إطلاقها.

### 2. English Translation of the Plan

1.  **Create a new GitHub repository:** A new repository named `azkar-data` will be created to host the Azkar files (text and audio).
2.  **Data Structuring:** The Azkar files in the repository will be organized in a way that is easy to access programmatically (e.g., a JSON file for text and a directory for audio files).
3.  **Quran App Modification:**
    *   Add a new screen to display the Azkar.
    *   Connect the application to the GitHub repository to fetch the list of Azkar.
    *   Display the Azkar text with the ability to play the corresponding audio files.
4.  **Testing and Deployment:** Test the new feature to ensure it works correctly before release.

## Future Development

-   [ ] Add more translations and tafsirs.
-   [ ] Improve the UI/UX of the application.
-   [ ] Add more features to the AI assistant.
-   [ ] Add more Hadith books.
-   [ ] Implement end-to-end testing.