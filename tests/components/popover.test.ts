import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Popover Component - Exhaustive Tests', () => {
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
    const popoverVars = [
      '--popover-bg',
      '--popover-border-color',
      '--popover-border-width',
      '--popover-border-radius',
      '--popover-padding',
      '--popover-shadow',
    ];

    popoverVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial popover CSS', () => {
      expect(indexHtmlContent).toMatch(/\.popover/);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro popover CSS', () => {
      expect(indexHtmlContent).toMatch(/\.popover\.retro/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern popover CSS', () => {
      expect(indexHtmlContent).toMatch(/\.popover\.modern/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic popover CSS', () => {
      expect(indexHtmlContent).toMatch(/\.popover\.futuristic/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Popover section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Popover["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have popover showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-popover["']/);
    });
  });

  describe('CSS Export', () => {
    it('should have popover export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:popover:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:popover:END]');
    });
  });
});
