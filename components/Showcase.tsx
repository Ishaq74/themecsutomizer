import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ContrastCheckerBadge } from './ContrastCheckerBadge';
import { ThemeVariables } from '../hooks/useTheme';
import { Toast } from './Toast';
import { ChevronIcon } from './Icons';

interface ShowcaseProps {
    theme: ThemeVariables;
    isDark: boolean;
}

export const Showcase: React.FC<ShowcaseProps> = ({ theme, isDark }) => {
  const [toasts, setToasts] = useState<{id: number, message: string, status: 'success' | 'danger'}[]>([]);
  const [playgroundText, setPlaygroundText] = useState('The quick brown fox jumps over the lazy dog.');
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [popoverVisible, setPopoverVisible] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<string>('');
  
  // Refs for contrast
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const btnStandardRef = useRef<HTMLButtonElement>(null);

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

  const variants = [
      { name: 'Initial', className: '' },
      { name: 'Retro', className: 'retro' },
      { name: 'Modern', className: 'modern' },
      { name: 'Futuristic', className: 'futuristic' },
  ];

  return (
    <div className="space-y-12 pb-20">
        {ReactDOM.createPortal(
          toasts.map(toast => <Toast key={toast.id} {...toast} onDismiss={() => dismissToast(toast.id)} />),
          document.getElementById('toast-viewport')!
        )}

        <div className="text-center pb-4 border-b border-[var(--border-default)]">
            <div className="relative inline-block">
                <h1 ref={h1Ref} className="font-bold tracking-tight">Design System Showcase</h1>
                <ContrastCheckerBadge targetRef={h1Ref} theme={theme} isDark={isDark} uniqueKey="h1" categoryKey="component-typography" />
            </div>
            <div className="relative inline-block mt-4 max-w-2xl mx-auto">
                <p ref={pRef} className="text-lg text-[var(--text-muted)]">
                    Comprehensive Matrix: 4 Styles × All Components.
                </p>
                <ContrastCheckerBadge targetRef={pRef} theme={theme} isDark={isDark} uniqueKey="subtitle" categoryKey="component-typography" />
            </div>
        </div>
        
        {/* --- TYPOGRAPHY --- */}
        <div className="card" id="component-typography">
            <h2>Typography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-baseline gap-4 border-b border-[var(--border-default)] pb-2">
                        <span className="text-[var(--text-muted)] w-16 text-xs font-mono">H1</span>
                        <h1>Heading 1</h1>
                    </div>
                    <div className="flex items-baseline gap-4 border-b border-[var(--border-default)] pb-2">
                        <span className="text-[var(--text-muted)] w-16 text-xs font-mono">H2</span>
                        <h2>Heading 2</h2>
                    </div>
                    <div className="flex items-baseline gap-4 border-b border-[var(--border-default)] pb-2">
                        <span className="text-[var(--text-muted)] w-16 text-xs font-mono">H3</span>
                        <h3>Heading 3</h3>
                    </div>
                    <div className="flex items-baseline gap-4 border-b border-[var(--border-default)] pb-2">
                        <span className="text-[var(--text-muted)] w-16 text-xs font-mono">Link</span>
                        <a href="#">Sample Link</a>
                    </div>
                </div>
                <div className="bg-[var(--bg-inset)] p-4 rounded-lg border border-[var(--border-default)]">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2 block">Font Families</label>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs text-[var(--text-muted)] mb-1">Display Font</div>
                            <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-family-display)' }}>The quick brown fox</p>
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-muted)] mb-1">Sans-serif Font</div>
                            <p className="text-base" style={{ fontFamily: 'var(--font-family-sans)' }}>The quick brown fox jumps</p>
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-muted)] mb-1">Monospace Font</div>
                            <p className="text-sm" style={{ fontFamily: 'var(--font-family-mono)' }}>console.log('Hello');</p>
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
                <div className="grid-item">Grid Item 1</div>
                <div className="grid-item">Grid Item 2</div>
                <div className="grid-item">Grid Item 3</div>
                <div className="grid-item">Grid Item 4</div>
                <div className="grid-item">Grid Item 5</div>
                <div className="grid-item">Grid Item 6</div>
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
                        {variants.map(v => (
                            <tr key={v.name}>
                                <td className="py-4 font-medium text-sm pr-4">{v.name}</td>
                                <td className="py-4 pr-4"><button className={`${v.className} primary`}>Primary</button></td>
                                <td className="py-4 pr-4"><button className={`${v.className} secondary`}>Secondary</button></td>
                                <td className="py-4 pr-4"><button className={`${v.className} accent`}>Accent</button></td>
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
                    <div>
                        <strong>Default:</strong> This is a paragraph with <a href="#">a standard link</a> inside it.
                    </div>
                    <div>
                        <strong>Retro:</strong> This is a paragraph with <a href="#" className="link-retro">a retro link</a> inside it.
                    </div>
                    <div>
                        <strong>Modern:</strong> This is a paragraph with <a href="#" className="link-modern">a modern link</a> inside it.
                    </div>
                    <div>
                        <strong>Futuristic:</strong> This is a paragraph with <a href="#" className="link-futuristic">a futuristic link</a> inside it.
                    </div>
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
                            {variants.map(v => (
                                <tr key={v.name}>
                                    <td className="py-4 font-medium text-sm pr-4">{v.name}</td>
                                    <td className="py-4 pr-4"><a href="#" className={`button ${v.className} primary`}>Primary Link</a></td>
                                    <td className="py-4 pr-4"><a href="#" className={`button ${v.className} secondary`}>Secondary Link</a></td>
                                    <td className="py-4 pr-4"><a href="#" className={`button ${v.className} accent`}>Accent Link</a></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* --- INPUTS --- */}
        <div className="card" id="component-input">
            <h2>Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {variants.map(v => (
                    <div key={v.name} className="space-y-2">
                        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">{v.name}</h3>
                        <input type="text" className={v.className} placeholder="Type something..." />
                        <select className={v.className}>
                            <option>Option 1</option>
                            <option>Option 2</option>
                        </select>
                    </div>
                 ))}
            </div>
            
            <h3 className="mt-8 mb-4">Form Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="component-form">
                {variants.map(v => (
                    <div key={v.name} className="space-y-4 p-4 border border-[var(--border-default)] rounded-lg bg-[var(--bg-inset)]">
                         <h4 className="text-xs font-bold uppercase">{v.name}</h4>
                         <label className="flex items-center gap-2">
                             <input type="checkbox" className={v.className} defaultChecked />
                             <span className="text-sm">Checkbox</span>
                         </label>
                         <div className="flex items-center gap-2">
                             <input type="checkbox" role="switch" className={v.className} defaultChecked />
                             <span className="text-sm">Switch</span>
                         </div>
                         <div>
                             <input type="range" className={v.className} defaultValue="50" />
                         </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- CARDS --- */}
        <div className="card bg-transparent border-none shadow-none p-0" id="component-card">
            <h2>Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {variants.map(v => (
                    <div key={v.name} className={`card ${v.className}`}>
                        <h3 className="mt-0">{v.name}</h3>
                        <p className="text-sm text-opacity-80">This is a card component demonstrating the {v.name.toLowerCase()} style variant.</p>
                        <button className={`primary ${v.className} text-xs px-3 py-1 mt-2`}>Action</button>
                    </div>
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
                        {variants.map(v => (
                            <tr key={v.name}>
                                <td className="py-4 font-medium text-sm pr-4">{v.name}</td>
                                <td className="py-4 pr-4"><span className={`badge ${v.className} primary`}>Primary</span></td>
                                <td className="py-4 pr-4"><span className={`badge ${v.className} secondary`}>Secondary</span></td>
                                <td className="py-4 pr-4"><span className={`badge ${v.className} accent`}>Accent</span></td>
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
                {variants.map(v => (
                    <div key={v.name} className="space-y-2">
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <div className={`alert ${v.className}`} data-status="info"><span className="text-sm">Info Message</span></div>
                        <div className={`alert ${v.className}`} data-status="success"><span className="text-sm">Success Message</span></div>
                        <div className={`alert ${v.className}`} data-status="warning"><span className="text-sm">Warning Message</span></div>
                        <div className={`alert ${v.className}`} data-status="danger"><span className="text-sm">Danger Message</span></div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- TABS & NAV --- */}
        <div className="card" id="component-tabs">
            <h2>Tabs</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {variants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <div className={`tabs ${v.className}`} role="tablist">
                            <button role="tab" className="tab" aria-selected="true">Account</button>
                            <button role="tab" className="tab" aria-selected="false">Settings</button>
                            <button role="tab" className="tab" aria-selected="false">Billing</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* --- TABLES --- */}
        <div className="card" id="component-table">
            <h2>Tables</h2>
            <div className="grid grid-cols-1 gap-8">
                 {variants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <div className="overflow-x-auto">
                            <table className={v.className}>
                                <thead>
                                    <tr><th>Name</th><th>Role</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Alice</td><td>Admin</td><td>Active</td></tr>
                                    <tr><td>Bob</td><td>Editor</td><td>Inactive</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* --- PAGINATION --- */}
        <div className="card" id="component-pagination">
            <h2>Pagination</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <ul className={`pagination ${v.className}`}>
                            <li className="pagination-item">&lt;</li>
                            <li className="pagination-item active">1</li>
                            <li className="pagination-item">2</li>
                            <li className="pagination-item">3</li>
                            <li className="pagination-item">&gt;</li>
                        </ul>
                    </div>
                ))}
            </div>
        </div>
        
        {/* --- BREADCRUMBS --- */}
        <div className="card" id="component-breadcrumb">
            <h2>Breadcrumbs</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <nav className={`breadcrumb ${v.className}`}>
                            <span className="breadcrumb-item"><a href="#">Home</a></span>
                            <span className="breadcrumb-item"><a href="#">Library</a></span>
                            <span className="breadcrumb-item active">Data</span>
                        </nav>
                    </div>
                ))}
            </div>
        </div>

        {/* --- TABS --- */}
        <div className="card" id="component-tabs">
            <h2>Tabs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <div className={`tabs ${v.className}`} role="tablist">
                            <button className="tab active" role="tab">Tab 1</button>
                            <button className="tab" role="tab">Tab 2</button>
                            <button className="tab" role="tab">Tab 3</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- AVATARS --- */}
        <div className="card" id="component-avatar">
            <h2>Avatars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {variants.map(v => (
                    <div key={v.name}>
                        <h3 className="text-xs font-bold uppercase mb-2">{v.name}</h3>
                        <div className="flex gap-2">
                            <div className={`avatar ${v.className}`}>JD</div>
                            <div className={`avatar ${v.className}`}>AB</div>
                            <div className={`avatar ${v.className}`}>XY</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- TOOLTIPS & POPOVERS --- */}
        <div className="card" id="component-tooltip">
            <h2>Tooltips & Popovers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Tooltips</h3>
                    <div className="flex gap-4 flex-wrap">
                        {variants.map(v => (
                            <div key={v.name} className="relative inline-block">
                                <button 
                                    className={v.className}
                                    onMouseEnter={() => setTooltipVisible(v.className || 'default')}
                                    onMouseLeave={() => setTooltipVisible(null)}
                                >
                                    {v.name}
                                </button>
                                {tooltipVisible === (v.className || 'default') && (
                                    <div className={`tooltip ${v.className} show`} data-placement="top" style={{bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)'}}>
                                        {v.name} tooltip
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div id="component-popover">
                    <h3 className="text-lg font-semibold mb-4">Popovers</h3>
                    <div className="flex gap-4 flex-wrap">
                        {variants.map(v => (
                            <div key={v.name} className="relative inline-block">
                                <button 
                                    className={v.className}
                                    onClick={() => setPopoverVisible(popoverVisible === v.className ? null : v.className)}
                                >
                                    {v.name}
                                </button>
                                {popoverVisible === v.className && (
                                    <div className={`popover ${v.className}`} style={{top: 'calc(100% + 8px)', left: 0, zIndex: 100}}>
                                        <div className="popover-header">{v.name} Popover</div>
                                        <div>This is {v.name.toLowerCase()} popover content with detailed information.</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* --- SKELETONS --- */}
        <div className="card" id="component-skeleton">
            <h2>Skeleton Loaders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {variants.map(v => (
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
                {variants.map(v => (
                    <button 
                        key={v.name}
                        onClick={() => showDemoToast(v.className)} 
                        className={`${v.className} primary`}
                    >
                        {v.name} Toast
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};