import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { HadithPage } from './HadithPage';
import { hadithCollection } from '../data/hadithData';

// Mock the fetch API
global.fetch = vi.fn();

// Mock the virtualizer
vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: vi.fn((opts) => ({
        getVirtualItems: () => {
            const items = [];
            for (let i = 0; i < opts.count; i++) {
                items.push({
                    index: i,
                    key: i,
                    start: i * opts.estimateSize(),
                    size: opts.estimateSize(),
                });
            }
            return items;
        },
        getTotalSize: () => opts.count * opts.estimateSize(),
    })),
}));

const mockBook = hadithCollection.chapters[0]; // e.g., Bukhari
const mockChapters = [{ id: '1', arabic: 'Chapter 1' }, { id: '2', arabic: 'Chapter 2' }];
const mockHadiths = [{ id: '1', idInBook: '1', chapterId: '1', arabic: 'Hadith 1 text.' }];

describe('HadithPage', () => {
    beforeEach(() => {
        // Reset mocks before each test
        (fetch as any).mockClear();
    });

    test('renders the book list view initially', () => {
        render(<HadithPage />);
        expect(screen.getByText('الحديث الشريف')).toBeInTheDocument();
        expect(screen.getByText(mockBook.arabic)).toBeInTheDocument();
    });

    test('navigates to chapter list view when a book is selected', async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockChapters,
        });

        render(<HadithPage />);

        // Click on the first book
        fireEvent.click(screen.getByText(mockBook.arabic));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(`/hadith-data/${mockBook.id}/chapters.json`);
        });

        // Check that the chapter view is rendered
        await waitFor(() => {
            expect(screen.getByText(mockBook.arabic)).toBeInTheDocument(); // Header with book name
            expect(screen.getByText('Chapter 1')).toBeInTheDocument();
            expect(screen.getByText('Chapter 2')).toBeInTheDocument();
        });
    });

    test('navigates to hadith list view when a chapter is selected', async () => {
        // First, navigate to chapters view
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockChapters,
        });
        render(<HadithPage />);
        fireEvent.click(screen.getByText(mockBook.arabic));
        await waitFor(() => expect(screen.getByText('Chapter 1')).toBeInTheDocument());

        // Now, mock the fetch for hadiths and click a chapter
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockHadiths,
        });

        fireEvent.click(screen.getByText('Chapter 1'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(`/hadith-data/${mockBook.id}/${mockChapters[0].id}.json`);
        });

        // Check that the hadith view is rendered
        await waitFor(() => {
            expect(screen.getByText(mockHadiths[0].arabic)).toBeInTheDocument();
            expect(screen.getByText(`[${mockHadiths[0].idInBook}]`)).toBeInTheDocument();
        });
    });

    test('navigates back from hadiths to chapters, and from chapters to books', async () => {
        // 1. Go to Chapters
        (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => mockChapters });
        render(<HadithPage />);
        fireEvent.click(screen.getByText(mockBook.arabic));
        await waitFor(() => expect(screen.getByText('Chapter 1')).toBeInTheDocument());

        // 2. Go to Hadiths
        (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => mockHadiths });
        fireEvent.click(screen.getByText('Chapter 1'));
        await waitFor(() => expect(screen.getByText(mockHadiths[0].arabic)).toBeInTheDocument());

        // 3. Go back to Chapters
        const backButton = screen.getByLabelText('العودة إلى قائمة الأبواب');
        fireEvent.click(backButton);
        await waitFor(() => expect(screen.getByText('Chapter 1')).toBeInTheDocument());
        expect(screen.queryByText(mockHadiths[0].arabic)).not.toBeInTheDocument();

        // 4. Go back to Books
        const backToBooksButton = screen.getByLabelText('العودة إلى قائمة الكتب');
        fireEvent.click(backToBooksButton);
        await waitFor(() => expect(screen.getByText('الحديث الشريف')).toBeInTheDocument());
        expect(screen.queryByText('Chapter 1')).not.toBeInTheDocument();
    });

    test('displays an error message when fetching chapters fails', async () => {
        (fetch as any).mockRejectedValueOnce(new Error('Network error'));

        render(<HadithPage />);
        fireEvent.click(screen.getByText(mockBook.arabic));

        await waitFor(() => {
            expect(screen.getByText('فشل تحميل الأبواب. يرجى المحاولة مرة أخرى.')).toBeInTheDocument();
        });
    });
});
