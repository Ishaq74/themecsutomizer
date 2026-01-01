import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Toast Component - Exhaustive Tests', () => {
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
    const toastVars = [
      '--toast-bg',
      '--toast-color',
      '--toast-border-radius',
      '--toast-padding',
      '--toast-shadow',
    ];

    toastVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial toast CSS', () => {
      expect(indexHtmlContent).toMatch(/\.toast/);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro toast CSS', () => {
      expect(indexHtmlContent).toMatch(/\.toast\.retro/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern toast CSS', () => {
      expect(indexHtmlContent).toMatch(/\.toast\.modern/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic toast CSS', () => {
      expect(indexHtmlContent).toMatch(/\.toast\.futuristic/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Toast section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Toast["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have toast showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-toast["']/);
    });
  });

  describe('CSS Export', () => {
    it('should have toast export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:toast:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:toast:END]');
    });
  });
});
