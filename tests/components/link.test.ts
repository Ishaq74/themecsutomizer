import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Link Component - Exhaustive Tests', () => {
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

  describe('Variables Declaration - Text Links', () => {
    const linkTextVars = [
      '--link-font-size',
      '--link-font-weight',
      '--link-text-decoration',
      '--link-text-decoration-thickness',
      '--link-text-decoration-style',
      '--link-color',
      '--link-color-hover',
      '--link-color-active',
      '--link-color-visited',
    ];

    linkTextVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('Variables Declaration - Button Links', () => {
    const linkButtonVars = [
      '--link-button-padding-y',
      '--link-button-padding-x',
      '--link-button-border-radius',
      '--link-button-font-size',
      '--link-button-border-width',
      '--link-button-primary-bg',
      '--link-button-secondary-bg',
      '--link-button-accent-bg',
    ];

    linkButtonVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Link section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Link["']/);
    });

    it('should have "Link Styles" category', () => {
      const linkSection = customizerContent.match(/name:\s*["']Link["'][\s\S]*?(?=name:\s*["'][A-Z])/i);
      expect(linkSection![0]).toMatch(/name:\s*["']Link Styles["']/);
    });

    it('should have "Button Styles" category', () => {
      const linkSection = customizerContent.match(/name:\s*["']Link["'][\s\S]*?(?=\/\/ ---)/i);
      expect(linkSection![0]).toMatch(/name:\s*["']Button Styles["']/);
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have link showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-link["']/);
    });

    it('should demonstrate text links', () => {
      const linkSection = showcaseContent.match(/id=["']component-link["'][\s\S]*?(?=<div className=["']card["'].*?id=|$)/i);
      expect(linkSection).toBeTruthy();
      expect(linkSection![0]).toMatch(/<a[^>]*>.*?<\/a>/);
    });
  });

  describe('CSS Export', () => {
    it('should have link export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:link:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:link:END]');
    });

    it('should have complete CSS between markers', () => {
      const linkCss = indexHtmlContent.match(/\/\* \[COMPONENT:link:START\] \*\/([\s\S]*?)\/\* \[COMPONENT:link:END\] \*\//i);
      expect(linkCss).toBeTruthy();
      expect(linkCss![1].trim().length).toBeGreaterThan(200);
    });
  });
});
