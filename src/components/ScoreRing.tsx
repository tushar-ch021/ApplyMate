import React, { useEffect, useState } from "react";
import { getScoreColor } from "../utils/helpers";

interface ScoreRingProps {
  score: number;
  label?: string;
  size?: number;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score = 0,
  label = "Shortlisting Chance",
  size = 180,
}) => {
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Count up animation
    setAnimatedScore(0);
    const duration = 1000; // 1s animation
    const steps = 60;
    const stepValue = score / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(stepValue * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [score]);

  const colorStyles = getScoreColor(score);
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`relative rounded-full p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 ${colorStyles.glow} transition-shadow duration-300`}
        style={{ width: size, height: size }}
      >
        {/* SVG Progress Circle */}
        <svg className="rotate-[-90deg]" width={size - 16} height={size - 16}>
          {/* Background circle */}
          <circle
            cx={(size - 16) / 2}
            cy={(size - 16) / 2}
            r={radius}
            className="stroke-gray-100 dark:stroke-gray-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={(size - 16) / 2}
            cy={(size - 16) / 2}
            r={radius}
            stroke={colorStyles.hex}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-[stroke-dashoffset] duration-100 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {animatedScore}
          </span>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mt-0.5 tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      {label && (
        <span className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreRing;
