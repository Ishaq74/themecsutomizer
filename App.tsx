import React, { useState, useEffect, useCallback } from 'react';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { Showcase } from './components/Showcase';
import { useTheme } from './hooks/useTheme';
import { AccessibilityCheckerProvider } from './hooks/useAccessibilityChecker';
import { VARIANT_KEYS, VariantKey } from './types';

const App: React.FC = () => {
  // State for theme mode, initialized from system preference
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const { 
    theme, 
    updateTheme, 
    generateCss, 
    generateJson, 
    resetTheme, 
    hasChanges,
    customPresets,
    savePreset,
    deletePreset,
    applyPreset,
    fixContrast
  } = useTheme(isDark);
  
  // Effect to listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setIsDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const [visibleVariants, setVisibleVariants] = useState<Set<VariantKey>>(() => new Set(VARIANT_KEYS));

  const handleVariantToggle = useCallback((variant: VariantKey, checked: boolean) => {
    setVisibleVariants(prev => {
      const next = new Set(prev);
      if (!checked && next.size === 1 && next.has(variant)) {
        return prev;
      }
      if (checked) {
        next.add(variant);
      } else {
        next.delete(variant);
      }
      return next;
    });
  }, []);

  const resetVariantFilters = useCallback(() => {
    setVisibleVariants(new Set(VARIANT_KEYS));
  }, []);
  
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);


  return (
    <AccessibilityCheckerProvider>
      <div className="flex flex-col md:flex-row h-screen" style={{ backgroundColor: 'var(--bg-default)', color: 'var(--text-default)' }}>
        <aside 
          className="w-full md:w-80 lg:w-96 border-r shadow-lg overflow-y-auto"
          style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-subtle)' }}
        >
          <ThemeCustomizer 
            theme={theme} 
            updateTheme={updateTheme}
            generateCss={generateCss}
            generateJson={generateJson}
            resetTheme={resetTheme}
            hasChanges={hasChanges}
            isDark={isDark}
            toggleTheme={toggleTheme}
            customPresets={customPresets}
            savePreset={savePreset}
            deletePreset={deletePreset}
            applyPreset={applyPreset}
            fixContrast={fixContrast}
            visibleVariants={visibleVariants}
            onToggleVariant={handleVariantToggle}
            onSelectAllVariants={resetVariantFilters}
          />
        </aside>
        <main className="flex-1 overflow-y-auto scroll-area">
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
              <Showcase theme={theme} isDark={isDark} visibleVariants={visibleVariants} />
          </div>
        </main>
      </div>
    </AccessibilityCheckerProvider>
  );
};

export default App;