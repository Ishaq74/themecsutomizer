import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import fs from 'fs';
import path from 'path';

import { AccessibilityCheckerProvider, useAccessibilityChecker } from '../../hooks/useAccessibilityChecker';

const ManualRegistrar: React.FC = () => {
  const { registerResult, unregisterResult, isCheckerVisible } = useAccessibilityChecker();

  React.useEffect(() => {
    if (!isCheckerVisible) return;
    registerResult('body-text', { rating: 'FAIL', categoryKey: 'tests', backgroundColor: '#000000' });
    return () => unregisterResult('body-text');
  }, [isCheckerVisible, registerResult, unregisterResult]);

  return null;
};

const VisibilityProbe: React.FC = () => {
  const { results, toggleCheckerVisibility } = useAccessibilityChecker();
  return (
    <div>
      <span data-testid="result-keys">{Object.keys(results).join(',')}</span>
      <button type="button" data-testid="toggle-visibility" onClick={toggleCheckerVisibility}>
        Toggle Visibility
      </button>
    </div>
  );
};

describe('Accessibility checker runtime behaviour', () => {
  it('registers results and clears them when the checker is toggled', async () => {
    render(
      <AccessibilityCheckerProvider>
        <ManualRegistrar />
        <VisibilityProbe />
      </AccessibilityCheckerProvider>
    );

    await waitFor(() => expect(screen.getByTestId('result-keys').textContent).toContain('body-text'));

    fireEvent.click(screen.getByTestId('toggle-visibility'));

    await waitFor(() => expect(screen.getByTestId('result-keys').textContent).toBe(''));
  });
});

describe('Accessibility wiring metadata', () => {
  let customizerContent: string;
  let showcaseContent: string;

  beforeAll(() => {
    customizerContent = fs.readFileSync(path.join(process.cwd(), 'components/ThemeCustomizer.tsx'), 'utf8');
    showcaseContent = fs.readFileSync(path.join(process.cwd(), 'components/Showcase.tsx'), 'utf8');
  });

  it('ties Body Text control to the body-text checker key', () => {
    expect(customizerContent).toMatch(/id:\s*'--text-default'[\s\S]*contrastFixerKey:\s*'body-text'/);
  });

  it('ties heading color control to the hero heading checker', () => {
    expect(customizerContent).toMatch(/id:\s*'--heading-color'[\s\S]*contrastFixerKey:\s*'h1'/);
  });

  it('ties button colors to their checker keys', () => {
    expect(customizerContent).toMatch(/id:\s*'--button-default-color'[\s\S]*contrastFixerKey:\s*'button-default'/);
    expect(customizerContent).toMatch(/id:\s*'--button-primary-color'[\s\S]*contrastFixerKey:\s*'button-primary'/);
  });

  it('ties card text color to its checker key', () => {
    expect(customizerContent).toMatch(/id:\s*'--card-color'[\s\S]*contrastFixerKey:\s*'card-body'/);
  });

  it('applies inline contrast markers across core showcase components', () => {
    expect(showcaseContent).not.toContain('component-accessibility');
    [
      "buildContrastKey('hero'",
      "buildContrastKey('typography'",
      "buildContrastKey('button'",
      "buildContrastKey('link'",
      "buildContrastKey('input'",
      "buildContrastKey('card'",
      "buildContrastKey('alert'",
    ].forEach(token => {
      expect(showcaseContent).toContain(token);
    });
    [
      'component-typography',
      'component-button',
      'component-link',
      'component-input',
      'component-card',
      'component-alert',
    ].forEach(category => {
      expect(showcaseContent).toContain(category);
    });
  });
});
