import { useState, useEffect, useCallback } from 'react';
import { type ThemeVariables, type ConfigurableThemeVariable, type SavedPreset } from '../types';
import { getAccessibleTextColor, findBestContrastColor } from '../utils/color';

export type { ThemeVariables };

const DEFAULT_THEME_PRIMITIVES: Partial<ThemeVariables> = {
  // Brand
  '--color-primary': '#4f46e5',
  '--color-secondary': '#0ea5e9',
  '--color-accent': '#d946ef',
  '--color-success': '#16a34a',
  '--color-warning': '#f97316',
  '--color-danger': '#dc2626',
  
  // Globals
  '--font-family-sans': '"Plus Jakarta Sans", "Inter", sans-serif',
  '--font-family-display': '"Space Grotesk", sans-serif',
  '--font-family-mono': '"Space Mono", monospace',
  '--space-1': '0.25rem',
  '--space-2': '0.5rem',
  '--space-3': '0.75rem',
  '--space-4': '1rem',
  '--space-6': '1.5rem',
  '--space-8': '2rem',
  '--border-radius-sm': '0.25rem',
  '--border-radius-md': '0.375rem',
  '--border-radius-lg': '0.75rem',
  '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
  '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
  
  // Initial Components
  '--button-padding-y': 'var(--space-2)',
  '--button-padding-x': 'var(--space-4)',
  '--button-border-radius': 'var(--border-radius-md)',
  '--button-font-size': '0.875rem',
  '--button-border-width': '1px',
  
  '--input-padding-y': 'var(--space-2)',
  '--input-padding-x': 'var(--space-3)',
  '--input-border-width': '1px',
  '--input-border-radius': 'var(--border-radius-md)',
  
  '--card-padding': 'var(--space-6)',
  '--card-border-radius': 'var(--border-radius-lg)',
  '--card-border-width': '1px',

  '--badge-padding-y': '0.25em',
  '--badge-padding-x': '0.6em',
  '--badge-font-size': '0.75rem',
  '--badge-border-radius': 'var(--border-radius-lg)',

  '--alert-padding-y': 'var(--space-4)',
  '--alert-border-radius': 'var(--border-radius-md)',
  
  // Variant Primitives
  '--retro-border-width': '2px',
  '--retro-shadow-offset': '4px',
  '--modern-radius': '999px',
  '--futuristic-clip-path': 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
  '--futuristic-glow': 'rgba(79, 70, 229, 0.5)',

  // Form Controls
  '--switch-width': '2.5rem',
  '--switch-height': '1.5rem',
  '--switch-handle-size': '1rem',
  '--checkbox-size': '1.2rem',
  '--checkbox-radius': 'var(--border-radius-sm)',
  '--slider-track-height': '0.5rem',
  '--slider-thumb-size': '1.25rem',
  
  // Table
  '--table-padding-y': 'var(--space-3)',
  '--table-padding-x': 'var(--space-4)',
  
  // Avatar
  '--avatar-size': '2.5rem',
  '--avatar-border-radius': '50%',
  
  // Tabs
  '--tab-font-size': '0.875rem',
  '--tab-padding-y': 'var(--space-2)',
  '--tab-padding-x': 'var(--space-4)',

  // Grid
  '--grid-gap': 'var(--space-4)',
  '--grid-column-min': '250px',

  // Popover
  '--popover-padding': 'var(--space-4)',
  '--popover-border-radius': 'var(--border-radius-md)',
  '--popover-shadow': 'var(--shadow-lg)',
  
  // Tooltip
  '--tooltip-padding-y': 'var(--space-1)',
  '--tooltip-border-radius': 'var(--border-radius-sm)',
  
  // Toast
  '--toast-border-radius': 'var(--border-radius-md)',
  '--modern-toast-radius': 'var(--border-radius-lg)',
  
  // Pagination
  '--pagination-item-size': '2rem',
  '--pagination-item-border-radius': 'var(--border-radius-md)',
};

export const SEMANTIC_MAPPINGS = {
    // Globals
    '--bg-default': { light: '#ffffff', dark: '#0f172a' },
    '--bg-subtle': { light: '#f8fafc', dark: '#1e293b' },
    '--bg-inset': { light: '#f1f5f9', dark: '#020617' },
    '--text-default': { light: '#0f172a', dark: '#f8fafc' },
    '--text-muted': { light: '#64748b', dark: '#94a3b8' },
    '--text-inverted': { light: '#ffffff', dark: '#000000' },
    '--border-default': { light: '#e2e8f0', dark: '#334155' },
    '--border-strong': { light: '#cbd5e1', dark: '#475569' },
    
    // --- BUTTONS ---
    '--button-default-bg': { light: 'var(--bg-subtle)', dark: 'var(--bg-subtle)' },
    '--button-default-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--button-default-border-color': { light: 'var(--border-default)', dark: 'var(--border-strong)' },
    '--button-default-bg-hover': { light: 'var(--bg-inset)', dark: 'var(--bg-inset)' },
    '--button-primary-bg': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--button-primary-color': { light: '#ffffff', dark: '#ffffff' },
    '--button-secondary-bg': { light: 'var(--color-secondary)', dark: 'var(--color-secondary)' },
    '--button-secondary-color': { light: '#ffffff', dark: '#ffffff' },
    '--button-accent-bg': { light: 'var(--color-accent)', dark: 'var(--color-accent)' },
    '--button-accent-color': { light: '#ffffff', dark: '#ffffff' },
    
    '--retro-button-bg': { light: 'var(--bg-default)', dark: 'var(--bg-default)' },
    '--retro-button-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--retro-button-border-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--retro-button-hover-bg': { light: 'var(--bg-inset)', dark: 'var(--bg-inset)' },
    '--retro-button-active-bg': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--retro-shadow-color': { light: '#000000', dark: '#ffffff' },
    
    '--modern-button-bg': { light: 'var(--bg-subtle)', dark: 'var(--bg-subtle)' },
    '--modern-button-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--modern-button-border-color': { light: 'transparent', dark: 'transparent' },
    '--modern-button-hover-shadow': { light: '0 10px 15px -3px rgba(0,0,0,0.1)', dark: '0 10px 15px -3px rgba(0,0,0,0.5)' },
    
    '--futuristic-button-bg': { light: 'rgba(79, 70, 229, 0.1)', dark: 'rgba(79, 70, 229, 0.1)' },
    '--futuristic-button-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-button-border-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-button-hover-bg': { light: 'rgba(79, 70, 229, 0.2)', dark: 'rgba(79, 70, 229, 0.2)' },
    '--futuristic-button-hover-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },

    // --- INPUTS ---
    '--input-bg': { light: 'var(--bg-subtle)', dark: 'var(--bg-inset)' },
    '--input-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--input-border-color': { light: 'var(--border-default)', dark: 'var(--border-strong)' },
    '--input-border-color-focus': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    
    '--retro-input-bg': { light: 'white', dark: 'black' },
    '--retro-input-color': { light: 'black', dark: 'white' },
    '--retro-input-border-color': { light: 'black', dark: 'white' },
    '--retro-input-focus-bg': { light: '#f0f0f0', dark: '#222' },
    
    '--modern-input-bg': { light: '#f9fafb', dark: '#1e293b' },
    '--modern-input-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--modern-input-border-color': { light: 'var(--border-default)', dark: 'var(--border-strong)' },
    
    '--futuristic-input-bg': { light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.05)' },
    '--futuristic-input-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-input-border-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-input-focus-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },

    // --- CARDS ---
    '--card-bg': { light: 'white', dark: '#1e293b' },
    '--card-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--card-border-color': { light: 'var(--border-default)', dark: 'var(--border-strong)' },
    
    '--retro-card-bg': { light: '#fff', dark: '#000' },
    '--retro-card-color': { light: '#000', dark: '#fff' },
    '--retro-card-border-color': { light: '#000', dark: '#fff' },
    
    '--modern-card-bg': { light: 'white', dark: '#1e293b' },
    '--modern-card-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--modern-card-border-color': { light: 'transparent', dark: 'transparent' },
    
    '--futuristic-card-bg': { light: 'rgba(255,255,255,0.1)', dark: 'rgba(0,0,0,0.2)' },
    '--futuristic-card-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--futuristic-card-border-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },

    // --- BADGES ---
    '--badge-primary-bg': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--badge-primary-color': { light: 'white', dark: 'white' },
    '--badge-secondary-bg': { light: 'var(--color-secondary)', dark: 'var(--color-secondary)' },
    '--badge-secondary-color': { light: 'white', dark: 'white' },
    '--badge-accent-bg': { light: 'var(--color-accent)', dark: 'var(--color-accent)' },
    '--badge-accent-color': { light: 'white', dark: 'white' },
    
    '--retro-badge-bg': { light: 'white', dark: 'black' },
    '--modern-badge-bg': { light: 'var(--bg-subtle)', dark: 'var(--bg-subtle)' },
    '--futuristic-badge-bg': { light: 'transparent', dark: 'transparent' },

    // --- ALERTS ---
    '--alert-info-bg': { light: '#eff6ff', dark: '#172554' },
    '--alert-info-color': { light: '#1e40af', dark: '#bfdbfe' },
    '--alert-success-bg': { light: '#f0fdf4', dark: '#052e16' },
    '--alert-success-color': { light: '#166534', dark: '#bbf7d0' },
    '--alert-warning-bg': { light: '#fff7ed', dark: '#431407' },
    '--alert-warning-color': { light: '#9a3412', dark: '#fed7aa' },
    '--alert-danger-bg': { light: '#fef2f2', dark: '#450a0a' },
    '--alert-danger-color': { light: '#991b1b', dark: '#fecaca' },
    
    '--retro-alert-bg': { light: 'white', dark: 'black' },
    '--modern-alert-bg': { light: '#f8fafc', dark: '#0f172a' },
    '--futuristic-alert-bg': { light: 'rgba(0,0,0,0.2)', dark: 'rgba(0,0,0,0.5)' },

    // --- FORM CONTROLS VARIANTS ---
    '--switch-bg-off': { light: '#cbd5e1', dark: '#475569' },
    '--switch-bg-on': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--switch-handle-color': { light: 'white', dark: 'white' },
    '--retro-switch-bg-off': { light: 'white', dark: 'black' },
    '--retro-switch-bg-on': { light: 'black', dark: 'white' },
    '--modern-switch-bg-off': { light: '#e2e8f0', dark: '#334155' },
    '--modern-switch-bg-on': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-switch-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },

    '--checkbox-bg': { light: 'white', dark: '#1e293b' },
    '--checkbox-border': { light: '#cbd5e1', dark: '#475569' },
    '--checkbox-checked-bg': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--checkbox-check-color': { light: 'white', dark: 'white' },
    '--retro-checkbox-bg': { light: 'white', dark: 'black' },
    '--modern-checkbox-checked-bg': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-checkbox-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },

    '--slider-track-bg': { light: '#e2e8f0', dark: '#334155' },
    '--slider-thumb-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--retro-slider-track-bg': { light: 'white', dark: 'black' },
    '--retro-slider-thumb-color': { light: 'black', dark: 'white' },
    '--futuristic-slider-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },

    // --- TABLE VARIANTS ---
    '--table-header-bg': { light: '#f1f5f9', dark: '#1e293b' },
    '--table-header-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--retro-table-header-bg': { light: 'black', dark: 'white' },
    '--retro-table-header-color': { light: 'white', dark: 'black' },
    '--retro-table-border-color': { light: 'black', dark: 'white' },
    '--modern-table-stripe-bg': { light: '#f8fafc', dark: '#0f172a' },
    '--futuristic-table-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    
    // --- AVATAR VARIANTS ---
    '--avatar-bg': { light: '#e2e8f0', dark: '#334155' },
    '--avatar-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--retro-avatar-border-color': { light: 'black', dark: 'white' },
    '--modern-avatar-radius': { light: '50%', dark: '50%' },
    '--futuristic-avatar-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    
    // --- TABS VARIANTS ---
    '--tab-active-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--tab-inactive-color': { light: '#64748b', dark: '#94a3b8' },
    '--tab-active-border-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--retro-tab-active-bg': { light: 'black', dark: 'white' },
    '--modern-tab-active-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-tab-bg': { light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.05)' },
    
    // --- PAGINATION VARIANTS ---
    '--pagination-item-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--pagination-item-hover-bg': { light: '#f1f5f9', dark: '#1e293b' },
    '--pagination-item-active-bg': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--pagination-item-active-color': { light: 'white', dark: 'white' },
    '--retro-pagination-bg': { light: 'white', dark: 'black' },
    '--retro-pagination-active-bg': { light: 'black', dark: 'white' },
    '--modern-pagination-active-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-pagination-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    
    // --- BREADCRUMB VARIANTS ---
    '--breadcrumb-separator-color': { light: '#94a3b8', dark: '#64748b' },
    '--breadcrumb-active-color': { light: '#0f172a', dark: '#f8fafc' },
    '--retro-breadcrumb-separator': { light: '"/"', dark: '"/"' },
    '--modern-breadcrumb-color': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },
    '--futuristic-breadcrumb-glow': { light: 'var(--color-primary)', dark: 'var(--color-primary)' },

    // --- OVERLAY VARIANTS ---
    '--toast-bg': { light: 'white', dark: '#1e293b' },
    '--toast-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--retro-toast-border-color': { light: 'black', dark: 'white' },
    '--modern-toast-radius': { light: 'var(--border-radius-lg)', dark: 'var(--border-radius-lg)' },
    '--futuristic-toast-bg': { light: 'rgba(255,255,255,0.8)', dark: 'rgba(0,0,0,0.8)' },
    
    '--popover-bg': { light: 'white', dark: '#1e293b' },
    '--popover-border-color': { light: '#e2e8f0', dark: '#334155' },
    '--popover-item-color': { light: 'var(--text-default)', dark: 'var(--text-default)' },
    '--popover-item-hover-bg': { light: '#f8fafc', dark: '#0f172a' },
    '--tooltip-bg': { light: '#1e293b', dark: '#f8fafc' },
    '--tooltip-color': { light: 'white', dark: '#0f172a' },
};

const buildDefaultTheme = (): ThemeVariables => {
  const theme: Partial<ThemeVariables> = { ...DEFAULT_THEME_PRIMITIVES };
  for (const key in SEMANTIC_MAPPINGS) {
    const varKey = key as keyof typeof SEMANTIC_MAPPINGS;
    theme[`${varKey}-light` as keyof ThemeVariables] = SEMANTIC_MAPPINGS[varKey].light;
    theme[`${varKey}-dark` as keyof ThemeVariables] = SEMANTIC_MAPPINGS[varKey].dark;
  }
  return theme as ThemeVariables;
};

export const DEFAULT_THEME = buildDefaultTheme();

const THEME_STORAGE_KEY = 'custom-theme-v16'; // Incremented version to force reset
const PRESETS_STORAGE_KEY = 'custom-theme-presets-v1';

const getInitialTheme = (): ThemeVariables => {
  try {
    const item = window.localStorage.getItem(THEME_STORAGE_KEY);
    const savedTheme = item ? JSON.parse(item) : {};
    return { ...DEFAULT_THEME, ...savedTheme };
  } catch (error) {
    return DEFAULT_THEME;
  }
};

const getInitialPresets = (): SavedPreset[] => {
    try {
        const item = window.localStorage.getItem(PRESETS_STORAGE_KEY);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        return [];
    }
}

export const useTheme = (isDark: boolean) => {
  const [theme, setTheme] = useState<ThemeVariables>(getInitialTheme);
  const [savedThemeState, setSavedThemeState] = useState<ThemeVariables>(getInitialTheme);
  const [hasChanges, setHasChanges] = useState(false);
  const [staticCss, setStaticCss] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<SavedPreset[]>(getInitialPresets);

  useEffect(() => {
    const cssText = document.getElementById('design-system-styles')?.textContent;
    setStaticCss(cssText || '');
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(theme) !== JSON.stringify(savedThemeState));
  }, [theme, savedThemeState]);

  useEffect(() => {
    const isDefault = JSON.stringify(theme) === JSON.stringify(DEFAULT_THEME);
    if (isDefault) {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
        window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const mode = isDark ? 'dark' : 'light';

    for (const key in DEFAULT_THEME_PRIMITIVES) {
      root.style.setProperty(key, theme[key as keyof ThemeVariables]);
    }
    
    for (const key in SEMANTIC_MAPPINGS) {
        const baseKey = key as ConfigurableThemeVariable;
        const modeKey = `${baseKey}-${mode}` as keyof ThemeVariables;
        root.style.setProperty(baseKey, theme[modeKey]);
    }
    
    // Auto-contrast text
    ['primary','secondary','accent','success','warning','danger'].forEach(color => {
       const bgKey = `--color-${color}` as keyof ThemeVariables;
       root.style.setProperty(`--${color}-text`, getAccessibleTextColor(theme[bgKey]));
    });

  }, [theme, isDark]);

  const updateTheme = useCallback((key: keyof ThemeVariables, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    setSavedThemeState(DEFAULT_THEME);
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  }, []);
  
  const applyPreset = useCallback((presetTheme: Partial<ThemeVariables>) => {
    const newTheme = { ...DEFAULT_THEME, ...presetTheme };
    setTheme(newTheme);
    setSavedThemeState(newTheme);
  }, []);

  const savePreset = useCallback((name: string) => {
    const changedKeys: Partial<ThemeVariables> = {};
    (Object.keys(theme) as Array<keyof ThemeVariables>).forEach(key => {
        if (theme[key] !== DEFAULT_THEME[key]) {
          changedKeys[key] = theme[key];
        }
    });
    const newPreset: SavedPreset = { name, theme: changedKeys };
    const newPresets = [...customPresets.filter(p => p.name !== name), newPreset];
    setCustomPresets(newPresets);
    window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
    setSavedThemeState(theme);
  }, [theme, customPresets]);

  const deletePreset = useCallback((name: string) => {
    const newPresets = customPresets.filter(p => p.name !== name);
    setCustomPresets(newPresets);
    window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
  }, [customPresets]);
  
  const fixContrast = useCallback((keyToFix: keyof ThemeVariables, backgroundColor: string, candidateTokens: string[]) => {
    const bestToken = findBestContrastColor(backgroundColor, theme, candidateTokens);
    if(bestToken) updateTheme(keyToFix, bestToken);
  }, [theme, updateTheme]);

  const generateJson = useCallback(() => JSON.stringify(theme, null, 2), [theme]);
  
  const generateCss = useCallback((options: { mode: 'diff' | 'all' | 'full', exclude: Set<string> } = { mode: 'diff', exclude: new Set() }) => {
    const { mode, exclude } = options;
    if (!staticCss && mode === 'full') return '/* Loading... */';

    const lightVars: string[] = [];
    const darkVars: string[] = [];
    const includeAll = mode !== 'diff';

    (Object.keys(DEFAULT_THEME_PRIMITIVES) as Array<keyof typeof DEFAULT_THEME_PRIMITIVES>).forEach(key => {
        if (includeAll || theme[key] !== DEFAULT_THEME[key]) {
            lightVars.push(`  ${String(key)}: ${theme[key]};`);
        }
    });

    (Object.keys(SEMANTIC_MAPPINGS) as Array<keyof typeof SEMANTIC_MAPPINGS>).forEach(baseKey => {
        const lightKey = `${baseKey}-light` as keyof ThemeVariables;
        const darkKey = `${baseKey}-dark` as keyof ThemeVariables;
        if (includeAll || theme[lightKey] !== DEFAULT_THEME[lightKey]) lightVars.push(`  ${baseKey}: ${theme[lightKey]};`);
        if (includeAll || theme[darkKey] !== DEFAULT_THEME[darkKey]) darkVars.push(`  ${baseKey}: ${theme[darkKey]};`);
    });
    
    if (lightVars.length === 0 && darkVars.length === 0 && mode === 'diff') return '/* No changes. */';

    let cssString = '';
    if (mode === 'full' && staticCss) {
        let outputCss = staticCss;
        outputCss = outputCss.replace(/\/\* \[VARS:ROOT:START\] \*\/[\s\S]*?\/\* \[VARS:ROOT:END\] \*\//, `/* [VARS:ROOT:START] */\n:root {\n${lightVars.join('\n')}\n}\n/* [VARS:ROOT:END] */`);
        outputCss = outputCss.replace(/\/\* \[VARS:DARK:START\] \*\/[\s\S]*?\/\* \[VARS:DARK:END\] \*\//, `/* [VARS:DARK:START] */\n.dark {\n${darkVars.join('\n')}\n}\n/* [VARS:DARK:END] */`);
        exclude.forEach(id => {
            const regex = new RegExp(`\\/\\* \\[COMPONENT:${id}:START\\] \\*\\/[\\s\S]*?\\/\\* \\[COMPONENT:${id}:END\\] \\*\\/`, 'g');
            outputCss = outputCss.replace(regex, `/* [COMPONENT:${id}] EXCLUDED */`);
        });
        return outputCss;
    }

    if (lightVars.length > 0) cssString += `:root {\n${lightVars.join('\n')}\n}\n`;
    if (darkVars.length > 0) {
        if (cssString) cssString += '\n';
        cssString += `.dark {\n${darkVars.join('\n')}\n}\n`;
    }
    return cssString;
  }, [theme, staticCss]);
  
  return { theme, updateTheme, generateCss, generateJson, resetTheme, hasChanges, customPresets, savePreset, deletePreset, applyPreset, fixContrast };
};