import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Pagination Component - Exhaustive Tests', () => {
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
    const paginationVars = [
      '--pagination-item-bg',
      '--pagination-item-color',
      '--pagination-item-border',
      '--pagination-item-hover-bg',
      '--pagination-active-bg',
      '--pagination-active-color',
    ];

    paginationVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial pagination CSS', () => {
      expect(indexHtmlContent).toMatch(/\.pagination/);
    });

    it('should have active state', () => {
      expect(indexHtmlContent).toMatch(/\.pagination.*\.active|\.active.*pagination/i);
    });

    it('should have hover state', () => {
      expect(indexHtmlContent).toMatch(/\.pagination.*:hover/i);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro pagination CSS', () => {
      expect(indexHtmlContent).toMatch(/\.pagination\.retro/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern pagination CSS', () => {
      expect(indexHtmlContent).toMatch(/\.pagination\.modern/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic pagination CSS', () => {
      expect(indexHtmlContent).toMatch(/\.pagination\.futuristic/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Pagination section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Pagination["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have pagination showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-pagination["']/);
    });
  });

  describe('CSS Export', () => {
    it('should have pagination export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:pagination:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:pagination:END]');
    });
  });
});
