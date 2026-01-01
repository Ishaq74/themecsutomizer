import React, { useState, useEffect, RefObject } from 'react';
import { WcagRating } from '../types';
import { ThemeVariables } from '../hooks/useTheme';
import { useAccessibilityChecker } from '../hooks/useAccessibilityChecker';
import { parseRgbString, findEffectiveBackgroundColor, getContrastRatio, getWcagRating } from '../utils/color';

interface ContrastCheckerBadgeProps {
  targetRef: RefObject<HTMLElement>;
  theme: ThemeVariables; // Used to trigger re-calculation
  isDark: boolean; // To trigger re-calculation on theme change
  uniqueKey: string;
  categoryKey: string;
  lineNumber?: number;
}

export const ContrastCheckerBadge: React.FC<ContrastCheckerBadgeProps> = ({ targetRef, theme, isDark, uniqueKey, categoryKey, lineNumber }) => {
  const [contrast, setContrast] = useState<number | null>(null);
  const [rating, setRating] = useState<WcagRating | null>(null);
  const { registerResult, unregisterResult, isCheckerVisible } = useAccessibilityChecker();

  useEffect(() => {
    const element = targetRef.current;
    
    if (!isCheckerVisible || !element) {
        setContrast(null);
        setRating(null);
        return; // Cleanup will be handled by the return function
    }

    // Use a timeout to ensure styles are applied after a theme change
    const timeoutId = setTimeout(() => {
        const computedStyle = window.getComputedStyle(element);
        const textColorStr = computedStyle.color;
        const bgColorStr = findEffectiveBackgroundColor(element);

        const textColor = parseRgbString(textColorStr);
        const bgColor = parseRgbString(bgColorStr);

        if (textColor && bgColor) {
            const ratio = getContrastRatio(textColor, bgColor);
            const wcagRating = getWcagRating(ratio);
            setContrast(ratio);
            setRating(wcagRating);
            registerResult(uniqueKey, { rating: wcagRating, categoryKey, backgroundColor: bgColorStr });
        }
    }, 50); // Small delay to allow DOM to update

    return () => {
        clearTimeout(timeoutId);
        unregisterResult(uniqueKey);
    };

  }, [targetRef, theme, isDark, uniqueKey, categoryKey, registerResult, unregisterResult, isCheckerVisible]);

  if (!isCheckerVisible || contrast === null || rating === null) {
    return null;
  }

  return (
    <span className="contrast-badge" data-rating={rating}>
      {lineNumber && <span className="line-number">L{lineNumber}</span>}
      {contrast.toFixed(2)}:1 {rating}
    </span>
  );
};