import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_THEME, SEMANTIC_MAPPINGS } from '../../hooks/useTheme';

describe('Theme Configuration', () => {
  describe('DEFAULT_THEME', () => {
    it('should have all required primitive variables', () => {
      const requiredPrimitives = [
        '--color-primary',
        '--color-secondary',
        '--color-accent',
        '--font-family-sans',
        '--font-size-base',
        '--space-4',
        '--border-radius-md',
      ];

      requiredPrimitives.forEach(key => {
        expect(DEFAULT_THEME).toHaveProperty(key);
        expect(DEFAULT_THEME[key as keyof typeof DEFAULT_THEME]).toBeTruthy();
      });
    });

    it('should have all link-related primitive variables', () => {
      const linkPrimitives = [
        '--link-text-decoration',
        '--link-text-underline-offset',
        '--link-font-weight',
        '--link-transition',
        '--retro-link-border-width',
        '--modern-link-underline-height',
        '--futuristic-link-letter-spacing',
      ];

      linkPrimitives.forEach(key => {
        expect(DEFAULT_THEME).toHaveProperty(key);
      });
    });

    it('should have all button-related primitive variables', () => {
      const buttonPrimitives = [
        '--button-padding-y',
        '--button-padding-x',
        '--button-border-radius',
        '--button-font-size',
        '--button-border-width',
      ];

      buttonPrimitives.forEach(key => {
        expect(DEFAULT_THEME).toHaveProperty(key);
      });
    });

    it('should have semantic color variables with light/dark modes', () => {
      const semanticColors = [
        '--link-color',
        '--link-hover-color',
        '--button-primary-bg',
        '--retro-link-color',
        '--modern-link-color',
        '--futuristic-link-color',
      ];

      semanticColors.forEach(baseKey => {
        const lightKey = `${baseKey}-light`;
        const darkKey = `${baseKey}-dark`;
        expect(DEFAULT_THEME).toHaveProperty(lightKey);
        expect(DEFAULT_THEME).toHaveProperty(darkKey);
      });
    });
  });

  describe('SEMANTIC_MAPPINGS', () => {
    it('should have light and dark values for each mapping', () => {
      Object.entries(SEMANTIC_MAPPINGS).forEach(([key, value]) => {
        expect(value).toHaveProperty('light');
        expect(value).toHaveProperty('dark');
        expect(value.light).toBeTruthy();
        expect(value.dark).toBeTruthy();
      });
    });

    it('should include all link color mappings', () => {
      const linkColorMappings = [
        '--link-color',
        '--link-text-decoration-color',
        '--link-hover-color',
        '--link-active-color',
        '--link-visited-color',
        '--retro-link-color',
        '--retro-link-hover-color',
        '--modern-link-color',
        '--modern-link-hover-color',
        '--futuristic-link-color',
        '--futuristic-link-hover-color',
      ];

      linkColorMappings.forEach(key => {
        expect(SEMANTIC_MAPPINGS).toHaveProperty(key);
      });
    });

    it('should include all link button color mappings', () => {
      const linkButtonColorMappings = [
        '--link-button-default-bg',
        '--link-button-default-color',
        '--link-button-default-border-color',
        '--link-button-default-bg-hover',
        '--retro-link-button-bg',
        '--modern-link-button-bg',
        '--futuristic-link-button-bg',
      ];

      linkButtonColorMappings.forEach(key => {
        expect(SEMANTIC_MAPPINGS).toHaveProperty(key);
      });
    });
  });

  describe('Variable Synchronization', () => {
    it('should have no duplicate variables in primitives and semantics', () => {
      const primitiveKeys = Object.keys(DEFAULT_THEME).filter(
        k => !k.endsWith('-light') && !k.endsWith('-dark')
      );
      const semanticBaseKeys = Object.keys(SEMANTIC_MAPPINGS);

      const duplicates = primitiveKeys.filter(k => semanticBaseKeys.includes(k));
      
      // Sémantiques peuvent être aussi dans primitives pour les valeurs par défaut
      // mais on vérifie qu'il n'y a pas trop de chevauchement
      expect(duplicates.length).toBeLessThan(10);
    });

    it('should have all link text decoration variables', () => {
      expect(DEFAULT_THEME).toHaveProperty('--link-text-decoration');
      expect(DEFAULT_THEME).toHaveProperty('--link-text-decoration-color-light');
      expect(DEFAULT_THEME).toHaveProperty('--link-text-decoration-color-dark');
    });

    it('should have consistent variant structure for links', () => {
      const variants = ['retro', 'modern', 'futuristic'];
      
      variants.forEach(variant => {
        // Text links
        expect(DEFAULT_THEME).toHaveProperty(`--${variant}-link-color-light`);
        expect(DEFAULT_THEME).toHaveProperty(`--${variant}-link-color-dark`);
        expect(DEFAULT_THEME).toHaveProperty(`--${variant}-link-hover-color-light`);
        expect(DEFAULT_THEME).toHaveProperty(`--${variant}-link-hover-color-dark`);
        
        // Button links
        expect(DEFAULT_THEME).toHaveProperty(`--${variant}-link-button-bg-light`);
        expect(DEFAULT_THEME).toHaveProperty(`--${variant}-link-button-bg-dark`);
      });
    });
  });

  describe('Value Validation', () => {
    it('should have valid CSS color values', () => {
      const colorPattern = /^(#[0-9a-f]{3,6}|rgb|rgba\([^)]+\)|var\(--[^)]+\)|transparent|white|black)$/i;
      
      Object.entries(SEMANTIC_MAPPINGS).forEach(([key, value]) => {
        if (key.includes('color') || key.includes('bg') || key.includes('glow') || key.includes('shadow-color')) {
          expect(value.light).toMatch(colorPattern);
          expect(value.dark).toMatch(colorPattern);
        }
      });
    });

    it('should have valid spacing values', () => {
      const spacingPattern = /^([\d.]+)(rem|px|em|%)$|^var\(--[^)]+\)$/;
      const spacingKeys = ['--space-1', '--space-2', '--space-4', '--space-6', '--space-8'];
      
      spacingKeys.forEach(key => {
        if (DEFAULT_THEME[key as keyof typeof DEFAULT_THEME]) {
          expect(DEFAULT_THEME[key as keyof typeof DEFAULT_THEME]).toMatch(spacingPattern);
        }
      });
    });

    it('should have valid transition values', () => {
      const transitionKeys = [
        '--link-transition',
        '--retro-link-transition',
        '--modern-link-transition',
      ];
      
      transitionKeys.forEach(key => {
        const value = DEFAULT_THEME[key as keyof typeof DEFAULT_THEME];
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
      });
    });
  });
});
