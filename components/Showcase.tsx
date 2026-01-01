import React, { MutableRefObject, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ContrastCheckerBadge } from './ContrastCheckerBadge';
import { ThemeVariables } from '../hooks/useTheme';
import { Toast } from './Toast';
import { VariantKey } from '../types';
import { VARIANT_META } from '../variants';

interface ShowcaseProps {
    theme: ThemeVariables;
    isDark: boolean;
    visibleVariants: Set<VariantKey>;
}

const buildContrastKey = (...parts: (string | number | undefined)[]) =>
    parts
        .filter(part => part !== undefined && part !== null)
        .map(part => String(part).toLowerCase().replace(/[^a-z0-9]+/g, '-'))
        .filter(Boolean)
        .join('-');

interface ContrastTargetProps {
    theme: ThemeVariables;
    isDark: boolean;
    uniqueKey: string;
    categoryKey: string;
    children: React.ReactElement;
    wrapperAs?: keyof React.JSX.IntrinsicElements;
    wrapperClassName?: string;
}

const ContrastTarget: React.FC<ContrastTargetProps> = ({
    theme,
    isDark,
    uniqueKey,
    categoryKey,
    children,
    wrapperAs = 'div',
    wrapperClassName,
}) => {
    const targetRef = useRef<HTMLElement | null>(null);
    const childRef = (children as any).ref;

    const assignRef = (node: HTMLElement | null) => {
        targetRef.current = node;
        if (typeof childRef === 'function') childRef(node);
        else if (childRef && typeof childRef === 'object') {
            (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }
    };

    const childClassName = ['contrast-target-child', children.props.className]
        .filter(Boolean)
        .join(' ')
        .trim();

    const clonedChild = React.cloneElement(children, {
        ref: assignRef,
        className: childClassName,
    });

    const WrapperTag = wrapperAs;

    return (
        <WrapperTag
            className={`contrast-target-wrapper relative inline-flex w-full items-start ${wrapperClassName ?? ''}`.trim()}
        >
            {clonedChild}
            <span className="contrast-badge-anchor pointer-events-none absolute -top-2 right-0 z-20 rounded-full bg-[color-mix(in srgb, var(--bg-default) 80%, transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-default)] shadow-sm">
                <ContrastCheckerBadge
                    targetRef={targetRef}
                    theme={theme}
                    isDark={isDark}
                    uniqueKey={uniqueKey}
                    categoryKey={categoryKey}
                />
            </span>
        </WrapperTag>
    );
};

export const Showcase: React.FC<ShowcaseProps> = ({ theme, isDark, visibleVariants }) => {
  const [toasts, setToasts] = useState<{id: number, message: string, status: 'success' | 'danger'}[]>([]);
  const [playgroundText, setPlaygroundText] = useState('The quick brown fox jumps over the lazy dog.');
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [popoverVisible, setPopoverVisible] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<string>('');

  const addToast = (status: 'success' | 'danger') => {
    const message = status === 'success' ? 'Changes saved successfully!' : 'Failed to save changes.';
    setToasts(t => [...t, { id: Date.now(), message, status }]);
  };
  
  const dismissToast = (id: number) => {
    setToasts(t => t.filter(toast => toast.id !== id));
  };

  const showDemoToast = (variant: string = '') => {
    const container = document.getElementById('toast-viewport');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${variant}`.trim();
    toast.innerHTML = `
      <span>✓</span>
      <span>${variant || 'Default'} toast notification!</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toast-slide-in 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

    const variantOptions = VARIANT_META;
    const filteredVariants = variantOptions.filter(variant => visibleVariants.has(variant.key));
    const activeVariants = filteredVariants.length ? filteredVariants : variantOptions;
    const variantSummary = activeVariants.map(v => v.key).join(' ');

    const wrapContrast = (
        element: React.ReactElement,
        uniqueKey: string,
        categoryKey: string,
        options?: Pick<ContrastTargetProps, 'wrapperAs' | 'wrapperClassName'>
    ) => (
        <ContrastTarget
            theme={theme}
            isDark={isDark}
            uniqueKey={uniqueKey}
            categoryKey={categoryKey}
            {...options}
        >
            {element}
        </ContrastTarget>
    );

  return (
    <div className="space-y-12 pb-20">
        {ReactDOM.createPortal(
          toasts.map(toast => <Toast key={toast.id} {...toast} onDismiss={() => dismissToast(toast.id)} />),
          document.getElementById('toast-viewport')!
        )}

        <div className="text-center pb-4 border-b border-[var(--border-default)]">
            {wrapContrast(
                <h1 className="font-bold tracking-tight">Design System Showcase</h1>,
                buildContrastKey('hero', 'heading'),
                'component-typography',
                { wrapperClassName: 'inline-block' }
            )}
            <div className="mt-4 max-w-2xl mx-auto">
                {wrapContrast(
                    <p className="text-lg text-[var(--text-muted)]">
                        Comprehensive Matrix: 4 Styles × All Components.
                    </p>,
                    buildContrastKey('hero', 'subtitle'),
                    'component-typography',
                    { wrapperClassName: 'inline-block w-full' }
                )}
            </div>
        </div>
        
        {/* --- TYPOGRAPHY --- */}
        <div className="card" id="component-typography">
            <h2>Typography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-baseline gap-4 border-b border-[var(--border-default)] pb-2">
                        <span className="text-[var(--text-muted)] w-16 text-xs font-mono">H1</span>
                        {wrapContrast(
                            <h1>Heading 1</h1>,
                            buildContrastKey('typography', 'sample', 'h1'),
                            'component-typography'
                        )}
                    </div>
                    <div className="flex items-baseline gap-4 border-b border-[var(--border-default)] pb-2">
                        <span className="text-[var(--text-muted)] w-16 text-xs font-mono">H2</span>
                        {wrapContrast(
                            <h2>Heading 2</h2>,
                            buildContrastKey('typography', 'sample', 'h2'),
                            'component-typography'
                        )}
                    </div>
                    <div className="flex items-baseline gap-4 border-b border-[var(--border-default)] pb-2">
                        <span className="text-[var(--text-muted)] w-16 text-xs font-mono">H3</span>
                        {wrapContrast(
                            <h3>Heading 3</h3>,
                            buildContrastKey('typography', 'sample', 'h3'),
                            'component-typography'
                        )}
                    </div>
                    <div className="flex items-baseline gap-4 border-b border-[var(--border-default)] pb-2">
                        <span className="text-[var(--text-muted)] w-16 text-xs font-mono">Link</span>
                        {wrapContrast(
                            <a href="#">Sample Link</a>,
                            buildContrastKey('typography', 'sample', 'link'),
                            'component-link',
                            { wrapperClassName: 'inline-flex w-auto' }
                        )}
                    </div>
                </div>
                <div className="bg-[var(--bg-inset)] p-4 rounded-lg border border-[var(--border-default)]">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2 block">Font Families</label>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs text-[var(--text-muted)] mb-1">Display Font</div>
                            {wrapContrast(
                                <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-family-display)' }}>The quick brown fox</p>,
                                buildContrastKey('typography', 'font', 'display'),
                                'component-typography'
                            )}
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-muted)] mb-1">Sans-serif Font</div>
                            {wrapContrast(
                                <p className="text-base" style={{ fontFamily: 'var(--font-family-sans)' }}>The quick brown fox jumps</p>,
                                buildContrastKey('typography', 'font', 'sans'),
                                'component-typography'
                            )}
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-muted)] mb-1">Monospace Font</div>
                            {wrapContrast(
                                <p className="text-sm" style={{ fontFamily: 'var(--font-family-mono)' }}>console.log('Hello');</p>,
                                buildContrastKey('typography', 'font', 'mono'),
                                'component-typography'
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- GRID SYSTEM --- */}
        <div className="card" id="component-grid">
            <h2>Grid System</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Responsive grid with customizable gap and column width.</p>
            <div className="grid-system">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <React.Fragment key={`grid-item-${i}`}>
                        {wrapContrast(
                            <div className="grid-item">Grid Item {i}</div>,
                            buildContrastKey('grid', 'item', i),
                            'component-grid'
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
        
        {/* --- BUTTONS --- */}
        <div className="card" id="component-button">
            <h2>Buttons</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border-default)]">
                            <th className="py-2 text-[var(--text-muted)] font-normal">Variant</th>
                            <th className="py-2 text-[var(--text-muted)] font-normal">Primary</th>
                            <th className="py-2 text-[var(--text-muted)] font-normal">Secondary</th>
                            <th className="py-2 text-[var(--text-muted)] font-normal">Accent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)]">
                        {activeVariants.map(v => (
                            <tr key={v.name}>
                                <td className="py-4 font-medium text-sm pr-4">{v.name}</td>
                                <td className="py-4 pr-4">
                                    {wrapContrast(
                                        <button className={`${v.className} primary`}>Primary</button>,
                                        buildContrastKey('button', v.key, 'primary'),
                                        'component-button'
                                    )}
                                </td>
                                <td className="py-4 pr-4">
                                    {wrapContrast(
                                        <button className={`${v.className} secondary`}>Secondary</button>,
                                        buildContrastKey('button', v.key, 'secondary'),
                                        'component-button'
                                    )}
                                </td>
                                <td className="py-4 pr-4">
                                    {wrapContrast(
                                        <button className={`${v.className} accent`}>Accent</button>,
                                        buildContrastKey('button', v.key, 'accent'),
                                        'component-button'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- LINKS --- */}
        <div className="card" id="component-link">
            <h2>Links</h2>
            
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Text Links - All Variants</h3>
                <div className="space-y-4">
                    {activeVariants.map(v => (
                        <div key={`text-link-${v.key}`}>
                            <strong>{v.name}:</strong> This is a paragraph with {wrapContrast(
                                <a href="#" className={['link', v.className].filter(Boolean).join(' ')}>an {v.name.toLowerCase()} link</a>,
                                buildContrastKey('link', v.key, 'text'),
                                'component-link',
                                { wrapperAs: 'span', wrapperClassName: 'inline-flex align-middle ml-1' }
                            )} inside it.
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Links Styled as Buttons</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">Links can use the same classes as buttons for consistency.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border-default)]">
                                <th className="py-2 text-[var(--text-muted)] font-normal">Variant</th>
                                <th className="py-2 text-[var(--text-muted)] font-normal">Primary</th>
                                <th className="py-2 text-[var(--text-muted)] font-normal">Secondary</th>
                                <th className="py-2 text-[var(--text-muted)] font-normal">Accent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-default)]">
                            {activeVariants.map(v => (
                                <tr key={v.name}>
                                    <td className="py-4 font-medium text-sm pr-4">{v.name}</td>
                                    <td className="py-4 pr-4">
                                        {wrapContrast(
                                            <a href="#" className={`button ${v.className} primary`}>Primary Link</a>,
                                            buildContrastKey('link-button', v.key, 'primary'),
                                            'component-link',
                                            { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                                        )}
                                    </td>
                                    <td className="py-4 pr-4">
                                        {wrapContrast(
                                            <a href="#" className={`button ${v.className} secondary`}>Secondary Link</a>,
                                            buildContrastKey('link-button', v.key, 'secondary'),
                                            'component-link',
                                            { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                                        )}
                                    </td>
                                    <td className="py-4 pr-4">
                                        {wrapContrast(
                                            <a href="#" className={`button ${v.className} accent`}>Accent Link</a>,
                                            buildContrastKey('link-button', v.key, 'accent'),
                                            'component-link',
                                            { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* --- INPUTS --- */}
        <div className="card" id="component-input" data-variants={variantSummary}>
            <h2>Inputs</h2>
            <p className="text-xs text-[var(--text-muted)]" aria-hidden="true">
                Variants previewed: {activeVariants.map(v => v.name).join(', ')}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {activeVariants.map(v => (
                    <div key={v.name} className="space-y-2">
                        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">{v.name}</h3>
                        {wrapContrast(
                            <input type="text" className={v.className} placeholder="Type something..." />,
                            buildContrastKey('input', v.key, 'text'),
                            'component-input',
                            { wrapperClassName: 'w-full' }
                        )}
                        {wrapContrast(
                            <select className={v.className}>
                                <option>Option 1</option>
                                <option>Option 2</option>
                            </select>,
                            buildContrastKey('input', v.key, 'select'),
                            'component-input',
                            { wrapperClassName: 'w-full' }
                        )}
                        {wrapContrast(
                            <textarea className={v.className} rows={3} placeholder="Write more..."></textarea>,
                            buildContrastKey('input', v.key, 'textarea'),
                            'component-input',
                            { wrapperClassName: 'w-full' }
                        )}
                        {wrapContrast(
                            <input type="text" className={v.className} placeholder="Disabled input" disabled />,
                            buildContrastKey('input', v.key, 'text-disabled'),
                            'component-input',
                            { wrapperClassName: 'w-full' }
                        )}
                    </div>
                 ))}
            </div>
            
            <h3 className="mt-8 mb-4">Form Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="component-form">
                {activeVariants.map(v => (
                    <div key={v.name} className="space-y-4 p-4 border border-[var(--border-default)] rounded-lg bg-[var(--bg-inset)]">
                         <h4 className="text-xs font-bold uppercase">{v.name}</h4>
                         {wrapContrast(
                             <label className="flex items-center gap-2">
                                 <input type="checkbox" className={v.className} defaultChecked />
                                 <span className="text-sm">Checkbox</span>
                             </label>,
                             buildContrastKey('form-control', v.key, 'checkbox'),
                             'component-input',
                             { wrapperClassName: 'w-full' }
                         )}
                         {wrapContrast(
                             <div className="flex items-center gap-2">
                                 <input type="checkbox" role="switch" className={v.className} defaultChecked />
                                 <span className="text-sm">Switch</span>
                             </div>,
                             buildContrastKey('form-control', v.key, 'switch'),
                             'component-input',
                             { wrapperClassName: 'w-full' }
                         )}
                         {wrapContrast(
                             <div>
                                 <input type="range" className={v.className} defaultValue="50" />
                             </div>,
                             buildContrastKey('form-control', v.key, 'range'),
                             'component-input',
                             { wrapperClassName: 'w-full' }
                         )}
                    </div>
                ))}
            </div>
        </div>

        {/* --- CARDS --- */}
        <div className="card bg-transparent border-none shadow-none p-0" id="component-card">
            <h2>Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeVariants.map(v => (
                    <React.Fragment key={v.name}>
                        {wrapContrast(
                            <div className={`card ${v.className}`}>
                                <h3 className="mt-0">{v.name}</h3>
                                <p className="text-sm text-opacity-80">This is a card component demonstrating the {v.name.toLowerCase()} style variant.</p>
                                {wrapContrast(
                                    <button className={`primary ${v.className} text-xs px-3 py-1 mt-2`}>Action</button>,
                                    buildContrastKey('card', v.key, 'action-button'),
                                    'component-button',
                                    { wrapperClassName: 'inline-flex w-auto mt-2' }
                                )}
                            </div>,
                            buildContrastKey('card', v.key, 'container'),
                            'component-card'
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>

        {/* --- BADGES --- */}
        <div className="card" id="component-badge">
            <h2>Badges</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border-default)]">
                            <th className="py-2 text-[var(--text-muted)] font-normal">Variant</th>
                            <th className="py-2 text-[var(--text-muted)] font-normal">Primary</th>
                            <th className="py-2 text-[var(--text-muted)] font-normal">Secondary</th>
                            <th className="py-2 text-[var(--text-muted)] font-normal">Accent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)]">
                        {activeVariants.map(v => (
                            <tr key={v.name}>
                                <td className="py-4 font-medium text-sm pr-4">{v.name}</td>
                                <td className="py-4 pr-4">
                                    {wrapContrast(
                                        <span className={`badge ${v.className} primary`}>Primary</span>,
                                        buildContrastKey('badge', v.key, 'primary'),
                                        'component-badge',
                                        { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                                    )}
                                </td>
                                <td className="py-4 pr-4">
                                    {wrapContrast(
                                        <span className={`badge ${v.className} secondary`}>Secondary</span>,
                                        buildContrastKey('badge', v.key, 'secondary'),
                                        'component-badge',
                                        { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                                    )}
                                </td>
                                <td className="py-4 pr-4">
                                    {wrapContrast(
                                        <span className={`badge ${v.className} accent`}>Accent</span>,
                                        buildContrastKey('badge', v.key, 'accent'),
                                        'component-badge',
                                        { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* --- ALERTS --- */}
        <div className="card" id="component-alert">
            <h2>Alerts</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeVariants.map(v => (
                    <div key={v.name} className="space-y-2">
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        {['info', 'success', 'warning', 'danger'].map(status => (
                            <React.Fragment key={status}>
                                {wrapContrast(
                                    <div className={`alert ${v.className}`} data-status={status}><span className="text-sm">{status.charAt(0).toUpperCase() + status.slice(1)} Message</span></div>,
                                    buildContrastKey('alert', v.key, status),
                                    'component-alert',
                                    { wrapperClassName: 'w-full' }
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
        </div>

        {/* --- TABS & NAV --- */}
        <div className="card" id="component-tabs">
            <h2>Tabs</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {activeVariants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <div className={`tabs ${v.className}`} role="tablist">
                            {wrapContrast(
                                <button role="tab" className="tab" aria-selected="true">Account</button>,
                                buildContrastKey('tabs', v.key, 'account'),
                                'component-tabs',
                                { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                            )}
                            {wrapContrast(
                                <button role="tab" className="tab" aria-selected="false">Settings</button>,
                                buildContrastKey('tabs', v.key, 'settings'),
                                'component-tabs',
                                { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                            )}
                            {wrapContrast(
                                <button role="tab" className="tab" aria-selected="false">Billing</button>,
                                buildContrastKey('tabs', v.key, 'billing'),
                                'component-tabs',
                                { wrapperAs: 'span', wrapperClassName: 'inline-flex w-auto' }
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* --- TABLES --- */}
        <div className="card" id="component-table">
            <h2>Tables</h2>
            <div className="grid grid-cols-1 gap-8">
                 {activeVariants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <div className="overflow-x-auto">
                            {wrapContrast(
                                <table className={v.className}>
                                    <thead>
                                        <tr><th>Name</th><th>Role</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Alice</td><td>Admin</td><td>Active</td></tr>
                                        <tr><td>Bob</td><td>Editor</td><td>Inactive</td></tr>
                                    </tbody>
                                </table>,
                                buildContrastKey('table', v.key),
                                'component-table',
                                { wrapperClassName: 'w-full' }
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* --- PAGINATION --- */}
        <div className="card" id="component-pagination">
            <h2>Pagination</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeVariants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <ul className={`pagination ${v.className}`}>
                            {['prev', '1', '2', '3', 'next'].map(item => {
                                const isActive = item === '1';
                                const display = item === 'prev' ? '<' : item === 'next' ? '>' : item;
                                return (
                                    <React.Fragment key={item}>
                                        {wrapContrast(
                                            <span>{display}</span>,
                                            buildContrastKey('pagination', v.key, item),
                                            'component-pagination',
                                            { wrapperAs: 'li', wrapperClassName: `pagination-item ${isActive ? 'active' : ''} inline-flex w-auto` }
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
        
        {/* --- BREADCRUMBS --- */}
        <div className="card" id="component-breadcrumb">
            <h2>Breadcrumbs</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeVariants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <nav className={`breadcrumb ${v.className}`}>
                            {['Home', 'Library', 'Data'].map((label, index) => {
                                const isActive = index === 2;
                                const child = isActive ? <span>{label}</span> : <a href="#">{label}</a>;
                                return (
                                    <React.Fragment key={label}>
                                        {wrapContrast(
                                            child,
                                            buildContrastKey('breadcrumb', v.key, label.toLowerCase()),
                                            'component-breadcrumb',
                                            { wrapperAs: 'span', wrapperClassName: `breadcrumb-item ${isActive ? 'active' : ''} inline-flex w-auto` }
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>
        </div>

        {/* --- AVATARS --- */}
        <div className="card" id="component-avatar">
            <h2>Avatars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeVariants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <div className="flex gap-2">
                            {['JD', 'AB', 'XY'].map(initials => (
                                <React.Fragment key={initials}>
                                    {wrapContrast(
                                        <div className={`avatar ${v.className}`}>{initials}</div>,
                                        buildContrastKey('avatar', v.key, initials.toLowerCase()),
                                        'component-avatar',
                                        { wrapperClassName: 'inline-flex w-auto' }
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- TOOLTIPS --- */}
        <div className="card" id="component-tooltip">
            <h2>Tooltips</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Hover the buttons to preview contextual helpers per variant.</p>
            <div className="flex gap-4 flex-wrap">
                {activeVariants.map(v => (
                    <div key={v.name} className="relative inline-block">
                        {wrapContrast(
                            <button 
                                className={v.className}
                                onMouseEnter={() => setTooltipVisible(v.className || 'default')}
                                onMouseLeave={() => setTooltipVisible(null)}
                            >
                                {v.name}
                            </button>,
                            buildContrastKey('tooltip', v.key, 'trigger'),
                            'component-tooltip',
                            { wrapperClassName: 'inline-flex w-auto' }
                        )}
                        {tooltipVisible === (v.className || 'default') && (
                            wrapContrast(
                                <div className={`tooltip ${v.className} show`} data-placement="top" style={{bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)'}}>
                                    {v.name} tooltip
                                </div>,
                                buildContrastKey('tooltip', v.key, 'overlay'),
                                'component-tooltip',
                                { wrapperClassName: 'inline-block w-auto' }
                            )
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* --- POPOVERS --- */}
        <div className="card" id="component-popover">
            <h2>Popovers</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Click to toggle popovers styled for each aesthetic.</p>
            <div className="flex gap-4 flex-wrap">
                {activeVariants.map(v => (
                    <div key={v.name} className="relative inline-block">
                        {wrapContrast(
                            <button 
                                className={v.className}
                                onClick={() => setPopoverVisible(popoverVisible === v.className ? null : v.className)}
                            >
                                {v.name}
                            </button>,
                            buildContrastKey('popover', v.key, 'trigger'),
                            'component-popover',
                            { wrapperClassName: 'inline-flex w-auto' }
                        )}
                        {popoverVisible === v.className && (
                            wrapContrast(
                                <div className={`popover ${v.className}`} style={{top: 'calc(100% + 8px)', left: 0, zIndex: 100}}>
                                    <div className="popover-header">{v.name} Popover</div>
                                    <div>This is {v.name.toLowerCase()} popover content with detailed information.</div>
                                </div>,
                                buildContrastKey('popover', v.key, 'overlay'),
                                'component-popover',
                                { wrapperClassName: 'inline-block w-auto' }
                            )
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* --- SKELETONS --- */}
        <div className="card" id="component-skeleton">
            <h2>Skeleton Loaders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeVariants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-3">{v.name}</h3>
                        <div className={`skeleton ${v.className}`} style={{height: '100px', width: '100%'}}></div>
                        <div className={`skeleton ${v.className} mt-2`} style={{height: '20px', width: '80%'}}></div>
                        <div className={`skeleton ${v.className} mt-2`} style={{height: '20px', width: '60%'}}></div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- TOAST DEMO --- */}
        <div className="card" id="component-toast">
            <h2>Toast Notifications</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Click buttons to see toast notifications with different styles.</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {activeVariants.map(v => (
                    <React.Fragment key={v.name}>
                        {wrapContrast(
                            <button 
                                onClick={() => showDemoToast(v.className)} 
                                className={`${v.className} primary`}
                            >
                                {v.name} Toast
                            </button>,
                            buildContrastKey('toast', v.key, 'trigger'),
                            'component-toast',
                            { wrapperClassName: 'inline-flex w-auto' }
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
    );
};