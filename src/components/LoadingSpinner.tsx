import React from "react";

interface LoadingSpinnerProps {
  text?: string;
  subtext?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Processing...",
  subtext = "Please wait, Gemini AI is analyzing...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Pulsing outer ring */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-blue-500/10 dark:bg-blue-400/10" />
        
        {/* Spinning main wheel */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400" />
      </div>

      <h3 className="mt-6 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
        {text}
      </h3>
      {subtext && (
        <p className="mt-2 max-w-xs text-xs text-gray-400 dark:text-gray-500">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
