import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Avatar Component - Exhaustive Tests', () => {
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
    const avatarVars = [
      '--avatar-size',
      '--avatar-border-radius',
      '--avatar-border-width',
      '--avatar-border-color',
      '--avatar-bg',
    ];

    avatarVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial avatar CSS', () => {
      expect(indexHtmlContent).toMatch(/\.avatar\s*\{/);
    });
  });

  describe('Variants - Retro', () => {
    it('should have retro avatar CSS', () => {
      expect(indexHtmlContent).toMatch(/\.avatar\.retro/i);
    });
  });

  describe('Variants - Modern', () => {
    it('should have modern avatar CSS', () => {
      expect(indexHtmlContent).toMatch(/\.avatar\.modern/i);
    });
  });

  describe('Variants - Futuristic', () => {
    it('should have futuristic avatar CSS', () => {
      expect(indexHtmlContent).toMatch(/\.avatar\.futuristic/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Avatar section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Avatar["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have avatar showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-avatar["']/);
    });
  });

  describe('CSS Export', () => {
    it('should have avatar export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:avatar:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:avatar:END]');
    });
  });
});
