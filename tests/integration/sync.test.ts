import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Theme Synchronization', () => {
  const useThemePath = path.join(process.cwd(), 'hooks/useTheme.ts');
  const customizerPath = path.join(process.cwd(), 'components/ThemeCustomizer.tsx');
  const indexHtmlPath = path.join(process.cwd(), 'index.html');


  function beforeAll(arg0: () => void) {
      throw new Error('Function not implemented.');
  }

  let useThemeContent: string;
  let customizerContent: string;
  let indexHtmlContent: string;

  beforeAll(() => {
    useThemeContent = fs.readFileSync(useThemePath, 'utf8');
    customizerContent = fs.readFileSync(customizerPath, 'utf8');
    indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  });

  describe('Variable Declaration', () => {
    it('should have all link variables declared in useTheme.ts', () => {
      const primitivesMatch = useThemeContent.match(/const DEFAULT_THEME_PRIMITIVES[^=]*=\s*{([^}]+})+/s);
      const semanticsMatch = useThemeContent.match(/export const SEMANTIC_MAPPINGS[^=]*=\s*{([^}]+})+/s);

      expect(primitivesMatch).toBeTruthy();
      expect(semanticsMatch).toBeTruthy();

      const primitives = primitivesMatch![0];
      const semantics = semanticsMatch![0];

      // Link text decoration primitives
      expect(primitives).toContain("'--link-text-decoration'");
      expect(primitives).toContain("'--link-text-underline-offset'");
      expect(primitives).toContain("'--link-font-weight'");

      // Link color semantics
      expect(semantics).toContain("'--link-color'");
      expect(semantics).toContain("'--link-hover-color'");
      expect(semantics).toContain("'--link-text-decoration-color'");

      // Variant semantics
      expect(semantics).toContain("'--retro-link-color'");
      expect(semantics).toContain("'--modern-link-color'");
      expect(semantics).toContain("'--futuristic-link-color'");
    });

    it('should have matching controls in ThemeCustomizer.tsx', () => {
      const linkSection = customizerContent.match(/name: "Link"[\s\S]*?\/\/ --- CARD COMPONENT ---/);
      expect(linkSection).toBeTruthy();

      const section = linkSection![0];

      // Check for Initial controls
      expect(section).toContain("id: '--link-text-decoration'");
      expect(section).toContain("id: '--link-color'");
      expect(section).toContain("id: '--link-hover-color'");

      // Check for Retro controls
      expect(section).toContain("id: '--retro-link-border-width'");
      expect(section).toContain("id: '--retro-link-color'");

      // Check for Modern controls
      expect(section).toContain("id: '--modern-link-underline-height'");
      expect(section).toContain("id: '--modern-link-color'");

      // Check for Futuristic controls
      expect(section).toContain("id: '--futuristic-link-letter-spacing'");
      expect(section).toContain("id: '--futuristic-link-color'");
    });

    it('should use all link variables in CSS', () => {
      // Check for variable usage in CSS
      expect(indexHtmlContent).toContain('var(--link-color)');
      expect(indexHtmlContent).toContain('var(--link-text-decoration)');
      expect(indexHtmlContent).toContain('var(--link-hover-color)');
      
      expect(indexHtmlContent).toContain('var(--retro-link-color)');
      expect(indexHtmlContent).toContain('var(--retro-link-border-width)');
      
      expect(indexHtmlContent).toContain('var(--modern-link-color)');
      expect(indexHtmlContent).toContain('var(--modern-link-underline-height)');
      
      expect(indexHtmlContent).toContain('var(--futuristic-link-color)');
      expect(indexHtmlContent).toContain('var(--futuristic-link-letter-spacing)');
    });
  });

  describe('Link Button Variables', () => {
    it('should have all link button variables declared', () => {
      const primitivesMatch = useThemeContent.match(/const DEFAULT_THEME_PRIMITIVES[^=]*=\s*{([^}]+})+/s);
      const primitives = primitivesMatch![0];

      // Initial button structure
      expect(primitives).toContain("'--link-button-padding-y'");
      expect(primitives).toContain("'--link-button-font-size'");
      expect(primitives).toContain("'--link-button-border-radius'");

      // Variant structures
      expect(primitives).toContain("'--retro-link-button-border-width'");
      expect(primitives).toContain("'--modern-link-button-radius'");
      expect(primitives).toContain("'--futuristic-link-button-clip-path'");
    });

    it('should have link button controls in customizer', () => {
      const linkSection = customizerContent.match(/name: "Link"[\s\S]*?\/\/ --- CARD COMPONENT ---/);
      const section = linkSection![0];

      // Check for Button Styles section
      expect(section).toContain('name: "Button Styles"');

      // Initial button controls
      expect(section).toContain("id: '--link-button-padding-y'");
      expect(section).toContain("id: '--link-button-font-size'");
      
      // Variant button controls
      expect(section).toContain("id: '--retro-link-button-border-width'");
      expect(section).toContain("id: '--modern-link-button-radius'");
      expect(section).toContain("id: '--futuristic-link-button-clip-path'");
    });

    it('should use link button variables in CSS', () => {
      expect(indexHtmlContent).toContain('a.button');
      expect(indexHtmlContent).toContain('var(--link-button-padding-y)');
      expect(indexHtmlContent).toContain('var(--link-button-font-size)');
      
      expect(indexHtmlContent).toContain('a.button.retro');
      expect(indexHtmlContent).toContain('var(--retro-link-button-border-width)');
      
      expect(indexHtmlContent).toContain('a.button.modern');
      expect(indexHtmlContent).toContain('var(--modern-link-button-radius)');
      
      expect(indexHtmlContent).toContain('a.button.futuristic');
      expect(indexHtmlContent).toContain('var(--futuristic-link-button-clip-path)');
    });
  });

  describe('Comprehensive Synchronization', () => {
    it('should have every ThemeCustomizer control variable declared in useTheme', () => {
      const linkSection = customizerContent.match(/name: "Link"[\s\S]*?\/\/ --- CARD COMPONENT ---/);
      const allControls = [...linkSection![0].matchAll(/id: '(--[^']+)'/g)].map(m => m[1]);
      const linkControls = allControls.filter(v => v.includes('link'));

      const primitivesMatch = useThemeContent.match(/const DEFAULT_THEME_PRIMITIVES[^=]*=\s*{([^}]+})+/s);
      const semanticsMatch = useThemeContent.match(/export const SEMANTIC_MAPPINGS[^=]*=\s*{([^}]+})+/s);
      
      const allPrimitiveVars = [...primitivesMatch![0].matchAll(/'(--[^']+)':/g)].map(m => m[1]);
      const allSemanticVars = [...semanticsMatch![0].matchAll(/'(--[^']+)':/g)].map(m => m[1]);
      const allVars = [...new Set([...allPrimitiveVars, ...allSemanticVars])];

      const missing = linkControls.filter(c => !allVars.includes(c));
      
      expect(missing).toEqual([]);
    });

    it('should have CSS rules for all link variants', () => {
      const variants = ['retro', 'modern', 'futuristic'];
      
      variants.forEach(variant => {
        // Text link variants
        expect(indexHtmlContent).toContain(`a.link-${variant}`);
        
        // Button link variants
        expect(indexHtmlContent).toContain(`a.button.${variant}`);
      });
    });

    it('should have proper structure sections in customizer', () => {
      const linkSection = customizerContent.match(/name: "Link"[\s\S]*?\/\/ --- CARD COMPONENT ---/);
      const section = linkSection![0];

      // Check for main sections
      expect(section).toContain('name: "Link Styles"');
      expect(section).toContain('name: "Button Styles"');

      // Check for variant subsections
      expect(section).toContain('name: "Initial"');
      expect(section).toContain('name: "Retro"');
      expect(section).toContain('name: "Modern"');
      expect(section).toContain('name: "Futuristic"');

      // Check for property subsections
      expect(section).toContain('name: "Structure"');
      expect(section).toContain('name: "Colors"');
      expect(section).toContain('name: "States"');
    });
  });
});


