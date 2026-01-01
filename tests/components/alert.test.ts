import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Alert Component - Exhaustive Tests', () => {
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
    const alertVars = [
      '--alert-padding',
      '--alert-border-width',
      '--alert-border-radius',
      '--alert-info-bg',
      '--alert-info-border',
      '--alert-info-color',
      '--alert-success-bg',
      '--alert-warning-bg',
      '--alert-error-bg',
    ];

    alertVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Alert Types', () => {
    it('should have info alert CSS', () => {
      expect(indexHtmlContent).toMatch(/\.alert\.info/i);
    });

    it('should have success alert CSS', () => {
      expect(indexHtmlContent).toMatch(/\.alert\.success/i);
    });

    it('should have warning alert CSS', () => {
      expect(indexHtmlContent).toMatch(/\.alert\.warning/i);
    });

    it('should have error alert CSS', () => {
      expect(indexHtmlContent).toMatch(/\.alert\.error/i);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro alert CSS', () => {
      expect(indexHtmlContent).toMatch(/\.alert\.retro/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern alert CSS', () => {
      expect(indexHtmlContent).toMatch(/\.alert\.modern/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic alert CSS', () => {
      expect(indexHtmlContent).toMatch(/\.alert\.futuristic/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Alert section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Alert["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have alert showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-alert["']/);
    });
  });

  describe('CSS Export', () => {
    it('should have alert export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:alert:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:alert:END]');
    });
  });
});
