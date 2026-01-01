import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tabs Component - Exhaustive Tests', () => {
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
    const tabsVars = [
      '--tabs-border-color',
      '--tab-padding',
      '--tab-bg',
      '--tab-color',
      '--tab-active-bg',
      '--tab-active-color',
      '--tab-hover-bg',
    ];

    tabsVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial tabs CSS', () => {
      expect(indexHtmlContent).toMatch(/\.tabs/);
    });

    it('should have active state', () => {
      expect(indexHtmlContent).toMatch(/\.tab\.active|\.tab\[aria-selected=["']true["']\]/i);
    });

    it('should have hover state', () => {
      expect(indexHtmlContent).toMatch(/\.tab:hover/i);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro tabs CSS', () => {
      expect(indexHtmlContent).toMatch(/\.tabs\.retro|\.retro.*\.tabs/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern tabs CSS', () => {
      expect(indexHtmlContent).toMatch(/\.tabs\.modern|\.modern.*\.tabs/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic tabs CSS', () => {
      expect(indexHtmlContent).toMatch(/\.tabs\.futuristic|\.futuristic.*\.tabs/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Tabs section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Tabs["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have tabs showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-tabs["']/);
    });
  });

  describe('CSS Export', () => {
    it('should have tabs export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:tabs:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:tabs:END]');
    });
  });
});
