import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Button Component - Exhaustive Tests', () => {
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
    const buttonVars = [
      '--button-padding-y',
      '--button-padding-x',
      '--button-border-radius',
      '--button-font-size',
      '--button-border-width',
      '--button-default-bg',
      '--button-default-color',
      '--button-primary-bg',
      '--button-secondary-bg',
      '--button-accent-bg',
    ];

    buttonVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });

      it(`should have ${varName} used in CSS`, () => {
        expect(indexHtmlContent).toContain(`var(${varName})`);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial button CSS', () => {
      expect(indexHtmlContent).toMatch(/button\s*\{/);
    });

    it('should have initial primary button', () => {
      expect(indexHtmlContent).toMatch(/button\.primary/i);
    });

    it('should have initial secondary button', () => {
      expect(indexHtmlContent).toMatch(/button\.secondary/i);
    });

    it('should have initial accent button', () => {
      expect(indexHtmlContent).toMatch(/button\.accent/i);
    });

    it('should have initial hover state', () => {
      expect(indexHtmlContent).toMatch(/button:hover/i);
    });

    it('should have initial disabled state', () => {
      expect(indexHtmlContent).toMatch(/button:disabled|button\[disabled\]/i);
    });
  });

  describe('Variants - Retro', () => {
    const retroVars = [
      '--retro-button-bg',
      '--retro-button-color',
      '--retro-button-border-color',
      '--retro-button-hover-bg',
      '--retro-border-width',
      '--retro-shadow-offset',
    ];

    retroVars.forEach(varName => {
      it(`should have ${varName} variable`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });

    it('should have retro button CSS', () => {
      expect(indexHtmlContent).toMatch(/button\.retro/i);
    });

    it('should have retro primary variant', () => {
      expect(indexHtmlContent).toMatch(/button\.retro\.primary/i);
    });

    it('should have retro secondary variant', () => {
      expect(indexHtmlContent).toMatch(/button\.retro\.secondary/i);
    });

    it('should have retro accent variant', () => {
      expect(indexHtmlContent).toMatch(/button\.retro\.accent/i);
    });

    it('should have retro hover state', () => {
      expect(indexHtmlContent).toMatch(/button\.retro:hover/i);
    });

    it('should use retro shadow', () => {
      expect(indexHtmlContent).toMatch(/var\(--retro-shadow-offset\)/i);
    });
  });

  describe('Variants - Modern', () => {
    const modernVars = [
      '--modern-button-bg',
      '--modern-button-color',
      '--modern-radius',
      '--modern-button-hover-shadow',
    ];

    modernVars.forEach(varName => {
      it(`should have ${varName} variable`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });

    it('should have modern button CSS', () => {
      expect(indexHtmlContent).toMatch(/button\.modern/i);
    });

    it('should have modern primary variant', () => {
      expect(indexHtmlContent).toMatch(/button\.modern\.primary/i);
    });

    it('should have modern hover shadow', () => {
      expect(indexHtmlContent).toMatch(/var\(--modern-button-hover-shadow\)/i);
    });
  });

  describe('Variants - Futuristic', () => {
    const futuristicVars = [
      '--futuristic-button-bg',
      '--futuristic-button-color',
      '--futuristic-clip-path',
      '--futuristic-button-hover-glow',
    ];

    futuristicVars.forEach(varName => {
      it(`should have ${varName} variable`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });

    it('should have futuristic button CSS', () => {
      expect(indexHtmlContent).toMatch(/button\.futuristic/i);
    });

    it('should use clip-path', () => {
      expect(indexHtmlContent).toMatch(/clip-path:\s*var\(--futuristic-clip-path\)/i);
    });

    it('should have futuristic glow on hover', () => {
      expect(indexHtmlContent).toMatch(/button\.futuristic:hover[\s\S]*?var\(--futuristic-button-hover-glow\)/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Button section', () => {
      expect(customizerContent).toMatch(/name:\s*"Button"/);
    });

    it('should have Initial subsection', () => {
      const buttonSection = customizerContent.match(/name:\s*"Button"[\s\S]*?(?=name:\s*"(?!Initial|Retro|Modern|Futuristic)[A-Z])/i);
      expect(buttonSection).toBeTruthy();
      expect(buttonSection![0]).toMatch(/name:\s*"Initial"/);
    });

    it('should have Structure controls', () => {
      expect(customizerContent).toMatch(/id:\s*'--button-padding-y'/);
      expect(customizerContent).toMatch(/id:\s*'--button-border-radius'/);
    });

    it('should have Colors controls', () => {
      expect(customizerContent).toMatch(/id:\s*'--button-default-bg'/);
      expect(customizerContent).toMatch(/id:\s*'--button-primary-bg'/);
    });

    it('should have States controls', () => {
      expect(customizerContent).toMatch(/id:\s*'--button-default-bg-hover'/);
    });

    ['Retro', 'Modern', 'Futuristic'].forEach(variant => {
      it(`should have ${variant} subsection`, () => {
        const buttonSection = customizerContent.match(/name:\s*"Button"[\s\S]*?(?=\/\/ ---)/i);
        expect(buttonSection![0]).toMatch(new RegExp(`name:\\s*"${variant}"`));
      });
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have button showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-button["']/);
    });

    it('should demonstrate all variants', () => {
      const buttonSection = showcaseContent.match(/id=["']component-button["'][\s\S]*?(?=id=["']component-|$)/i);
      expect(buttonSection).toBeTruthy();
      
      // Check that variants array is used and mapped
      expect(buttonSection![0]).toMatch(/variants\.map/i);
      expect(buttonSection![0]).toMatch(/v\.className/i);
      expect(buttonSection![0]).toMatch(/v\.name/i);
    });

    it('should demonstrate color types', () => {
      const buttonSection = showcaseContent.match(/id=["']component-button["'][\s\S]*?(?=<div className=["']card["']|$)/i);
      
      expect(buttonSection![0]).toMatch(/primary/i);
      expect(buttonSection![0]).toMatch(/secondary/i);
      expect(buttonSection![0]).toMatch(/accent/i);
    });

    it('should show buttons in a table or grid', () => {
      const buttonSection = showcaseContent.match(/id=["']component-button["'][\s\S]*?(?=<div className=["']card["']|$)/i);
      
      const hasTableOrGrid = /<table/i.test(buttonSection![0]) || /grid/i.test(buttonSection![0]);
      expect(hasTableOrGrid).toBe(true);
    });
  });

  describe('CSS Export', () => {
    it('should have button export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:button:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:button:END]');
    });

    it('should have complete CSS between markers', () => {
      const buttonCss = indexHtmlContent.match(/\/\* \[COMPONENT:button:START\] \*\/([\s\S]*?)\/\* \[COMPONENT:button:END\] \*\//i);
      expect(buttonCss).toBeTruthy();
      expect(buttonCss![1].trim().length).toBeGreaterThan(100);
    });

    it('should include all variants in export', () => {
      const buttonCss = indexHtmlContent.match(/\/\* \[COMPONENT:button:START\] \*\/([\s\S]*?)\/\* \[COMPONENT:button:END\] \*\//i);
      
      expect(buttonCss![1]).toMatch(/button\.retro/i);
      expect(buttonCss![1]).toMatch(/button\.modern/i);
      expect(buttonCss![1]).toMatch(/button\.futuristic/i);
    });
  });

  describe('Variable Integration', () => {
    it('should have scrollToId for navigation', () => {
      expect(customizerContent).toMatch(/scrollToId:\s*['"]component-button['"]/i);
    });

    it('should have proper option types', () => {
      const buttonSection = customizerContent.match(/name:\s*"Button"[\s\S]*?(?=\/\/ ---)/i);
      
      // Should have select options for padding
      expect(buttonSection![0]).toMatch(/type:\s*'select'/);
      
      // Should have range options for font size
      expect(buttonSection![0]).toMatch(/type:\s*'range'/);
    });

    it('should have color purpose for color controls', () => {
      const buttonSection = customizerContent.match(/name:\s*"Button"[\s\S]*?(?=\/\/ ---)/i);
      expect(buttonSection![0]).toMatch(/purpose:\s*'color'/);
    });
  });
});
