
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import SmartDownloadButton from './SmartDownloadButton';
import * as Downloader from '../services/downloadManager';

vi.mock('../services/downloadManager', () => ({
  getDownloadedItem: vi.fn(),
  downloadAndCacheFiles: vi.fn(),
  addDownloadedItem: vi.fn(),
}));

describe('SmartDownloadButton', () => {
    it('should download files when clicked', async () => {
        vi.mocked(Downloader.getDownloadedItem).mockResolvedValue(undefined);
        vi.mocked(Downloader.downloadAndCacheFiles).mockResolvedValue(12345);

        const getUrlsToDownload = vi.fn().mockResolvedValue(['http://example.com/audio.mp3']);

        render(
            <SmartDownloadButton
                itemId="test-item"
                itemName="Test Item"
                itemType="memorization_section"
                getUrlsToDownload={getUrlsToDownload}
            />
        );

        // Wait for the button to be ready
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const downloadButton = screen.getByRole('button', { name: /تحميل/i });

        await act(async () => {
            downloadButton.click();
        });

        expect(Downloader.downloadAndCacheFiles).toHaveBeenCalledWith(
            ['http://example.com/audio.mp3'],
            expect.any(Function)
        );

        expect(Downloader.addDownloadedItem).toHaveBeenCalledWith({
            id: 'test-item',
            name: 'Test Item',
            type: 'memorization_section',
            urls: ['http://example.com/audio.mp3'],
            size: 12345,
            timestamp: expect.any(Number),
        });
    });
});
