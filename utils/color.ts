import { WcagRating, ThemeVariables } from '../types';

/**
 * Converts a hex color string to an RGB object.
 * Supports 3-digit and 6-digit hex codes.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) 
    || /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
  
  if (!result) return null;

  const r = parseInt(result[1].length === 1 ? result[1] + result[1] : result[1], 16);
  const g = parseInt(result[2].length === 1 ? result[2] + result[2] : result[2], 16);
  const b = parseInt(result[3].length === 1 ? result[3] + result[3] : result[3], 16);
  
  return { r, g, b };
}

/**
 * Parses an `rgb(r, g, b)` or `rgba(r, g, b, a)` string.
 */
export function parseRgbString(rgbString: string): { r: number; g: number; b: number; a: number } | null {
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}


/**
 * Calculates the luminance of an RGB color.
 * Formula from WCAG guidelines.
 */
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates the contrast ratio between two RGB colors.
 */
export function getContrastRatio(
  rgb1: { r: number; g: number; b: number }, 
  rgb2: { r: number; g: number; b: number }
): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Determines the WCAG rating based on a contrast ratio.
 * Assumes normal text size.
 */
export function getWcagRating(contrast: number): WcagRating {
  if (contrast >= 7) return 'AAA';
  if (contrast >= 4.5) return 'AA';
  return 'FAIL';
}

/**
 * Traverses up the DOM tree from a given element to find the first
 * non-transparent background color.
 */
export function findEffectiveBackgroundColor(element: HTMLElement): string {
  let current = element;
  while (current) {
    const style = window.getComputedStyle(current);
    const bgColor = style.backgroundColor;
    const parsedColor = parseRgbString(bgColor);
    if (parsedColor && parsedColor.a > 0) {
      return bgColor;
    }
    // If the element is the body or html and has no background, default to white
    if (current.tagName === 'BODY' || current.tagName === 'HTML') {
        return 'rgb(255, 255, 255)';
    }
    current = current.parentElement as HTMLElement;
  }
  return 'rgb(255, 255, 255)'; // Default fallback
}


/**
 * Determines which of two text colors has a better contrast ratio against a given background color.
 * Defaults to checking black vs white if no text colors are provided.
 * @param hexBg - The background color in hex format.
 * @param textColors - Optional object with `light` and `dark` hex color strings to compare.
 * @returns The hex code of the text color with better contrast.
 */
export function getAccessibleTextColor(hexBg: string, textColors?: { light: string; dark: string }): string {
  const bgRgb = hexToRgb(hexBg);
  if (!bgRgb) return '#000000'; // Default to black if conversion fails

  const lightHex = textColors?.light || '#FFFFFF';
  const darkHex = textColors?.dark || '#111827'; // --color-neutral-900

  const lightRgb = hexToRgb(lightHex);
  const darkRgb = hexToRgb(darkHex);

  if (!lightRgb || !darkRgb) {
    return '#000000'; // Fallback if provided text colors are invalid.
  }

  const contrastWithLight = getContrastRatio(bgRgb, lightRgb);
  const contrastWithDark = getContrastRatio(bgRgb, darkRgb);

  return contrastWithLight > contrastWithDark ? lightHex : darkHex;
}

/**
 * Recursively resolves a CSS variable to a plain color value.
 */
function resolveVar(value: string, theme: ThemeVariables, depth = 0): string {
    if (depth > 10 || !value.includes('var(')) return value; // Prevent infinite loops and unnecessary processing
    const match = value.match(/var\((--[\w-]+)\)/);
    if (match) {
        const varName = match[1] as keyof ThemeVariables;
        const resolvedValue = theme[varName];
        if (resolvedValue) {
            return resolveVar(resolvedValue, theme, depth + 1);
        }
    }
    return value; // It's a plain color or unresolved
}

/**
 * Finds the color from a list of candidate tokens that has the best contrast against a background.
 */
export function findBestContrastColor(
    backgroundRgbString: string, 
    theme: ThemeVariables, 
    candidateTokens: string[]
): string | null {
    const bgRgb = parseRgbString(backgroundRgbString);
    if (!bgRgb) return null;

    let bestToken: string | null = null;
    let maxRatio = -1;

    for (const token of candidateTokens) {
        if (token === 'transparent') continue;

        const resolvedColorStr = resolveVar(token, theme);
        const textColorRgb = hexToRgb(resolvedColorStr) || parseRgbString(resolvedColorStr);

        if (textColorRgb) {
            const ratio = getContrastRatio(bgRgb, textColorRgb);
            if (ratio > maxRatio) {
                maxRatio = ratio;
                bestToken = token;
            }
        }
    }
    
    return bestToken;
}
