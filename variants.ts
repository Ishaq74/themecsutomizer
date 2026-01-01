import { VariantKey } from './types';

export interface VariantMeta {
  key: VariantKey;
  name: string;
  className: string;
  emoji: string;
}

export const VARIANT_META: VariantMeta[] = [
  { key: 'initial', name: 'Initial', className: '', emoji: '✨' },
  { key: 'retro', name: 'Retro', className: 'retro', emoji: '📼' },
  { key: 'modern', name: 'Modern', className: 'modern', emoji: '🧪' },
  { key: 'futuristic', name: 'Futuristic', className: 'futuristic', emoji: '🚀' },
];

export const VARIANT_META_BY_KEY: Record<VariantKey, VariantMeta> = VARIANT_META.reduce(
  (acc, meta) => {
    acc[meta.key] = meta;
    return acc;
  },
  {} as Record<VariantKey, VariantMeta>
);
