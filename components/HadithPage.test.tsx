import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { HadithPage } from './HadithPage';
import { hadithCollection } from '../data/hadithData';
import { hadithBookUrls } from '../data/hadithUrls';
import { AppContext } from '../context/AppContext';

// Mock the fetch API
global.fetch = vi.fn();

// Mock the virtualizer
vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: vi.fn((opts) => ({
        getVirtualItems: () => {
            if (!opts.count) return [];
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
        getTotalSize: () => (opts.count || 0) * opts.estimateSize(),
    })),
}));

// Mock the AppContext to provide necessary values
const mockNavigateTo = vi.fn();
const mockContext: any = {
    navigateTo: mockNavigateTo,
    settings: { memorizationReciter: 'ar.alafasy' }, // Provide a default reciter
};

const mockBook = hadithCollection.chapters[0]; // e.g., Bukhari
const mockChapters = [{ id: 1, arabic: 'Chapter 1' }];
const mockHadiths = [{ id: 1, idInBook: '1', chapterId: 1, arabic: 'Hadith 1 text.' }];
const mockBookData = {
    chapters: mockChapters,
    hadiths: mockHadiths,
};

const renderWithContext = (component: React.ReactElement) => {
    return render(
        <AppContext.Provider value={mockContext}>
            {component}
        </AppContext.Provider>
    );
};


describe('HadithPage', () => {
    beforeEach(() => {
        // Reset mocks before each test
        (fetch as any).mockClear();
        mockNavigateTo.mockClear();
    });

    test('renders the book list view initially', () => {
        renderWithContext(<HadithPage />);
        expect(screen.getByText('الحديث الشريف')).toBeInTheDocument();
        expect(screen.getByText(mockBook.arabic)).toBeInTheDocument();
    });

    test('navigates to chapter list view when a book is selected', async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockBookData,
        });

        renderWithContext(<HadithPage />);

        // Click on the first book
        fireEvent.click(screen.getByText(mockBook.arabic));

        const expectedUrl = hadithBookUrls[mockBook.id as keyof typeof hadithBookUrls];

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
        });

        // Check that the chapter view is rendered
        await waitFor(() => {
            expect(screen.getByText(mockBook.arabic)).toBeInTheDocument(); // Header with book name
            expect(screen.getByText('Chapter 1')).toBeInTheDocument();
        });
    });

    test('navigates to hadith list view when a chapter is selected', async () => {
        // First, navigate to chapters view
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockBookData,
        });
        renderWithContext(<HadithPage />);
        fireEvent.click(screen.getByText(mockBook.arabic));

        await waitFor(() => {
            expect(screen.getByText('Chapter 1')).toBeInTheDocument()
        });

        // Now, click the chapter
        fireEvent.click(screen.getByText('Chapter 1'));

        // Check that the hadith view is rendered
        await waitFor(() => {
            // The virtualizer might not render the item immediately, but the header should be there
            expect(screen.getByText(mockChapters[0].arabic)).toBeInTheDocument();
        });
    });

    test('navigates back from hadiths to chapters, and from chapters to books', async () => {
        // 1. Go to Chapters
        (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => (mockBookData) });
        renderWithContext(<HadithPage />);
        fireEvent.click(screen.getByText(mockBook.arabic));
        await waitFor(() => expect(screen.getByText('Chapter 1')).toBeInTheDocument());

        // 2. Go to Hadiths
        fireEvent.click(screen.getByText('Chapter 1'));
        await waitFor(() => expect(screen.getByText(mockChapters[0].arabic)).toBeInTheDocument());

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

        renderWithContext(<HadithPage />);
        fireEvent.click(screen.getByText(mockBook.arabic));

        await waitFor(() => {
            expect(screen.getByText('فشل تحميل الكتاب. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.')).toBeInTheDocument();
        });
    });
});