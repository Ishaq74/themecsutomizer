import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tooltip Component - Exhaustive Tests', () => {
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
    const tooltipVars = [
      '--tooltip-bg',
      '--tooltip-color',
      '--tooltip-padding',
      '--tooltip-border-radius',
      '--tooltip-font-size',
    ];

    tooltipVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial tooltip CSS', () => {
      expect(indexHtmlContent).toMatch(/\.tooltip/);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro tooltip CSS', () => {
      expect(indexHtmlContent).toMatch(/\.tooltip\.retro/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern tooltip CSS', () => {
      expect(indexHtmlContent).toMatch(/\.tooltip\.modern/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic tooltip CSS', () => {
      expect(indexHtmlContent).toMatch(/\.tooltip\.futuristic/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Tooltip section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Tooltip["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have tooltip showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-tooltip["']/);
    });
  });

  describe('CSS Export', () => {
    it('should have tooltip export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:tooltip:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:tooltip:END]');
    });
  });
});
