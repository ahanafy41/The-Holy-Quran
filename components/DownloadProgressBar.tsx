import React from 'react';

interface DownloadProgressBarProps {
  progress: number;
}

/**
 * `DownloadProgressBar` is an accessible component for displaying download progress.
 * It uses a native `<progress>` element and provides rich ARIA attributes for screen readers.
 *
 * @param {DownloadProgressBarProps} props - The component props.
 * @param {number} props.progress - The current progress percentage (0-100).
 * @returns {React.ReactElement} An accessible progress bar.
 */
const DownloadProgressBar: React.FC<DownloadProgressBarProps> = ({ progress }) => {
  const roundedProgress = Math.round(progress);

  return (
    <div className="w-full flex items-center gap-2" role="status" aria-live="polite">
      <progress
        className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-200 dark:[&::-webkit-progress-bar]:bg-slate-600 [&::-webkit-progress-value]:bg-green-500 [&::-moz-progress-bar]:bg-green-500"
        value={roundedProgress}
        max="100"
        aria-valuenow={roundedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`جاري التحميل: ${roundedProgress}%`}
      >
        {roundedProgress}%
      </progress>
      <span className="text-sm font-mono text-slate-500 dark:text-slate-400 w-10 text-left">
        {roundedProgress}%
      </span>
    </div>
  );
};

export default DownloadProgressBar;