import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Table Component - Exhaustive Tests', () => {
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
    const tableVars = [
      '--table-border-color',
      '--table-header-bg',
      '--table-header-color',
      '--table-row-bg',
      '--table-row-hover-bg',
      '--table-cell-padding',
    ];

    tableVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial table CSS', () => {
      expect(indexHtmlContent).toMatch(/table\s*\{/);
    });

    it('should have thead styling', () => {
      expect(indexHtmlContent).toMatch(/thead/i);
    });

    it('should have tbody styling', () => {
      expect(indexHtmlContent).toMatch(/tbody/i);
    });

    it('should have hover state', () => {
      expect(indexHtmlContent).toMatch(/tr:hover|tbody tr:hover/i);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro table CSS', () => {
      expect(indexHtmlContent).toMatch(/table\.retro/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern table CSS', () => {
      expect(indexHtmlContent).toMatch(/table\.modern/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic table CSS', () => {
      expect(indexHtmlContent).toMatch(/table\.futuristic/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Table section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Table["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have table showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-table["']/);
    });

    it('should demonstrate actual table element', () => {
      const tableSection = showcaseContent.match(/id=["']component-table["'][\s\S]*?(?=<div className=["']card["'].*?id=|$)/i);
      expect(tableSection![0]).toMatch(/<table/i);
    });
  });

  describe('CSS Export', () => {
    it('should have table export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:table:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:table:END]');
    });
  });
});
