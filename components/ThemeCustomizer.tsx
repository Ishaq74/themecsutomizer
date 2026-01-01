import React, { useState, useRef, useEffect } from 'react';
import { type ThemeVariables, type ThemeConfigCategory, type ThemeConfig, type SavedPreset, type AccessibilityResult, type ThemeConfigSection } from '../types';
import { ExportModal } from './ExportModal';
import { DEFAULT_THEME, SEMANTIC_MAPPINGS } from '../hooks/useTheme';
import { useAccessibilityChecker } from '../hooks/useAccessibilityChecker';
import { InputControl } from './InputControl';
import { A11yIcon, SunIcon, MoonIcon, CodeIcon, FileCssIcon, ChevronIcon, TrashIcon } from './Icons';

interface ThemeCustomizerProps {
  theme: ThemeVariables;
  updateTheme: (key: keyof ThemeVariables, value: string) => void;
  generateCss: (options?: { mode: 'diff' | 'all' | 'full', exclude: Set<string> }) => string;
  generateJson: () => string;
  resetTheme: () => void;
  hasChanges: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  customPresets: SavedPreset[];
  savePreset: (name: string) => void;
  deletePreset: (name: string) => void;
  applyPreset: (theme: Partial<ThemeVariables>) => void;
  fixContrast: (keyToFix: keyof ThemeVariables, backgroundColor: string, candidateTokens: string[]) => void;
}

const semanticColorTokenOptions = [
  { value: 'var(--bg-default)', label: 'bg-default' },
  { value: 'var(--bg-subtle)', label: 'bg-subtle' },
  { value: 'var(--bg-inset)', label: 'bg-inset' },
  { value: 'var(--text-default)', label: 'text-default' },
  { value: 'var(--text-muted)', label: 'text-muted' },
  { value: 'var(--text-inverted)', label: 'text-inverted' },
  { value: 'var(--border-default)', label: 'border-default' },
  { value: 'var(--border-strong)', label: 'border-strong' },
  { value: 'var(--color-primary)', label: 'color-primary' },
  { value: 'var(--color-secondary)', label: 'color-secondary' },
  { value: 'var(--color-accent)', label: 'color-accent' },
  { value: 'var(--color-success)', label: 'color-success' },
  { value: 'var(--color-warning)', label: 'color-warning' },
  { value: 'var(--color-danger)', label: 'color-danger' },
  { value: 'var(--primary-text)', label: 'primary-text (auto)' },
  { value: 'var(--secondary-text)', label: 'secondary-text (auto)' },
  { value: 'var(--accent-text)', label: 'accent-text (auto)' },
  { value: 'var(--success-text)', label: 'success-text (auto)' },
  { value: 'var(--warning-text)', label: 'warning-text (auto)' },
  { value: 'var(--danger-text)', label: 'danger-text (auto)' },
  { value: 'transparent', label: 'transparent' },
  { value: 'white', label: 'white' },
  { value: 'black', label: 'black' },
];

const paletteColorTokenOptions = semanticColorTokenOptions.filter(
    o => o.value.startsWith('var(--color-neutral') || o.value.startsWith('var(--color-p') || o.value.startsWith('var(--color-s') || o.value.startsWith('var(--color-a') || o.value.startsWith('var(--color-d') || o.value.startsWith('var(--color-w')
);

const allColorTokenValues = semanticColorTokenOptions.map(o => o.value);

const builtInPresets: SavedPreset[] = [
    { name: 'Default', theme: {} },
    { name: 'Zatchouli', theme: { "--color-primary": "#f97316", "--color-secondary": "#38bdf8", "--color-accent": "#0e7490" } },
    { name: 'Algérie', theme: { "--color-primary": "#16a34a", "--color-secondary": "#6ee7b7", "--color-accent": "#dc2626" } },
    { name: 'Cool', theme: { "--color-primary": "#eab308", "--color-secondary": "#8b5cf6", "--color-accent": "#ec4899", "--bg-default-dark": "#1e1b4b", "--bg-subtle-dark": "#312e81" } },
];

// --- THEME CONFIGURATION STRUCTURE ---
const themeConfig: ThemeConfigCategory[] = [
  {
    name: "Palette & Globals",
    scrollToId: 'component-button',
    subsections: [
      {
        name: "Brand Colors",
        configs: [
          { id: '--color-primary', label: 'Primary', type: 'color' },
          { id: '--color-secondary', label: 'Secondary', type: 'color' },
          { id: '--color-accent', label: 'Accent', type: 'color' },
        ]
      },
      {
        name: "Status Colors",
        configs: [
          { id: '--color-success', label: 'Success', type: 'color' },
          { id: '--color-warning', label: 'Warning', type: 'color' },
          { id: '--color-danger', label: 'Danger', type: 'color' },
        ]
      },
      {
          name: "Global Styles",
          configs: [
              { id: '--font-family-sans', label: 'Body Font', type: 'text' },
              { id: '--font-family-display', label: 'Heading Font', type: 'text' },
              { id: '--font-family-mono', label: 'Mono Font', type: 'text' },
              { id: '--bg-default', label: 'Body BG', type: 'select', options: paletteColorTokenOptions, purpose: 'color' },
              { id: '--text-default', label: 'Body Text', type: 'select', options: paletteColorTokenOptions, purpose: 'color' },
          ]
      }
    ]
  },
  // --- TYPOGRAPHY ---
  {
      name: "Typography",
      id: 'typography',
      scrollToId: 'component-typography',
      subsections: [
          {
              name: "Sizing",
              configs: [
                  { id: '--font-size-base', label: 'Base Size', type: 'range', min: 0.875, max: 1.25, step: 0.0625, unit: 'rem' },
                  { id: '--line-height-base', label: 'Line Height', type: 'range', min: 1.2, max: 2, step: 0.1 },
                  { id: '--h1-font-size', label: 'H1 Size', type: 'range', min: 2, max: 4, step: 0.25, unit: 'rem' },
                  { id: '--h2-font-size', label: 'H2 Size', type: 'range', min: 1.5, max: 3, step: 0.25, unit: 'rem' },
                  { id: '--h3-font-size', label: 'H3 Size', type: 'range', min: 1.25, max: 2.5, step: 0.125, unit: 'rem' },
              ]
          },
          {
              name: "Colors",
              configs: [
                  { id: '--heading-color', label: 'Headings', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                  { id: '--link-color', label: 'Links', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
              ]
          }
      ]
  },
  // --- DESIGN TOKENS ---
  {
      name: "Design Tokens",
      id: 'tokens',
      subsections: [
          {
              name: "Spacing",
              configs: [
                  { id: '--space-1', label: 'Space 1 (XS)', type: 'text' },
                  { id: '--space-2', label: 'Space 2 (S)', type: 'text' },
                  { id: '--space-3', label: 'Space 3 (M)', type: 'text' },
                  { id: '--space-4', label: 'Space 4 (Base)', type: 'text' },
                  { id: '--space-6', label: 'Space 6 (L)', type: 'text' },
                  { id: '--space-8', label: 'Space 8 (XL)', type: 'text' },
              ]
          },
          {
              name: "Border Radius",
              configs: [
                  { id: '--border-radius-sm', label: 'Small', type: 'text' },
                  { id: '--border-radius-md', label: 'Medium', type: 'text' },
                  { id: '--border-radius-lg', label: 'Large', type: 'text' },
              ]
          },
          {
              name: "Shadows",
              configs: [
                  { id: '--shadow-sm', label: 'Small', type: 'text' },
                  { id: '--shadow-md', label: 'Medium', type: 'text' },
                  { id: '--shadow-lg', label: 'Large', type: 'text' },
                  { id: '--shadow-xl', label: 'Extra Large', type: 'text' },
              ]
          }
      ]
  },
  // --- LAYOUT ---
  {
      name: "Layout",
      id: 'layout',
      scrollToId: 'component-grid',
      subsections: [
          {
              name: "Grid System",
              subsections: [
                  { 
                      name: "Initial", 
                      configs: [
                          { id: '--grid-gap', label: 'Gap', type: 'select', options: [{value: 'var(--space-2)', label: 'Small'}, {value: 'var(--space-4)', label: 'Medium'}, {value: 'var(--space-8)', label: 'Large'}] },
                          { id: '--grid-column-min', label: 'Min Col Width', type: 'text' }
                      ]
                  }
              ]
          }
      ]
  },
  // --- BUTTON COMPONENT ---
  {
    name: "Button",
    id: 'button',
    scrollToId: 'component-button',
    subsections: [
        {
            name: "Initial",
            subsections: [
                {
                    name: "Structure",
                    configs: [
                        { id: '--button-padding-y', label: 'Padding Y', type: 'select', options: [ { value: 'var(--space-1)', label: 'Small'}, { value: 'var(--space-2)', label: 'Medium'}, { value: 'var(--space-3)', label: 'Large'}] },
                        { id: '--button-padding-x', label: 'Padding X', type: 'select', options: [ { value: 'var(--space-2)', label: 'Small'}, { value: 'var(--space-4)', label: 'Medium'}, { value: 'var(--space-6)', label: 'Large'}] },
                        { id: '--button-font-size', label: 'Font Size', type: 'range', min: 0.75, max: 1.25, step: 0.0625, unit: 'rem' },
                        { id: '--button-border-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-sm)', label: 'Small'}, {value: 'var(--border-radius-md)', label: 'Medium'}, {value: '999px', label: 'Pill'}] },
                        { id: '--button-border-width', label: 'Border Width', type: 'text' }
                    ]
                },
                {
                    name: "Colors",
                    configs: [
                        { id: '--button-default-bg', label: 'Default BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                        { id: '--button-default-color', label: 'Default Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                        { id: '--button-default-border-color', label: 'Default Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                        { id: '--button-primary-bg', label: 'Primary BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                        { id: '--button-primary-color', label: 'Primary Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    ]
                },
                { name: "States", configs: [{ id: '--button-default-bg-hover', label: 'Hover BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }
            ]
        },
        {
            name: "Retro",
            subsections: [
                { name: "Structure", configs: [{ id: '--retro-border-width', label: 'Border Width', type: 'range', min: 1, max: 6, unit: 'px' }, { id: '--retro-shadow-offset', label: 'Shadow Depth', type: 'range', min: 0, max: 10, unit: 'px' }] },
                { name: "Colors", configs: [
                    { id: '--retro-button-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                    { id: '--retro-button-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--retro-button-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                ] },
                { name: "States", configs: [
                    { id: '--retro-button-hover-bg', label: 'Hover BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--retro-button-active-bg', label: 'Active BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                ]}
            ]
        },
        {
            name: "Modern",
            subsections: [
                { name: "Structure", configs: [{ id: '--modern-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-md)', label: 'Medium'}, {value: '9999px', label: 'Pill'}] }] },
                { name: "Colors", configs: [
                    { id: '--modern-button-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                    { id: '--modern-button-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--modern-button-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                ] },
                { name: "States", configs: [{ id: '--modern-button-hover-shadow', label: 'Hover Shadow', type: 'text' }]}
            ]
        },
        {
            name: "Futuristic",
            subsections: [
                { name: "Structure", configs: [{ id: '--futuristic-clip-path', label: 'Clip Path', type: 'text' }] },
                { name: "Colors", configs: [
                    { id: '--futuristic-button-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                    { id: '--futuristic-button-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--futuristic-button-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                ] },
                { name: "States", configs: [
                    { id: '--futuristic-button-hover-bg', label: 'Hover BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--futuristic-button-hover-glow', label: 'Hover Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                ]}
            ]
        }
    ]
  },
  // --- INPUT COMPONENT ---
  {
      name: "Input",
      id: 'input',
      scrollToId: 'component-input',
      subsections: [
          {
              name: "Initial",
              subsections: [
                  {
                      name: "Structure",
                      configs: [
                          { id: '--input-padding-y', label: 'Padding Y', type: 'select', options: [ { value: 'var(--space-1)', label: 'Small'}, { value: 'var(--space-2)', label: 'Medium'}] },
                          { id: '--input-padding-x', label: 'Padding X', type: 'select', options: [ { value: 'var(--space-2)', label: 'Small'}, { value: 'var(--space-3)', label: 'Medium'}] },
                          { id: '--input-border-width', label: 'Border Width', type: 'text' },
                          { id: '--input-border-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-md)', label: 'Medium'}, {value: 'var(--border-radius-sm)', label: 'Small'}] }
                      ]
                  },
                  {
                      name: "Colors",
                      configs: [
                          { id: '--input-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                          { id: '--input-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                          { id: '--input-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                      ]
                  },
                  {
                      name: "States",
                      configs: [
                          { id: '--input-border-color-focus', label: 'Focus Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                      ]
                  }
              ]
          },
          {
              name: "Retro",
              subsections: [
                  { name: "Structure", configs: [{ id: '--retro-border-width', label: 'Border', type: 'range', min: 1, max: 5, unit: 'px' }] },
                  { name: "Colors", configs: [
                      { id: '--retro-input-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                      { id: '--retro-input-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                      { id: '--retro-input-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                  ] },
                  { name: "States", configs: [{ id: '--retro-input-focus-bg', label: 'Focus BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }
              ]
          },
          {
              name: "Modern",
              subsections: [
                   { name: "Structure", configs: [{ id: '--input-border-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-md)', label: 'Medium'}, {value: '99px', label: 'Pill'}] }] },
                   { name: "Colors", configs: [
                      { id: '--modern-input-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                      { id: '--modern-input-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                      { id: '--modern-input-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                  ] },
                   { name: "States", configs: [] } 
              ]
          },
          {
              name: "Futuristic",
              subsections: [
                  { name: "Structure", configs: [{ id: '--futuristic-clip-path', label: 'Clip Path', type: 'text' }] },
                  { name: "Colors", configs: [
                      { id: '--futuristic-input-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                      { id: '--futuristic-input-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                      { id: '--futuristic-input-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                  ] },
                  { name: "States", configs: [{ id: '--futuristic-input-focus-glow', label: 'Focus Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }
              ]
          }
      ]
  },
  // --- LINK COMPONENT ---
  {
    name: "Link",
    id: 'link',
    scrollToId: 'component-link',
    subsections: [
        // ===== LINK STYLES (Text Links) =====
        {
            name: "Link Styles",
            subsections: [
                {
                    name: "Initial",
                    subsections: [
                        {
                            name: "Structure",
                            configs: [
                                { id: '--link-text-decoration', label: 'Text Decoration', type: 'select', options: [{value: 'none', label: 'None'}, {value: 'underline', label: 'Underline'}, {value: 'overline', label: 'Overline'}] },
                                { id: '--link-text-decoration-color', label: 'Decoration Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--link-text-underline-offset', label: 'Underline Offset', type: 'range', min: 0, max: 8, unit: 'px' },
                                { id: '--link-font-weight', label: 'Font Weight', type: 'select', options: [{value: '400', label: 'Normal'}, {value: '500', label: 'Medium'}, {value: '600', label: 'Semibold'}, {value: '700', label: 'Bold'}] },
                                { id: '--link-transition', label: 'Transition', type: 'text' }
                            ]
                        },
                        {
                            name: "Colors",
                            configs: [
                                { id: '--link-color', label: 'Link Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--link-hover-color', label: 'Hover Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--link-active-color', label: 'Active Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--link-visited-color', label: 'Visited Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        }
                    ]
                },
                {
                    name: "Retro",
                    subsections: [
                        {
                            name: "Structure",
                            configs: [
                                { id: '--retro-link-border-width', label: 'Border Width', type: 'range', min: 1, max: 4, unit: 'px' },
                                { id: '--retro-link-font-weight', label: 'Font Weight', type: 'select', options: [{value: '400', label: 'Normal'}, {value: '500', label: 'Medium'}, {value: '600', label: 'Semibold'}, {value: '700', label: 'Bold'}] },
                                { id: '--retro-link-transition', label: 'Transition', type: 'text' },
                                { id: '--retro-link-shadow-offset', label: 'Shadow Offset', type: 'range', min: 0, max: 8, unit: 'px' }
                            ]
                        },
                        {
                            name: "Colors",
                            configs: [
                                { id: '--retro-link-color', label: 'Link Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--retro-link-border-color', label: 'Border Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--retro-link-shadow-color', label: 'Shadow Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        },
                        {
                            name: "States",
                            configs: [
                                { id: '--retro-link-hover-color', label: 'Hover Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        }
                    ]
                },
                {
                    name: "Modern",
                    subsections: [
                        {
                            name: "Structure",
                            configs: [
                                { id: '--modern-link-underline-height', label: 'Underline Height', type: 'range', min: 1, max: 4, unit: 'px' },
                                { id: '--modern-link-transition', label: 'Transition', type: 'text' }
                            ]
                        },
                        {
                            name: "Colors",
                            configs: [
                                { id: '--modern-link-color', label: 'Link Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--modern-link-underline-color', label: 'Underline Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        },
                        {
                            name: "States",
                            configs: [
                                { id: '--modern-link-hover-color', label: 'Hover Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        }
                    ]
                },
                {
                    name: "Futuristic",
                    subsections: [
                        {
                            name: "Structure",
                            configs: [
                                { id: '--futuristic-link-letter-spacing', label: 'Letter Spacing', type: 'text' },
                                { id: '--futuristic-link-font-size', label: 'Font Size', type: 'text' }
                            ]
                        },
                        {
                            name: "Colors",
                            configs: [
                                { id: '--futuristic-link-color', label: 'Link Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--futuristic-link-glow', label: 'Hover Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        },
                        {
                            name: "States",
                            configs: [
                                { id: '--futuristic-link-hover-color', label: 'Hover Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        }
                    ]
                }
            ]
        },
        // ===== BUTTON STYLES (Links as Buttons) =====
        {
            name: "Button Styles",
            subsections: [
                {
                    name: "Initial",
                    subsections: [
                        {
                            name: "Structure",
                            configs: [
                                { id: '--link-button-padding-y', label: 'Padding Y', type: 'select', options: [ { value: 'var(--space-1)', label: 'Small'}, { value: 'var(--space-2)', label: 'Medium'}, { value: 'var(--space-3)', label: 'Large'}] },
                                { id: '--link-button-padding-x', label: 'Padding X', type: 'select', options: [ { value: 'var(--space-2)', label: 'Small'}, { value: 'var(--space-4)', label: 'Medium'}, { value: 'var(--space-6)', label: 'Large'}] },
                                { id: '--link-button-font-size', label: 'Font Size', type: 'range', min: 0.75, max: 1.25, step: 0.0625, unit: 'rem' },
                                { id: '--link-button-border-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-sm)', label: 'Small'}, {value: 'var(--border-radius-md)', label: 'Medium'}, {value: '999px', label: 'Pill'}] },
                                { id: '--link-button-border-width', label: 'Border Width', type: 'text' }
                            ]
                        },
                        {
                            name: "Colors",
                            configs: [
                                { id: '--link-button-default-bg', label: 'Default BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--link-button-default-color', label: 'Default Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--link-button-default-border-color', label: 'Default Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        },
                        {
                            name: "States",
                            configs: [
                                { id: '--link-button-default-bg-hover', label: 'Hover BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        }
                    ]
                },
                {
                    name: "Retro",
                    subsections: [
                        {
                            name: "Structure",
                            configs: [
                                { id: '--retro-link-button-border-width', label: 'Border Width', type: 'range', min: 1, max: 6, unit: 'px' },
                                { id: '--retro-link-button-shadow-offset', label: 'Shadow Depth', type: 'range', min: 0, max: 10, unit: 'px' }
                            ]
                        },
                        {
                            name: "Colors",
                            configs: [
                                { id: '--retro-link-button-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--retro-link-button-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--retro-link-button-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--retro-link-button-shadow-color', label: 'Shadow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        },
                        {
                            name: "States",
                            configs: [
                                { id: '--retro-link-button-hover-bg', label: 'Hover BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        }
                    ]
                },
                {
                    name: "Modern",
                    subsections: [
                        {
                            name: "Structure",
                            configs: [
                                { id: '--modern-link-button-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-md)', label: 'Medium'}, {value: '9999px', label: 'Pill'}] }
                            ]
                        },
                        {
                            name: "Colors",
                            configs: [
                                { id: '--modern-link-button-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--modern-link-button-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--modern-link-button-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        },
                        {
                            name: "States",
                            configs: [
                                { id: '--modern-link-button-hover-shadow', label: 'Hover Shadow', type: 'text' }
                            ]
                        }
                    ]
                },
                {
                    name: "Futuristic",
                    subsections: [
                        {
                            name: "Structure",
                            configs: [
                                { id: '--futuristic-link-button-clip-path', label: 'Clip Path', type: 'text' }
                            ]
                        },
                        {
                            name: "Colors",
                            configs: [
                                { id: '--futuristic-link-button-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--futuristic-link-button-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--futuristic-link-button-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        },
                        {
                            name: "States",
                            configs: [
                                { id: '--futuristic-link-button-hover-bg', label: 'Hover BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                                { id: '--futuristic-link-button-hover-glow', label: 'Hover Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
  },
  // --- CARD COMPONENT ---
  {
    name: "Card",
    id: 'card',
    scrollToId: 'component-card',
    subsections: [
        {
            name: "Initial",
            subsections: [
                {
                    name: "Structure",
                    configs: [
                        { id: '--card-padding', label: 'Padding', type: 'select', options: [ { value: 'var(--space-4)', label: 'Medium'}, { value: 'var(--space-6)', label: 'Large'}] },
                        { id: '--card-border-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-lg)', label: 'Large'}, {value: 'var(--border-radius-md)', label: 'Medium'}] },
                        { id: '--card-border-width', label: 'Border Width', type: 'text' }
                    ]
                },
                {
                    name: "Colors",
                    configs: [
                        { id: '--card-bg', label: 'Card BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                        { id: '--card-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                        { id: '--card-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                    ]
                },
                { name: "States", configs: [] }
            ]
        },
        {
            name: "Retro",
            subsections: [
                { name: "Structure", configs: [{ id: '--retro-shadow-offset', label: 'Shadow', type: 'range', min: 0, max: 12, unit: 'px' }] },
                { name: "Colors", configs: [
                    { id: '--retro-card-bg', label: 'Card BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                    { id: '--retro-card-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--retro-card-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                ] },
                { name: "States", configs: [] }
            ]
        },
        {
            name: "Modern",
            subsections: [
                 { name: "Structure", configs: [{ id: '--card-border-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-lg)', label: 'Large'}, {value: '1.5rem', label: 'XL'}] }] },
                 { name: "Colors", configs: [
                    { id: '--modern-card-bg', label: 'Card BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                    { id: '--modern-card-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--modern-card-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                ] },
                { name: "States", configs: [] }
            ]
        },
        {
            name: "Futuristic",
            subsections: [
                { name: "Structure", configs: [{ id: '--futuristic-glow', label: 'Glow', type: 'text' }] },
                { name: "Colors", configs: [
                    { id: '--futuristic-card-bg', label: 'Card BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                    { id: '--futuristic-card-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--futuristic-card-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                ] },
                { name: "States", configs: [] }
            ]
        }
    ]
  },
  // --- BADGE COMPONENT ---
  {
    name: "Badge",
    id: 'badge',
    scrollToId: 'component-badge',
    subsections: [
        { 
            name: "Initial", 
            subsections: [
                { name: "Structure", configs: [{ id: '--badge-padding-y', label: 'Padding Y', type: 'range', min: 0, max: 0.5, step: 0.05, unit: 'em' }, { id: '--badge-font-size', label: 'Size', type: 'range', min: 0.6, max: 1, step: 0.05, unit: 'rem' }, { id: '--badge-border-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-lg)', label: 'Large'}, {value: '2px', label: 'Small'}] }] },
                { name: "Colors", configs: [
                    { id: '--badge-primary-bg', label: 'Primary BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--badge-primary-color', label: 'Primary Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--badge-secondary-bg', label: 'Secondary BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--badge-secondary-color', label: 'Secondary Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--badge-accent-bg', label: 'Accent BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--badge-accent-color', label: 'Accent Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                ] },
                { name: "States", configs: [] }
            ]
        },
        { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-badge-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
        { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--modern-badge-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
        { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--futuristic-badge-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] }
    ]
  },
  // --- ALERT COMPONENT ---
  {
    name: "Alert",
    id: 'alert',
    scrollToId: 'component-alert',
    subsections: [
        { 
            name: "Initial", 
            subsections: [
                { name: "Structure", configs: [{ id: '--alert-padding-y', label: 'Padding Y', type: 'range', min: 0.5, max: 2, unit: 'rem' }, { id: '--alert-border-radius', label: 'Radius', type: 'select', options: [{value: 'var(--border-radius-md)', label: 'Medium'}, {value: 'var(--border-radius-lg)', label: 'Large'}] }] },
                { name: "Colors", configs: [
                    { id: '--alert-info-bg', label: 'Info BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--alert-info-color', label: 'Info Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--alert-success-bg', label: 'Success BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                    { id: '--alert-success-color', label: 'Success Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                ] },
                { name: "States", configs: [] }
            ]
        },
        { name: "Retro", subsections: [{ name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-alert-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] }] },
        { name: "Modern", subsections: [{ name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--modern-alert-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] }] },
        { name: "Futuristic", subsections: [{ name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--futuristic-alert-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] }] }
    ]
  },
  // --- FORM CONTROLS ---
  {
    name: "Form Controls",
    id: "form-controls",
    scrollToId: "component-switch",
    subsections: [
        {
            name: "Switch",
            subsections: [
                { 
                    name: "Initial", 
                    subsections: [
                        { name: "Structure", configs: [{ id: '--switch-width', label: 'Width', type: 'text' }, { id: '--switch-height', label: 'Height', type: 'text' }, { id: '--switch-handle-size', label: 'Handle Size', type: 'text' }] },
                        { name: "Colors", configs: [{ id: '--switch-bg-off', label: 'BG Off', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--switch-bg-on', label: 'BG On', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--switch-handle-color', label: 'Handle Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] },
                        { name: "States", configs: [] }
                    ]
                },
                { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-switch-bg-off', label: 'Off BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--retro-switch-bg-on', label: 'On BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--modern-switch-bg-off', label: 'Off BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--modern-switch-bg-on', label: 'On BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [{ id: '--futuristic-switch-glow', label: 'Glow Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] } ] }
            ]
        },
        {
            name: "Checkbox",
            subsections: [
                { 
                    name: "Initial", 
                    subsections: [
                        { name: "Structure", configs: [{ id: '--checkbox-size', label: 'Size', type: 'text' }, { id: '--checkbox-radius', label: 'Radius', type: 'text' }] },
                        { name: "Colors", configs: [{ id: '--checkbox-bg', label: 'BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--checkbox-border', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--checkbox-checked-bg', label: 'Checked BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--checkbox-check-color', label: 'Check Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] },
                        { name: "States", configs: [] }
                    ]
                },
                { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-checkbox-bg', label: 'BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--modern-checkbox-checked-bg', label: 'Checked BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [{ id: '--futuristic-checkbox-glow', label: 'Glow Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] } ] }
            ]
        },
        {
             name: "Slider",
             subsections: [
                 { 
                     name: "Initial", 
                     subsections: [
                         { name: "Structure", configs: [{ id: '--slider-track-height', label: 'Track Height', type: 'text' }, { id: '--slider-thumb-size', label: 'Thumb Size', type: 'text' }] },
                         { name: "Colors", configs: [{ id: '--slider-track-bg', label: 'Track BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--slider-thumb-color', label: 'Thumb Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] },
                         { name: "States", configs: [] }
                     ]
                 },
                 { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-slider-track-bg', label: 'Track BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--retro-slider-thumb-color', label: 'Thumb Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                 { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--slider-track-bg', label: 'Track BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                 { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [{ id: '--futuristic-slider-glow', label: 'Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] } ] }
             ]
        }
    ]
  },
  // --- DATA DISPLAY ---
  {
      name: "Data Display",
      id: "data-display",
      scrollToId: "component-table",
      subsections: [
          {
              name: "Table",
              subsections: [
                  { 
                      name: "Initial", 
                      subsections: [
                          { name: "Structure", configs: [{ id: '--table-padding-y', label: 'Cell Padding Y', type: 'text' }, { id: '--table-padding-x', label: 'Cell Padding X', type: 'text' }] },
                          { name: "Colors", configs: [{ id: '--table-header-bg', label: 'Header BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--table-header-color', label: 'Header Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] },
                          { name: "States", configs: [] }
                      ]
                  },
                  { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-table-header-bg', label: 'Header BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--retro-table-header-color', label: 'Header Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--retro-table-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                  { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--modern-table-stripe-bg', label: 'Stripe BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                  { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [{ id: '--futuristic-table-glow', label: 'Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] } ] }
              ]
          },
          {
              name: "Avatar",
              subsections: [
                  { 
                      name: "Initial", 
                      subsections: [
                          { name: "Structure", configs: [
                              { id: '--avatar-size', label: 'Size', type: 'text' }, 
                              { id: '--avatar-border-radius', label: 'Radius', type: 'text' },
                              { id: '--avatar-border-width', label: 'Border Width', type: 'text' }
                          ] },
                          { name: "Colors", configs: [
                              { id: '--avatar-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                              { id: '--avatar-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                              { id: '--avatar-border-color', label: 'Border Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                          ] },
                          { name: "States", configs: [] }
                      ]
                  },
                  { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-avatar-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                  { name: "Modern", subsections: [ { name: "Structure", configs: [{ id: '--modern-avatar-radius', label: 'Radius', type: 'text' }] }, { name: "Colors", configs: [] }, { name: "States", configs: [] } ] },
                  { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [{ id: '--futuristic-avatar-glow', label: 'Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] } ] }
              ]
          }
      ]
  },
  // --- NAVIGATION & TABS ---
  {
      name: "Navigation",
      id: "nav",
      scrollToId: "component-nav-menu",
      subsections: [
          {
              name: "Tabs",
              subsections: [
                  { 
                      name: "Initial", 
                      subsections: [
                          { name: "Structure", configs: [{ id: '--tab-font-size', label: 'Font Size', type: 'text' }, { id: '--tab-padding-y', label: 'Padding Y', type: 'text' }] },
                          { name: "Colors", configs: [{ id: '--tab-active-color', label: 'Active Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--tab-inactive-color', label: 'Inactive Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--tab-active-border-color', label: 'Active Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] },
                          { name: "States", configs: [] }
                      ]
                  },
                  { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-tab-active-bg', label: 'Active BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                  { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--modern-tab-active-color', label: 'Active Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                  { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--futuristic-tab-bg', label: 'Bar BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] }
              ]
          },
          {
              name: "Pagination",
              subsections: [
                  { 
                      name: "Initial", 
                      subsections: [
                          { name: "Structure", configs: [{ id: '--pagination-item-size', label: 'Size', type: 'text' }, { id: '--pagination-item-border-radius', label: 'Radius', type: 'text' }] },
                          { name: "Colors", configs: [{ id: '--pagination-item-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--pagination-item-hover-bg', label: 'Hover BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--pagination-item-active-bg', label: 'Active BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--pagination-item-active-color', label: 'Active Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] },
                          { name: "States", configs: [] }
                      ]
                  },
                  { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-pagination-bg', label: 'BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--retro-pagination-active-bg', label: 'Active BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                  { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--modern-pagination-active-color', label: 'Active Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                  { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [{ id: '--futuristic-pagination-glow', label: 'Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] } ] }
              ]
          },
          {
              name: "Breadcrumb",
              subsections: [
                  { 
                      name: "Initial", 
                      subsections: [
                          { name: "Structure", configs: [] },
                          { name: "Colors", configs: [{ id: '--breadcrumb-separator-color', label: 'Separator Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, { id: '--breadcrumb-active-color', label: 'Active Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] },
                          { name: "States", configs: [] }
                      ]
                  },
                  { name: "Retro", subsections: [ { name: "Structure", configs: [{ id: '--retro-breadcrumb-separator', label: 'Symbol', type: 'text' }] }, { name: "Colors", configs: [] }, { name: "States", configs: [] } ] },
                  { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--modern-breadcrumb-color', label: 'Link Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
                  { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [{ id: '--futuristic-breadcrumb-glow', label: 'Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] } ] }
              ]
          }
      ]
  },
  // --- FEEDBACK & OVERLAYS ---
  {
    name: "Feedback & Overlays",
    id: "overlays",
    scrollToId: "component-toast",
    subsections: [
      {
        name: "Toast",
        subsections: [
            { 
                name: "Initial", 
                subsections: [
                    { name: "Structure", configs: [
                        { id: '--toast-padding', label: 'Padding', type: 'text' },
                        { id: '--toast-border-radius', label: 'Radius', type: 'text' }
                    ] },
                    { name: "Colors", configs: [
                        { id: '--toast-bg', label: 'BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                        { id: '--toast-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                        { id: '--toast-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                    ] },
                    { name: "States", configs: [] }
                ]
            },
            { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [{ id: '--retro-toast-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }] }, { name: "States", configs: [] } ] },
            { name: "Modern", subsections: [ { name: "Structure", configs: [{ id: '--modern-toast-radius', label: 'Radius', type: 'text' }] }, { name: "Colors", configs: [] }, { name: "States", configs: [] } ] },
            { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [
                { id: '--futuristic-toast-glow', label: 'Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
            ] } ] }
        ]
      },
      {
        name: "Popover",
        subsections: [
            { 
                name: "Initial", 
                subsections: [
                    { name: "Structure", configs: [{ id: '--popover-padding', label: 'Padding', type: 'text' }, { id: '--popover-border-radius', label: 'Radius', type: 'text' }] },
                    { name: "Colors", configs: [
                        { id: '--popover-bg', label: 'BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                        { id: '--popover-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                        { id: '--popover-border-color', label: 'Border', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                        { id: '--popover-item-color', label: 'Item Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                        { id: '--popover-item-hover-bg', label: 'Item Hover BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                    ] },
                    { name: "States", configs: [] }
                ]
            },
            { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [] } ] },
            { name: "Modern", subsections: [ { name: "Structure", configs: [{ id: '--popover-shadow', label: 'Shadow', type: 'text' }] }, { name: "Colors", configs: [] }, { name: "States", configs: [] } ] },
            { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [
                { id: '--futuristic-popover-glow', label: 'Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
            ] } ] }
        ]
      },
      {
          name: "Tooltip",
          subsections: [
              { 
                  name: "Initial", 
                  subsections: [
                      { name: "Structure", configs: [
                          { id: '--tooltip-padding-y', label: 'Padding Y', type: 'text' },
                          { id: '--tooltip-padding-x', label: 'Padding X', type: 'text' },
                          { id: '--tooltip-font-size', label: 'Font Size', type: 'range', min: 0.75, max: 1, step: 0.0625, unit: 'rem' },
                          { id: '--tooltip-border-radius', label: 'Radius', type: 'text' }
                      ] },
                      { name: "Colors", configs: [
                          { id: '--tooltip-bg', label: 'BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }, 
                          { id: '--tooltip-color', label: 'Text', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
                      ] },
                      { name: "States", configs: [] }
                  ]
              },
              { name: "Retro", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [] } ] },
              { name: "Modern", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [] } ] },
              { name: "Futuristic", subsections: [ { name: "Structure", configs: [] }, { name: "Colors", configs: [] }, { name: "States", configs: [
                  { id: '--futuristic-tooltip-glow', label: 'Glow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
              ] } ] }
          ]
      }
    ]
  },
  // --- ADVANCED / MISC ---
  {
      name: "Advanced / Misc",
      id: "misc",
      scrollToId: "component-typography",
      subsections: [
          {
              name: "Scrollbar",
              configs: [
                  { id: '--scrollbar-track-bg', label: 'Track BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                  { id: '--scrollbar-thumb-bg', label: 'Thumb BG', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                  { id: '--scrollbar-thumb-hover-bg', label: 'Thumb Hover', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
              ]
          },
          {
              name: "Skeleton",
              configs: [
                  { id: '--skeleton-bg', label: 'Background', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                  { id: '--skeleton-border-radius', label: 'Border Radius', type: 'text' },
                  { id: '--skeleton-shimmer-color', label: 'Shimmer Color', type: 'select', options: semanticColorTokenOptions, purpose: 'color' }
              ]
          },
          {
              name: "Variant Overrides",
              configs: [
                  { id: '--retro-shadow-color', label: 'Retro Shadow', type: 'select', options: semanticColorTokenOptions, purpose: 'color' },
                  { id: '--modern-shadow', label: 'Modern Shadow', type: 'text', description: 'Full box-shadow string' },
              ]
          }
      ]
  }
];

const getErrorCount = (section: ThemeConfigSection, results: Record<string, AccessibilityResult>): number => {
    let count = 0;
    if (section.configs) {
        count += section.configs.reduce((acc, config) => {
             if (config.contrastFixerKey && results[config.contrastFixerKey]?.rating === 'FAIL') {
                return acc + 1;
             }
             return acc;
        }, 0);
    }
    if (section.subsections) {
        count += section.subsections.reduce((acc, sub) => acc + getErrorCount(sub, results), 0);
    }
    return count;
};

const SectionRenderer: React.FC<{
    section: ThemeConfigSection;
    depth: number;
    results: Record<string, AccessibilityResult>;
    renderConfigs: (configs: ThemeConfig[]) => React.ReactNode;
    handleToggle: (e: any, id?: string) => void;
    isRoot?: boolean;
    scrollToId?: string;
}> = ({ section, depth, results, renderConfigs, handleToggle, isRoot, scrollToId }) => {
    const errorCount = getErrorCount(section, results);
    const isOpen = isRoot && (section.name.startsWith('Palette') || section.name.startsWith('Primitives') || section.name.startsWith('Global'));
    const effectiveScrollToId = section.scrollToId || scrollToId;

    return (
        <details 
            className={`group ${depth === 0 ? 'border-b last:border-b-0 border-[var(--border-default)]' : 'mt-1'}`}
            open={isOpen}
            onToggle={(e) => handleToggle(e, effectiveScrollToId)}
        >
            <summary className={`
                list-none flex justify-between items-center cursor-pointer select-none transition-colors
                ${depth === 0 ? 'py-3 px-2 font-bold text-base hover:bg-[var(--bg-inset)] rounded-md' : ''}
                ${depth === 1 ? 'py-2 px-2 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border border-transparent hover:border-[var(--border-default)] mt-1' : ''}
                ${depth >= 2 ? 'py-1.5 px-2 rounded-md hover:bg-[var(--bg-inset)] text-sm font-medium text-[var(--text-default)] ml-3 border-l-2 border-[var(--border-default)] mt-1' : ''}
            `}>
               <span className="flex items-center gap-2">
                   {section.name}
                   {errorCount > 0 && <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white bg-[var(--fail)]">{errorCount}</span>}
               </span>
               <ChevronIcon className={`transition-transform duration-200 ${depth === 0 ? 'w-5 h-5' : 'w-4 h-4 opacity-50 group-open:rotate-90'}`} />
            </summary>
            <div className={`
                ${depth === 0 ? 'pt-2 pb-6 pl-2 pr-2' : ''}
                ${depth === 1 ? 'pt-2 pb-2 pl-1' : ''}
                ${depth >= 2 ? 'pt-2 pb-2 pl-2' : ''}
            `}>
                {section.configs && <div className="space-y-4 mb-2">{renderConfigs(section.configs)}</div>}
                {section.subsections && <div className={depth === 0 ? "space-y-3" : "space-y-1"}>{section.subsections.map((sub, idx) => <SectionRenderer key={idx} section={sub} depth={depth + 1} results={results} renderConfigs={renderConfigs} handleToggle={handleToggle} />)}</div>}
                {!section.configs && (!section.subsections || section.subsections.length === 0) && <p className="text-xs text-[var(--text-muted)] italic p-2">No settings available.</p>}
            </div>
        </details>
    )
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ theme, updateTheme, generateCss, generateJson, resetTheme, hasChanges, isDark, toggleTheme, customPresets, savePreset, deletePreset, applyPreset, fixContrast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState<'json' | 'css'>('css');
  const { results, isCheckerVisible, toggleCheckerVisibility } = useAccessibilityChecker();
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const presetMenuRef = useRef<HTMLDivElement>(null);
  const presetNameInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    if (!presetMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => { if (presetMenuRef.current && !presetMenuRef.current.contains(event.target as Node)) { setPresetMenuOpen(false); setIsSaving(false); } };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [presetMenuOpen]);
  
  useEffect(() => { if (isSaving && presetNameInputRef.current) presetNameInputRef.current.focus(); }, [isSaving]);

  const openModal = (tab: 'json' | 'css') => { setInitialModalTab(tab); setIsModalOpen(true); }
  
  const handleDetailsToggle = (event: React.SyntheticEvent<HTMLDetailsElement>, scrollToId: string | undefined) => {
    const detailsElement = event.currentTarget;
    if (detailsElement.open && scrollToId) {
        setTimeout(() => {
            const element = document.getElementById(scrollToId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('is-highlighted');
                setTimeout(() => element.classList.remove('is-highlighted'), 1200);
            }
        }, 150);
    }
  };
  
  const handleConfirmSave = () => {
    const name = newPresetName.trim();
    if (!name) { alert("Please enter a name for your preset."); return; }
    if (builtInPresets.some(p => p.name.toLowerCase() === name.toLowerCase())) { alert(`You cannot overwrite a built-in theme.`); return; }
    if (customPresets.some(p => p.name.toLowerCase() === name.toLowerCase()) && !window.confirm(`Overwrite "${name}"?`)) return;
    savePreset(name); setIsSaving(false); setNewPresetName('');
  };

  const renderConfigs = (configs: ThemeConfig[]) => {
      return configs.map(config => {
        const modeSuffix = isDark ? '-dark' : '-light';
        const isPrimitive = !(config.id in SEMANTIC_MAPPINGS);
        const themeKey = !isPrimitive ? `${config.id}${modeSuffix}` as keyof ThemeVariables : config.id as keyof ThemeVariables;
        const value = theme[themeKey] ?? '';
        const defaultValue = DEFAULT_THEME[themeKey] ?? '';
        return <InputControl key={`${config.id}-${isDark}`} config={config} value={value} isChanged={value !== defaultValue} onChange={(newValue) => updateTheme(themeKey, newValue)} onReset={() => updateTheme(themeKey, defaultValue)} onFixContrast={(bgColor) => fixContrast(themeKey, bgColor, allColorTokenValues)} theme={theme} />;
      })
  }
  
  return (
    <div className="p-6 h-full flex flex-col">
      <ExportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} generateCss={generateCss} generateJson={generateJson} initialTab={initialModalTab} themeConfig={themeConfig} />
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 scroll-area">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl font-bold">Theme Customizer</h2>
            <div className="flex items-center gap-1">
                 <button onClick={toggleCheckerVisibility} className="flex items-center justify-center w-10 h-10 rounded-full transition" style={{ backgroundColor: isCheckerVisible ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--bg-inset)', color: isCheckerVisible ? 'var(--color-primary)' : 'var(--text-default)' }}><A11yIcon /></button>
                <div className="relative" ref={presetMenuRef}>
                    <button onClick={() => setPresetMenuOpen(p => !p)} className="flex items-center justify-center w-10 h-10 rounded-full transition" style={{ backgroundColor: 'var(--bg-inset)' }}>🎨</button>
                    {presetMenuOpen && (
                        <ul className="popover absolute right-0 z-10 mt-2 w-56">
                            <li className="px-3 py-1 text-xs font-semibold" style={{ color: 'var(--text-muted)'}}>Built-in Themes</li>
                            {builtInPresets.map(p => <li key={p.name}><button className="popover-item w-full" onClick={() => { applyPreset(p.theme); setPresetMenuOpen(false); }}>{p.name}</button></li>)}
                            <hr className="my-1" style={{ borderColor: 'var(--border-default)' }}/>
                            <li className="px-3 py-1 text-xs font-semibold" style={{ color: 'var(--text-muted)'}}>Your Presets</li>
                            {customPresets.length === 0 && <li className="px-3 py-1 text-xs" style={{color: 'var(--text-muted)'}}>No presets saved.</li>}
                            {customPresets.map(p => <li key={p.name} className="flex items-center justify-between group"><button className="popover-item w-full" onClick={() => { applyPreset(p.theme); setPresetMenuOpen(false); }}>{p.name}</button><button onClick={() => deletePreset(p.name)} className="mr-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon /></button></li>)}
                            <hr className="my-1" style={{ borderColor: 'var(--border-default)' }}/>
                            {isSaving ? (<li><div className="p-2 space-y-2"><input ref={presetNameInputRef} type="text" placeholder="Preset name..." value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} className="w-full text-sm p-2 rounded-md" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border-color)', borderWidth: 'var(--border-width)', borderStyle: 'solid', color: 'var(--input-color)' }} onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSave(); }} /><div className="flex gap-2 justify-end"><button onClick={() => setIsSaving(false)} className="text-sm px-3 py-1 rounded-md" style={{ backgroundColor: 'var(--button-default-bg)', color: 'var(--button-default-color)' }}>Cancel</button><button onClick={handleConfirmSave} className="primary text-sm px-3 py-1">Save</button></div></div></li>) : (<li><button onClick={() => { setPresetMenuOpen(true); setIsSaving(true); setNewPresetName(''); }} className="popover-item w-full">Save Current As Preset...</button></li>)}
                        </ul>
                    )}
                </div>
                <button onClick={toggleTheme} className="flex items-center justify-center w-10 h-10 rounded-full transition" style={{ backgroundColor: 'var(--bg-inset)'}}>{isDark ? <SunIcon /> : <MoonIcon />}</button>
            </div>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Define your color palette, then map them to semantic roles.</p>
        <hr className="mb-6 -mx-2" style={{ borderColor: 'var(--border-default)'}} />
        <div className="space-y-2 accordion">
          {themeConfig.map(category => <SectionRenderer key={category.name} section={category} depth={0} renderConfigs={renderConfigs} results={results} handleToggle={handleDetailsToggle} isRoot={true} scrollToId={category.scrollToId} />)}
        </div>
      </div>
      <div className="mt-6 pt-6 grid grid-cols-2 gap-3" style={{ borderTop: `1px solid var(--border-default)` }}>
        <button onClick={() => { setPresetMenuOpen(true); setIsSaving(true); }} disabled={!hasChanges} className="primary w-full col-span-2 flex items-center justify-center gap-2 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition disabled:opacity-50 disabled:cursor-not-allowed">Save Changes</button>
        <button onClick={() => openModal('css')} className="w-full flex items-center justify-center gap-2 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition" style={{ backgroundColor: 'var(--button-default-bg)', color: 'var(--button-default-color)', borderColor: 'var(--button-default-border-color)' }}><FileCssIcon />Export CSS</button>
        <button onClick={() => openModal('json')} className="w-full flex items-center justify-center gap-2 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition" style={{ backgroundColor: 'var(--button-default-bg)', color: 'var(--button-default-color)', borderColor: 'var(--button-default-border-color)' }}><CodeIcon />Copy Tokens</button>
        <button onClick={resetTheme} disabled={!hasChanges} style={{ color: 'var(--text-default)', backgroundColor: 'var(--button-default-bg)', borderColor: 'var(--button-default-border-color)' }} className="w-full col-span-2 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition disabled:opacity-50 disabled:cursor-not-allowed">Reset</button>
      </div>
    </div>
  );
};