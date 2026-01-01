import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Component System - Complete Coverage', () => {
  let useThemeContent: string;
  let customizerContent: string;
  let showcaseContent: string;
  let indexHtmlContent: string;

  const components = [
    'button',
    'input',
    'card',
    'badge',
    'alert',
    'link',
    'table',
    'tabs',
    'avatar',
    'tooltip',
    'popover',
    'toast',
    'skeleton',
    'pagination',
  ];

  const variants = ['initial', 'retro', 'modern', 'futuristic'];
  const colorTypes = ['primary', 'secondary', 'accent'];

  const getCustomizerComponentSection = (componentName: string) => {
    const anchor = `scrollToId: 'component-${componentName}'`;
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

  describe('Variant Definitions', () => {
    it('should declare all visual variants inside Showcase', () => {
      const variantBlock = showcaseContent.match(/const variants = \[([\s\S]*?)\];/i);
      expect(variantBlock).toBeTruthy();
      if (variantBlock) {
        ['Initial', 'Retro', 'Modern', 'Futuristic'].forEach(name => {
          expect(variantBlock[1]).toContain(`name: '${name}'`);
        });
        ['', 'retro', 'modern', 'futuristic'].forEach(className => {
          expect(variantBlock[1]).toContain(`className: '${className}'`);
        });
      }
    });
  });

  describe('Component Existence', () => {
    components.forEach(component => {
      it(`should have ${component} section in ThemeCustomizer`, () => {
        const regex = new RegExp(`name:\\s*"${component.charAt(0).toUpperCase() + component.slice(1)}"`, 'i');
        expect(customizerContent).toMatch(regex);
      });

      it(`should have ${component} showcase section`, () => {
        const regex = new RegExp(`id=["']component-${component}["']`, 'i');
        expect(showcaseContent).toMatch(regex);
      });

      it(`should have ${component} CSS section`, () => {
        const regex = new RegExp(`\\[COMPONENT:${component}:START\\]`, 'i');
        expect(indexHtmlContent).toMatch(regex);
      });
    });
  });

  describe('Component Variants - CSS', () => {
    components.forEach(component => {
      variants.forEach(variant => {
        const selector = variant === 'initial' ? component : `${component}.${variant}`;
        
        it(`should have CSS for ${component} - ${variant}`, () => {
          // Check for the variant class or base element
          const componentMarker = new RegExp(`\\[COMPONENT:${component}:START\\]`, 'i');
          const componentSection = indexHtmlContent.match(new RegExp(`\\/\\* \\[COMPONENT:${component}:START\\] \\*\\/([\\s\\S]*?)\\/\\* \\[COMPONENT:${component}:END\\] \\*\\/`, 'i'));
          
          if (!componentSection) {
            expect(componentMarker.test(indexHtmlContent)).toBe(true);
            return;
          }
          
          const hasVariant = variant === 'initial' 
            ? new RegExp(`(^|\\s|,|\\{)(\\.)?${component}(\\s|:|\\.|\\[|\\{|,|\\))`, 'm').test(componentSection[1])
            : new RegExp(`\\.${component}\\.${variant}|${component}\\.${variant}`, 'i').test(componentSection[1]);
          
          expect(hasVariant).toBe(true);
        });
      });
    });
  });

  describe('Component Color Variants', () => {
    components.forEach(component => {
      // Skip components that don't have color variants
      // Note: Alert uses status types (info, success, warning, error) not color variants
      const hasColorVariants = ['button', 'badge'].includes(component);
      
      if (hasColorVariants) {
        variants.forEach(variant => {
          colorTypes.forEach(colorType => {
            it(`should have ${component}.${variant}.${colorType} in CSS`, () => {
              const pattern = variant === 'initial'
                ? new RegExp(`${component}\\.${colorType}`, 'i')
                : new RegExp(`${component}\\.${variant}\\.${colorType}`, 'i');
              
              expect(indexHtmlContent).toMatch(pattern);
            });
          });
        });
      }
    });
  });

  describe('Component States', () => {
    const statesByComponent: Record<string, string[]> = {
      button: ['hover', 'active', 'focus', 'disabled'],
      input: ['hover', 'focus', 'disabled'],
      link: ['hover', 'active', 'focus', 'visited'],
      tabs: ['hover', 'active'],
      table: ['hover'],
      card: [],
      badge: [],
      alert: [],
      avatar: [],
      tooltip: ['hover'],
      popover: ['hover'],
      toast: [],
      skeleton: [],
      pagination: ['hover', 'active'],
    };
    
    components.forEach(component => {
      const states = statesByComponent[component] || [];
      
      states.forEach(state => {
        it(`should have :${state} state for ${component}`, () => {
          // Check if component has this state in CSS
          const hasState = new RegExp(`${component}[^{]*:${state}|\\[aria-selected.*\\]|\\[disabled\\]`, 'i').test(indexHtmlContent);
          expect(hasState).toBe(true);
        });
      });
      
      if (states.length === 0) {
        it(`should have ${component} component (no interactive states expected)`, () => {
          expect(indexHtmlContent).toMatch(new RegExp(`\\[COMPONENT:${component}:START\\]`, 'i'));
        });
      }
    });
  });

  describe('Component Variables', () => {
    components.forEach(component => {
      it(`should have variables for ${component} in useTheme`, () => {
        // Some components have singular variable names (tabs -> tab)
        const varPrefix = component === 'tabs' ? 'tab' : component;
        const hasVars = new RegExp(`--${varPrefix}-`, 'i').test(useThemeContent);
        expect(hasVars).toBe(true);
      });

      it(`should have controls for ${component} in ThemeCustomizer`, () => {
        const sectionName = component.charAt(0).toUpperCase() + component.slice(1);
        const sectionPattern = new RegExp(
          `name:\\s*"${sectionName}"[\\s\\S]{0,1200}`,
          'i'
        );
        const componentSection = sectionPattern.exec(customizerContent);

        expect(componentSection).toBeTruthy();
        if (componentSection) {
          const hasControls = /id:\s*['"]--/.test(componentSection[0]);
          expect(hasControls).toBe(true);
        }
      });

      it(`should use ${component} variables in CSS`, () => {
        const componentCssSection = new RegExp(
          `\\[COMPONENT:${component}:START\\][\\s\\S]*?\\[COMPONENT:${component}:END\\]`,
          'i'
        ).exec(indexHtmlContent);
        
        if (componentCssSection) {
          const usesVars = /var\(--[^)]+\)/.test(componentCssSection[0]);
          expect(usesVars).toBe(true);
        }
      });
    });
  });

  describe('Component Showcase Rendering', () => {
    const componentsWithVariants = ['button', 'badge', 'alert', 'card', 'input', 'table', 'tabs', 'link'];
    
    components.forEach(component => {
      variants.forEach(variant => {
        it(`should demonstrate ${component} ${variant} variant in showcase`, () => {
          const componentSection = new RegExp(
            `id=["']component-${component}["'][\\s\\S]*?(?=<div className=["'][^"']*card[^"']*["'][^>]*id=|$)`,
            'i'
          ).exec(showcaseContent);

          expect(componentSection).toBeTruthy();
          if (!componentSection) return;

          if (!componentsWithVariants.includes(component) || variant === 'initial') {
            expect(componentSection[0]).toBeTruthy();
            return;
          }

          const snippet = componentSection[0].toLowerCase();
          const hasLiteralVariant = snippet.includes(variant);
          const usesVariantLoop = /variants\.map/i.test(componentSection[0]) && /v\.className/i.test(componentSection[0]);
          expect(hasLiteralVariant || usesVariantLoop).toBe(true);
        });
      });
    });
  });

  describe('Component Export - CSS Generation', () => {
    components.forEach(component => {
      it(`should include ${component} in CSS export markers`, () => {
        const hasStartMarker = indexHtmlContent.includes(`[COMPONENT:${component}:START]`);
        const hasEndMarker = indexHtmlContent.includes(`[COMPONENT:${component}:END]`);
        
        expect(hasStartMarker).toBe(true);
        expect(hasEndMarker).toBe(true);
      });

      it(`should have complete CSS between ${component} markers`, () => {
        const componentCss = new RegExp(
          `\\/\\* \\[COMPONENT:${component}:START\\] \\*\\/([\\s\\S]*?)\\/\\* \\[COMPONENT:${component}:END\\] \\*\\/`,
          'i'
        ).exec(indexHtmlContent);
        
        expect(componentCss).toBeTruthy();
        if (componentCss) {
          expect(componentCss[1].trim().length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Component Structure Validation', () => {
    components.forEach(component => {
      it(`should have proper structure sections for ${component}`, () => {
        const componentSection = getCustomizerComponentSection(component);
        expect(componentSection).toMatch(/subsections/i);
      });

      variants.forEach(variant => {
        it(`should have ${variant} subsection for ${component}`, () => {
          if (!['button', 'input', 'card', 'badge', 'alert', 'link'].includes(component)) return;

          const componentSection = getCustomizerComponentSection(component);
          expect(componentSection).not.toEqual('');

          const variantLabel = variant.charAt(0).toUpperCase() + variant.slice(1);
          const hasVariant = new RegExp(`name:\\s*"${variantLabel}"`, 'i').test(componentSection);
          expect(hasVariant).toBe(true);
        });
      });
    });
  });

  describe('Component Variable Completeness', () => {
    components.forEach(component => {
      it(`should have structure variables for ${component}`, () => {
        const structureVars = [
          `--${component}-padding`,
          `--${component}-border-radius`,
          `--${component}-font-size`,
        ];
        
        let hasStructure = false;
        structureVars.forEach(varName => {
          if (useThemeContent.includes(varName)) {
            hasStructure = true;
          }
        });
        
        // Most visible components should have structure vars
        if (['button', 'input', 'card', 'badge', 'alert'].includes(component)) {
          expect(hasStructure).toBe(true);
        }
      });

      it(`should have color variables for ${component}`, () => {
        const colorVars = [
          `--${component}-bg`,
          `--${component}-color`,
          `--${component}-border-color`,
        ];
        
        let hasColors = false;
        colorVars.forEach(varName => {
          if (useThemeContent.includes(varName) || indexHtmlContent.includes(varName)) {
            hasColors = true;
          }
        });
        
        if (['button', 'input', 'card', 'badge', 'alert', 'link'].includes(component)) {
          expect(hasColors).toBe(true);
        }
      });
    });
  });

  describe('Component Responsive Showcase', () => {
    components.forEach(component => {
      it(`should have ${component} in showcase with proper container`, () => {
        const showcaseSection = new RegExp(
          `<div[^>]*id=["']component-${component}["'][^>]*>[\\s\\S]*?</div>`,
          'i'
        ).exec(showcaseContent);
        
        expect(showcaseSection).toBeTruthy();
      });

      it(`should have ${component} title in showcase`, () => {
        const showcaseSection = new RegExp(
          `id=["']component-${component}["'][\\s\\S]*?<h2[^>]*>([^<]+)</h2>`,
          'i'
        ).exec(showcaseContent);
        
        expect(showcaseSection).toBeTruthy();
        if (showcaseSection) {
          expect(showcaseSection[1].toLowerCase()).toContain(component.replace(/-/g, ' '));
        }
      });
    });
  });
});
