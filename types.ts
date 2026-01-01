


export type WcagRating = 'AAA' | 'AA' | 'FAIL';

export type ThemeVariables = Record<string, string>;

export type ConfigurableThemeVariable = keyof ThemeVariables;

export interface SavedPreset {
  name: string;
  theme: Partial<ThemeVariables>;
}

export interface ThemeConfig {
  id: string;
  label: string;
  type: 'color' | 'range' | 'text' | 'select';
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string; label: string }[];
  contrastFixerKey?: string;
  purpose?: 'color' | string;
}

export interface ThemeConfigSection {
  name: string;
  description?: string;
  configs?: ThemeConfig[];
  subsections?: ThemeConfigSection[];
  id?: string;
  scrollToId?: string;
}

export interface ThemeConfigCategory extends ThemeConfigSection {
  id?: string;
  scrollToId?: string;
}

export interface AccessibilityResult {
  rating: WcagRating;
  categoryKey: string;
  backgroundColor?: string;
}