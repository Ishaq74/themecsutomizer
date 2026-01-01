import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Badge Component - Exhaustive Tests', () => {
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
    const badgeVars = [
      '--badge-padding-y',
      '--badge-padding-x',
      '--badge-border-radius',
      '--badge-font-size',
      '--badge-default-bg',
      '--badge-default-color',
      '--badge-primary-bg',
      '--badge-secondary-bg',
      '--badge-accent-bg',
    ];

    badgeVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial badge CSS', () => {
      expect(indexHtmlContent).toMatch(/\.badge\s*\{/);
    });

    it('should have primary variant', () => {
      expect(indexHtmlContent).toMatch(/\.badge\.primary/i);
    });

    it('should have secondary variant', () => {
      expect(indexHtmlContent).toMatch(/\.badge\.secondary/i);
    });

    it('should have accent variant', () => {
      expect(indexHtmlContent).toMatch(/\.badge\.accent/i);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro badge CSS', () => {
      expect(indexHtmlContent).toMatch(/\.badge\.retro/i);
    });

    it('should have retro primary', () => {
      expect(indexHtmlContent).toMatch(/\.badge\.retro\.primary/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern badge CSS', () => {
      expect(indexHtmlContent).toMatch(/\.badge\.modern/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic badge CSS', () => {
      expect(indexHtmlContent).toMatch(/\.badge\.futuristic/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Badge section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Badge["']/);
    });

    it('should have color controls', () => {
      expect(customizerContent).toMatch(/id:\s*['"]--badge-primary-bg['"]/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have badge showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-badge["']/);
    });
  });

  describe('CSS Export', () => {
    it('should have badge export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:badge:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:badge:END]');
    });
  });
});
