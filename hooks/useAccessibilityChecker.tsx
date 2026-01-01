import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { WcagRating, AccessibilityResult } from '../types';

interface AccessibilityContextType {
  registerResult: (key: string, result: AccessibilityResult) => void;
  unregisterResult: (key: string) => void;
  isCheckerVisible: boolean;
  toggleCheckerVisibility: () => void;
  errorSummary: Record<string, number>;
  results: Record<string, AccessibilityResult>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const ORIGINAL_TITLE = 'Live CSS Theme Customizer';

export const AccessibilityCheckerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<Record<string, AccessibilityResult>>({});
  const [isCheckerVisible, setIsCheckerVisible] = useState(true);

  const registerResult = useCallback((key: string, result: AccessibilityResult) => {
    setResults(prev => ({ ...prev, [key]: result }));
  }, []);
  
  const unregisterResult = useCallback((key: string) => {
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[key];
      return newResults;
    });
  }, []);

  const toggleCheckerVisibility = useCallback(() => {
    setIsCheckerVisible(prev => !prev);
  }, []);

  const errorSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    if (!isCheckerVisible) return summary;

    for (const key in results) {
      const result = results[key];
      if (result.rating === 'FAIL') {
        summary[result.categoryKey] = (summary[result.categoryKey] || 0) + 1;
      }
    }
    return summary;
  }, [results, isCheckerVisible]);

  useEffect(() => {
    const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (!ctx || !favicon) return;
    
    // FIX: Explicitly type `r` as `AccessibilityResult` as TypeScript was inferring it as `unknown`.
    const failures = Object.values(results).filter((r: AccessibilityResult) => r.rating === 'FAIL').length;

    // Update title
    if (isCheckerVisible && failures > 0) {
      document.title = `(${failures} errors) ${ORIGINAL_TITLE}`;
    } else {
      document.title = ORIGINAL_TITLE;
    }

    // Update favicon
    ctx.clearRect(0, 0, 32, 32);
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, 2 * Math.PI);
    ctx.fillStyle = isCheckerVisible && failures > 0 ? 'var(--fail)' : 'var(--pass)';
    ctx.fill();
    
    favicon.href = canvas.toDataURL('image/png');

  }, [results, isCheckerVisible]);

  const value = {
    registerResult,
    unregisterResult,
    isCheckerVisible,
    toggleCheckerVisibility,
    errorSummary,
    results,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityChecker = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityChecker must be used within a AccessibilityCheckerProvider');
  }
  return context;
};