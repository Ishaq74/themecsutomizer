import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Input Component - Exhaustive Tests', () => {
  let useThemeContent: string;
  let customizerContent: string;
  let showcaseContent: string;
  let indexHtmlContent: string;
  const getCustomizerSection = (component: string) => {
    const anchor = `scrollToId: 'component-${component.toLowerCase()}'`;
    const anchorIndex = customizerContent.indexOf(anchor);
    if (anchorIndex === -1) return '';

    let start = anchorIndex;
    while (start > 0 && customizerContent[start] !== '{') {
      start--;
    }
    if (customizerContent[start] !== '{') return '';

    let depth = 0;
    for (let i = start; i < customizerContent.length; i++) {
      const char = customizerContent[i];
      if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0) {
          return customizerContent.slice(start, i + 1);
        }
      }
    }

    return customizerContent.slice(start);
  };

  beforeAll(() => {
    useThemeContent = fs.readFileSync(path.join(process.cwd(), 'hooks/useTheme.ts'), 'utf8');
    customizerContent = fs.readFileSync(path.join(process.cwd(), 'components/ThemeCustomizer.tsx'), 'utf8');
    showcaseContent = fs.readFileSync(path.join(process.cwd(), 'components/Showcase.tsx'), 'utf8');
    indexHtmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  });

  describe('Variables Declaration', () => {
    const inputVars = [
      '--input-padding-y',
      '--input-padding-x',
      '--input-border-width',
      '--input-border-radius',
      '--input-font-size',
      '--input-bg',
      '--input-border-color',
      '--input-text-color',
      '--input-placeholder-color',
      '--input-border-color-focus',
    ];

    inputVars.forEach(varName => {
      it(`should declare ${varName} in useTheme`, () => {
        expect(useThemeContent).toContain(varName);
      });

      it(`should have ${varName} used in CSS`, () => {
        expect(indexHtmlContent).toContain(`var(${varName})`);
      });
    });
  });

  describe('Variants - Initial', () => {
    it('should have initial input CSS', () => {
      expect(indexHtmlContent).toMatch(/input\[type=["']text["']\]|input\[type=["']email["']\]|input,\s*textarea/i);
    });

    it('should have focus state', () => {
      expect(indexHtmlContent).toMatch(/input:focus|textarea:focus/i);
    });

    it('should have disabled state', () => {
      expect(indexHtmlContent).toMatch(/input:disabled|input\[disabled\]/i);
    });

    it('should have placeholder styling', () => {
      expect(indexHtmlContent).toMatch(/::placeholder/i);
    });
  });

  describe('Variants - Retro', () => {
    const retroVars = [
      '--retro-input-bg',
      '--retro-input-border-color',
      '--retro-input-text-color',
      '--retro-border-width',
    ];

    retroVars.forEach(varName => {
      it(`should have ${varName} variable`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });

    it('should have retro input CSS', () => {
      expect(indexHtmlContent).toMatch(/input\.retro|\.retro\s+input/i);
    });

    it('should have retro focus state', () => {
      expect(indexHtmlContent).toMatch(/input\.retro:focus|\.retro\s+input:focus/i);
    });
  });

  describe('Variants - Modern', () => {
    const modernVars = [
      '--modern-input-bg',
      '--modern-input-border-color',
      '--modern-input-text-color',
      '--modern-radius',
    ];

    modernVars.forEach(varName => {
      it(`should have ${varName} variable`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });

    it('should have modern input CSS', () => {
      expect(indexHtmlContent).toMatch(/input\.modern|\.modern\s+input/i);
    });

    it('should use modern radius', () => {
      const modernInputSection = indexHtmlContent.match(/input\.modern[\s\S]{0,300}border-radius/i);
      expect(modernInputSection).toBeTruthy();
    });
  });

  describe('Variants - Futuristic', () => {
    const futuristicVars = [
      '--futuristic-input-bg',
      '--futuristic-input-border-color',
      '--futuristic-input-text-color',
      '--futuristic-clip-path',
    ];

    futuristicVars.forEach(varName => {
      it(`should have ${varName} variable`, () => {
        expect(useThemeContent).toContain(varName);
      });
    });

    it('should have futuristic input CSS', () => {
      expect(indexHtmlContent).toMatch(/input\.futuristic|\.futuristic\s+input/i);
    });

    it('should have glow effect on focus', () => {
      const futuristicSection = indexHtmlContent.match(/input\.futuristic:focus[\s\S]{0,400}/i);
      expect(futuristicSection).toBeTruthy();
      expect(futuristicSection![0]).toMatch(/box-shadow/i);
    });
  });

  describe('ThemeCustomizer Controls', () => {
    it('should have Input section', () => {
      expect(customizerContent).toMatch(/name:\s*["']Input["']/);
    });

    it('should have Structure controls', () => {
      expect(customizerContent).toMatch(/id:\s*['"]--input-padding-y['"]/);
      expect(customizerContent).toMatch(/id:\s*['"]--input-border-radius['"]/);
    });

    it('should have Colors controls', () => {
      expect(customizerContent).toMatch(/id:\s*['"]--input-bg['"]/);
      expect(customizerContent).toMatch(/id:\s*['"]--input-border-color['"]/);
    });

    it('should have States controls', () => {
      expect(customizerContent).toMatch(/id:\s*['"]--input-border-color-focus['"]/);
    });

    ['Retro', 'Modern', 'Futuristic'].forEach(variant => {
      it(`should have ${variant} subsection`, () => {
        const inputSection = getCustomizerSection('input');
        expect(inputSection).not.toEqual('');
        expect(inputSection).toMatch(new RegExp(`name:\\s*["']${variant}["']`));
      });
    });
  });

  describe('Showcase Demonstration', () => {
    it('should have input showcase section', () => {
      expect(showcaseContent).toMatch(/id=["']component-input["']/);
    });

    it('should demonstrate all variants', () => {
      const inputSection = showcaseContent.match(/id=["']component-input["'][\s\S]*?(?=<div className=["']card["'].*?id=|$)/i);
      expect(inputSection).toBeTruthy();
      
      expect(inputSection![0]).toMatch(/retro/i);
      expect(inputSection![0]).toMatch(/modern/i);
      expect(inputSection![0]).toMatch(/futuristic/i);
    });

    it('should demonstrate text input', () => {
      const inputSection = showcaseContent.match(/id=["']component-input["'][\s\S]*?(?=<div className=["']card["'].*?id=|$)/i);
      expect(inputSection![0]).toMatch(/<input[^>]*type=["']text["']/i);
    });

    it('should demonstrate textarea', () => {
      const inputSection = showcaseContent.match(/id=["']component-input["'][\s\S]*?(?=<div className=["']card["'].*?id=|$)/i);
      expect(inputSection![0]).toMatch(/<textarea/i);
    });

    it('should demonstrate disabled state', () => {
      const inputSection = showcaseContent.match(/id=["']component-input["'][\s\S]*?(?=<div className=["']card["'].*?id=|$)/i);
      expect(inputSection![0]).toMatch(/disabled/i);
    });
  });

  describe('CSS Export', () => {
    it('should have input export markers', () => {
      expect(indexHtmlContent).toContain('[COMPONENT:input:START]');
      expect(indexHtmlContent).toContain('[COMPONENT:input:END]');
    });

    it('should have complete CSS between markers', () => {
      const inputCss = indexHtmlContent.match(/\/\* \[COMPONENT:input:START\] \*\/([\s\S]*?)\/\* \[COMPONENT:input:END\] \*\//i);
      expect(inputCss).toBeTruthy();
      expect(inputCss![1].trim().length).toBeGreaterThan(100);
    });

    it('should include all variants in export', () => {
      const inputCss = indexHtmlContent.match(/\/\* \[COMPONENT:input:START\] \*\/([\s\S]*?)\/\* \[COMPONENT:input:END\] \*\//i);
      
      expect(inputCss![1]).toMatch(/retro/i);
      expect(inputCss![1]).toMatch(/modern/i);
      expect(inputCss![1]).toMatch(/futuristic/i);
    });

    it('should include textarea styles', () => {
      const inputCss = indexHtmlContent.match(/\/\* \[COMPONENT:input:START\] \*\/([\s\S]*?)\/\* \[COMPONENT:input:END\] \*\//i);
      expect(inputCss![1]).toMatch(/textarea/i);
    });
  });

  describe('Variable Integration', () => {
    it('should have scrollToId for navigation', () => {
      const inputConfig = customizerContent.match(/name:\s*["']Input["'][\s\S]*?scrollToId:\s*['"][^'"]+['"]/i);
      expect(inputConfig).toBeTruthy();
      expect(inputConfig![0]).toContain('component-input');
    });

    it('should sync with ColorInput component', () => {
      const colorInputExists = fs.existsSync(path.join(process.cwd(), 'components/ColorInput.tsx'));
      expect(colorInputExists).toBe(true);
    });
  });
});
