
import React, { useState, useEffect, useRef } from 'react';
import { ThemeConfig } from '../types';
import { ColorInput } from './ColorInput';
import { ResetIcon, SparklesIcon, ChevronIcon } from './Icons';
import { useAccessibilityChecker } from '../hooks/useAccessibilityChecker';
import { ThemeVariables } from '../hooks/useTheme';

interface InputControlProps {
    config: ThemeConfig;
    value: string;
    isChanged: boolean;
    onChange: (value: string) => void;
    onReset: () => void;
    onFixContrast: (backgroundColor: string) => void;
    theme: ThemeVariables; // To trigger re-calculation of resolved colors
}

export const InputControl: React.FC<InputControlProps> = ({ config, value, isChanged, onChange, onReset, onFixContrast, theme }) => {
    const { id, label, description, type, min, max, step, unit, options, contrastFixerKey, purpose } = config;
    const { results, isCheckerVisible } = useAccessibilityChecker();

    // State for custom color dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [resolvedColors, setResolvedColors] = useState<Record<string, string>>({});

    // Effect to resolve CSS variables to actual colors for swatches
    useEffect(() => {
        if (purpose !== 'color') return;
        
        const allValues = [value, ...(options?.map(o => o.value) || [])];
        const uniqueValues = [...new Set(allValues)];
        
        const newResolvedColors: Record<string, string> = {};
        const rootStyles = window.getComputedStyle(document.documentElement);

        uniqueValues.forEach(cssValue => {
            if (!cssValue) return;
            
            try {
                // Check if it's a CSS variable
                if (cssValue.startsWith('var(--')) {
                    // Extract variable name: var(--color-primary) -> --color-primary
                    const varName = cssValue.match(/var\((--[^)]+)\)/)?.[1];
                    if (varName) {
                        // Get the value from root element
                        const resolvedValue = rootStyles.getPropertyValue(varName).trim();
                        
                        // If the resolved value is also a var(), resolve it recursively
                        if (resolvedValue.startsWith('var(')) {
                            const nestedVarName = resolvedValue.match(/var\((--[^)]+)\)/)?.[1];
                            if (nestedVarName) {
                                const nestedValue = rootStyles.getPropertyValue(nestedVarName).trim();
                                newResolvedColors[cssValue] = nestedValue || resolvedValue;
                            } else {
                                newResolvedColors[cssValue] = resolvedValue;
                            }
                        } else {
                            newResolvedColors[cssValue] = resolvedValue || cssValue;
                        }
                    } else {
                        newResolvedColors[cssValue] = cssValue;
                    }
                } else {
                    // It's a direct color value (hex, rgb, named color, etc.)
                    newResolvedColors[cssValue] = cssValue;
                }
            } catch (e) {
                console.warn(`Could not resolve color: ${cssValue}`, e);
                newResolvedColors[cssValue] = '#999999';
            }
        });
        
        setResolvedColors(newResolvedColors);
    }, [value, options, purpose, theme]);

    // Effect to handle clicks outside the custom dropdown
    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);


    const result = (isCheckerVisible && contrastFixerKey) ? results[contrastFixerKey] : undefined;
    const showFixButton = result && result.rating === 'FAIL' && result.backgroundColor && onFixContrast;

    const renderInput = () => {
        const cleanValue = String(value).replace(unit || '', '');
        const sharedSelectStyles = { backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border-color)', color: 'var(--input-color)' };
        
        switch (type) {
            case 'color':
                return <ColorInput id={id} value={value} onChange={e => onChange(e.target.value)} />;
            case 'range':
                return (
                    <div className="flex items-center gap-3">
                        <input
                            id={id} type="range" min={min} max={max} step={step}
                            value={cleanValue} onChange={e => onChange(e.target.value + (unit || ''))}
                            style={{ accentColor: 'var(--color-primary)' }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-neutral-200 dark:bg-neutral-700"
                        />
                        <span className="text-sm font-mono w-24 text-right" style={{ color: 'var(--text-muted)' }}>{value}</span>
                    </div>
                );
            case 'text':
                return (
                    <input
                        id={id} type="text" value={value} onChange={e => onChange(e.target.value)}
                        style={sharedSelectStyles}
                        className="w-full rounded-md text-sm font-mono border p-2"
                    />
                );
            case 'select':
                if (purpose === 'color' && options) {
                    const selectedOption = options.find(o => o.value === value) || options[0];
                    const currentResolvedColor = resolvedColors[value] || 'transparent';
                    
                    return (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                type="button" 
                                id={id}
                                onClick={() => setIsDropdownOpen(prev => !prev)}
                                className="w-full flex items-center justify-between text-sm rounded-md border p-2 transition-all focus:outline-none focus:ring-2"
                                style={{ ...sharedSelectStyles, '--tw-ring-color': 'var(--color-primary)', '--tw-ring-offset-width': '1px' } as React.CSSProperties}
                                aria-haspopup="listbox"
                                aria-expanded={isDropdownOpen}
                            >
                                <span className="flex items-center gap-2">
                                    <span 
                                        className="w-5 h-5 rounded-sm border-2" 
                                        style={{ backgroundColor: currentResolvedColor, borderColor: 'color-mix(in srgb, currentColor 20%, transparent)' }}
                                    />
                                    <span className="flex-1 text-left">{selectedOption?.label || value}</span>
                                </span>
                                <ChevronIcon className={`w-4 h-4 text-neutral-500 transform transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <ul 
                                    className="absolute z-20 w-full mt-1 rounded-md border shadow-lg max-h-60 overflow-auto scroll-area"
                                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-strong)'}}
                                    role="listbox"
                                >
                                    {options.map(option => (
                                        <li key={option.value}>
                                            <button
                                                type="button"
                                                className="w-full text-left flex items-center justify-start gap-2 px-3 py-2 text-sm transition-colors"
                                                style={{ color: 'var(--text-default)', ...(value === option.value && { backgroundColor: 'var(--bg-inset)'}) }}
                                                onClick={() => {
                                                    onChange(option.value);
                                                    setIsDropdownOpen(false);
                                                }}
                                                role="option"
                                                aria-selected={value === option.value}
                                            >
                                                <span 
                                                    className="w-5 h-5 flex-shrink-0 rounded-sm border-2" 
                                                    style={{ 
                                                        backgroundColor: resolvedColors[option.value] || 'transparent', 
                                                        borderColor: 'color-mix(in srgb, currentColor 20%, transparent)' 
                                                    }}
                                                />
                                                <span>{option.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                }
                
                // Fallback to native select for non-color purposes
                return (
                    <select
                        id={id} value={value} onChange={e => onChange(e.target.value)}
                        style={sharedSelectStyles}
                        className="w-full rounded-md text-sm border p-2"
                    >
                        {options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return null;
        }
    };
    
    const isColorType = config.type === 'color' || config.purpose === 'color';

    return (
        <div>
            <div className="flex justify-between items-center mb-1 min-h-[24px]">
                <label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
                    {isChanged && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isColorType ? (resolvedColors[value] || value) : 'var(--color-primary)'}} title="Modified from default"></span>}
                    {label}
                </label>
                <div className="flex items-center gap-3">
                    {showFixButton && (
                        <button
                          onClick={() => onFixContrast(result.backgroundColor!)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-all hover:opacity-80"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                            color: 'var(--color-primary)',
                            border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                          }}
                        >
                          <SparklesIcon />
                          Fix Contrast
                        </button>
                    )}
                    {isChanged && (
                        <button onClick={onReset} className="flex items-center gap-1 text-xs transition-colors" style={{ color: 'var(--text-muted)' }} title="Reset to default">
                            <ResetIcon />
                            Reset
                        </button>
                    )}
                </div>
            </div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{description}</p>
            {renderInput()}
        </div>
    );
};
