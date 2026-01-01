import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Card Component - Exhaustive Tests', () => {
  let useThemeContent: string;
  let customizerContent: string;
  let showcaseContent: string;
  let indexHtmlContent: string;

  beforeAll(() => {
    useThemeContent = fs.readFileSync(path.join(process.cwd(), 'hooks/useTheme.ts'), 'utf8');
    customizerContent = fs.readFileSync(path.join(process.cwd(), 'components/ThemeCustomizer.tsx'), 'utf8');
    showcaseContent = fs.readFileSync(path.join(process.cwd(), 'components/Showcase.tsx'), 'utf8');
    indexHtmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  });

  describe('Variables Declaration', () => {
    const cardVars = [
      '--card-bg',
      '--card-border-color',
      '--card-border-width',
      '--card-border-radius',
      '--card-padding',
      '--card-shadow',
    ];

    cardVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });

      it(`should have ${varName} used in CSS`, () => {
        expect(indexHtmlContent).toContain(`var(${varName})`);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial card CSS', () => {
      expect(indexHtmlContent).toMatch(/\.card\s*\{/);
    });

    it('should use card variables', () => {
      const cardCss = indexHtmlContent.match(/\.card\s*\{[\s\S]*?\}/);
      expect(cardCss![0]).toContain('var(--card-bg)');
      expect(cardCss![0]).toContain('var(--card-border-color)');
    });
  });

  describe('Variants - Retro', () => {
    const retroVars = ['--retro-card-bg', '--retro-card-border-color', '--retro-shadow-offset'];

    retroVars.forEach(varName => {
      it(`should have ${varName} variable`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });

    it('should have retro card CSS', () => {
      expect(indexHtmlContent).toMatch(/\.card\.retro/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern card CSS', () => {
      expect(indexHtmlContent).toMatch(/\.card\.modern/i);
    });

    it('should use modern radius', () => {
      const modernSection = indexHtmlContent.match(/\.card\.modern[\s\S]{0,300}/i);
      expect(modernSection![0]).toMatch(/var\(--modern-radius\)/);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic card CSS', () => {
      expect(indexHtmlContent).toMatch(/\.card\.futuristic/i);
    });

    it('should use clip-path', () => {
      const futuristicSection = indexHtmlContent.match(/\.card\.futuristic[\s\S]{0,300}/i);
      expect(futuristicSection![0]).toMatch(/clip-path/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Card section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Card["']/);
    });

    it('should have Structure controls', () => {
      expect(customizerContent).toMatch(/id:\s*['"]--card-padding['"]/);
      expect(customizerContent).toMatch(/id:\s*['"]--card-border-radius['"]/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have card showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-card["']/);
    });

    it('should demonstrate all variants', () => {
      const cardSection = showcaseContent.match(/id=["']component-card["'][\s\S]*?(?=id=["']component-|$)/i);
      expect(cardSection).toBeTruthy();
      // Check that variants are used
      expect(cardSection![0]).toMatch(/variants\.map|Initial.*Retro.*Modern.*Futuristic/i);
    });
  });

  describe('CSS Export', () => {
    it('should have card export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:card:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:card:END]');
    });

    it('should have complete CSS between markers', () => {
      const cardCss = indexHtmlContent.match(/\/\* \[COMPONENT:card:START\] \*\/([\s\S]*?)\/\* \[COMPONENT:card:END\] \*\//i);
      expect(cardCss).toBeTruthy();
      expect(cardCss![1].trim().length).toBeGreaterThan(50);
    });
  });
});
