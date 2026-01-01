
import React, { useState, useMemo, useEffect } from 'react';
import { ThemeConfigCategory, VariantKey } from '../types';
import { XIcon, ClipboardIcon, CheckIcon } from './Icons';
import { VARIANT_META } from '../variants';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
    generateCss: (options: { mode: 'diff' | 'all' | 'full', exclude: Set<string>, variants?: Set<VariantKey> }) => string;
  generateJson: () => string;
  themeConfig: ThemeConfigCategory[];
  initialTab?: 'json' | 'css';
    visibleVariants: Set<VariantKey>;
    onToggleVariant: (variant: VariantKey, checked: boolean) => void;
    onSelectAllVariants: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, generateCss, generateJson, themeConfig, initialTab = 'css', visibleVariants, onToggleVariant, onSelectAllVariants }) => {
    const [activeTab, setActiveTab] = useState<'json' | 'css'>(initialTab);
    const [exportMode, setExportMode] = useState<'diff' | 'full'>('full');
    const [excludedComponents, setExcludedComponents] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const componentCategories = useMemo(() => themeConfig.filter(c => c.id), [themeConfig]);

    const generatedCss = useMemo(() => {
        return generateCss({ mode: exportMode, exclude: excludedComponents, variants: visibleVariants });
    }, [generateCss, exportMode, excludedComponents, visibleVariants]);
    
    const generatedJson = useMemo(() => {
        return generateJson();
    }, [generateJson]);

    const codeToDisplay = activeTab === 'css' ? generatedCss : generatedJson;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(codeToDisplay);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleExclusion = (id: string) => {
        setExcludedComponents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="export-modal-content" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-default)'}}>
                    <div className="export-modal-tabs flex items-center">
                        <button data-state={activeTab === 'css' ? 'active' : 'inactive'} onClick={() => setActiveTab('css')}>CSS</button>
                        <button data-state={activeTab === 'json' ? 'active' : 'inactive'} onClick={() => setActiveTab('json')}>JSON (Tokens)</button>
                    </div>
                    <button onClick={onClose}><XIcon /></button>
                </header>
                
                <div className="export-modal-body">
                    {activeTab === 'css' && (
                        <aside className="export-modal-sidebar scroll-area">
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-2">Export Mode</h4>
                                <select 
                                    value={exportMode} 
                                    onChange={(e) => setExportMode(e.target.value as 'diff' | 'full')}
                                    className="w-full text-sm p-2 rounded-md border bg-[var(--bg-subtle)] text-[var(--text-default)] border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                >
                                    <option value="full">Complete CSS (Library + Theme)</option>
                                    <option value="diff">Overrides Only (Patch)</option>
                                </select>
                                <div className="text-xs mt-3 p-3 rounded bg-[var(--bg-inset)] border border-[var(--border-default)] text-[var(--text-muted)] leading-relaxed">
                                    {exportMode === 'full' && (
                                        <>
                                            <strong>Ready for Production.</strong><br/>
                                            Includes the entire design system: resets, component styles (buttons, cards, etc.), and your custom variables. Copy this into a <code>style.css</code> file and link it in your HTML.
                                        </>
                                    )}
                                    {exportMode === 'diff' && (
                                        <>
                                            <strong>Minimal Patch.</strong><br/>
                                            Exports ONLY the variables you have actively changed from the defaults. Useful for creating a lightweight "skin" on top of the default theme.
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {exportMode === 'full' && (
                                <>
                                    <h4 className="font-bold text-sm mb-2">Filter Components</h4>
                                    <div className="space-y-1 text-sm">
                                        {componentCategories.map(cat => (
                                            <label key={cat.id} className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">
                                                <input 
                                                    type="checkbox" 
                                                    checked={!excludedComponents.has(cat.id!)}
                                                    onChange={() => toggleExclusion(cat.id!)}
                                                    className="mr-2"
                                                />
                                                <span>{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-6">
                                        <h4 className="font-bold text-sm mb-2">Variants</h4>
                                        <div className="space-y-1 text-sm">
                                            {VARIANT_META.map(meta => {
                                                const isLocked = visibleVariants.size === 1 && visibleVariants.has(meta.key);
                                                return (
                                                    <label key={meta.key} className={`flex items-center gap-2 ${isLocked ? 'opacity-60' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={visibleVariants.has(meta.key)}
                                                            disabled={isLocked}
                                                            onChange={(e) => onToggleVariant(meta.key, e.target.checked)}
                                                        />
                                                        <span>{meta.emoji} {meta.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <button className="mt-3 text-xs font-semibold text-[var(--color-primary)]" onClick={onSelectAllVariants}>Tout sélectionner</button>
                                    </div>
                                </>
                            )}
                        </aside>
                    )}
                    <main className={`export-modal-code scroll-area ${activeTab === 'json' ? 'col-span-2' : ''}`}>
                        <pre><code className="text-xs font-mono">{codeToDisplay}</code></pre>
                    </main>
                </div>

                <footer className="p-4 flex justify-end items-center" style={{ borderTop: '1px solid var(--border-default)'}}>
                    <button onClick={handleCopy} className="primary flex items-center gap-2">
                        {copied ? <CheckIcon/> : <ClipboardIcon />}
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                </footer>
            </div>
        </div>
    );
};
