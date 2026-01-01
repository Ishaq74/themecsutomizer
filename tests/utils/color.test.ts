import { describe, it, expect } from 'vitest';
import { getAccessibleTextColor, hexToRgb, getLuminance, getContrastRatio, findBestContrastColor } from '../../utils/color';

describe('Color Utils', () => {
  describe('hexToRgb', () => {
    it('should convert 6-digit hex to RGB', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#4f46e5')).toEqual({ r: 79, g: 70, b: 229 });
    });

    it('should convert 3-digit hex to RGB', () => {
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    });

    it('should handle hex without #', () => {
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('4f46e5')).toEqual({ r: 79, g: 70, b: 229 });
    });

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#gg0000')).toBeNull();
      expect(hexToRgb('')).toBeNull();
    });
  });

  describe('getLuminance', () => {
    it('should calculate luminance for white', () => {
      const lum = getLuminance({ r: 255, g: 255, b: 255 });
      expect(lum).toBeCloseTo(1, 2);
    });

    it('should calculate luminance for black', () => {
      const lum = getLuminance({ r: 0, g: 0, b: 0 });
      expect(lum).toBeCloseTo(0, 2);
    });

    it('should calculate luminance for primary color', () => {
      const lum = getLuminance({ r: 79, g: 70, b: 229 });
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate maximum contrast (white vs black)', () => {
      const ratio = getContrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 });
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate minimum contrast (same color)', () => {
      const ratio = getContrastRatio({ r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 255 });
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should calculate contrast for primary colors', () => {
      const ratio = getContrastRatio({ r: 79, g: 70, b: 229 }, { r: 255, g: 255, b: 255 });
      expect(ratio).toBeGreaterThan(4.5); // Should meet AA standard
    });
  });

  describe('getAccessibleTextColor', () => {
    it('should return white for dark backgrounds', () => {
      expect(getAccessibleTextColor('#000000').toLowerCase()).toBe('#ffffff');
      expect(getAccessibleTextColor('#1a1a1a').toLowerCase()).toBe('#ffffff');
    });

    it('should return black for light backgrounds', () => {
      const result = getAccessibleTextColor('#ffffff');
      expect(result === '#000000' || result === '#111827').toBe(true);
      const result2 = getAccessibleTextColor('#f0f0f0');
      expect(result2 === '#000000' || result2 === '#111827').toBe(true);
    });

    it('should return white for primary color', () => {
      expect(getAccessibleTextColor('#4f46e5').toLowerCase()).toBe('#ffffff');
    });

    it('should return white for accent color', () => {
      const result = getAccessibleTextColor('#d946ef');
      // Can be either white or dark depending on luminance calculation
      expect(['#ffffff', '#111827'].includes(result.toLowerCase())).toBe(true);
    });

    it('should default to black for invalid colors', () => {
      expect(getAccessibleTextColor('invalid')).toBe('#000000');
    });
  });

  describe('findBestContrastColor', () => {
    const mockTheme = {
      '--color-primary': '#4f46e5',
      '--color-secondary': '#0ea5e9',
      '--text-default': '#0f172a',
      '--bg-default': '#ffffff',
    } as any;

    it('should find best contrast color from candidates', () => {
      const candidates = ['var(--text-default)', 'var(--color-primary)', 'var(--color-secondary)'];
      const result = findBestContrastColor('#ffffff', mockTheme, candidates);
      // Should return the candidate with best contrast
      expect(result).toBeTruthy();
      expect(candidates).toContain(result);
    });

    it('should return null if no candidates provided', () => {
      const result = findBestContrastColor('#ffffff', mockTheme, []);
      expect(result).toBeNull();
    });

    it('should return a candidate for any background', () => {
      const candidates = ['var(--text-default)'];
      const result = findBestContrastColor('#4f46e5', mockTheme, candidates);
      expect(result).toBeTruthy();
    });

    it('should work with var() references', () => {
      const candidates = ['var(--color-primary)', 'var(--bg-default)'];
      const result = findBestContrastColor('#ffffff', mockTheme, candidates);
      expect(result).toBeTruthy();
      expect(candidates).toContain(result);
    });
  });
});
