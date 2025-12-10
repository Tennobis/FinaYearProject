import {
  Code2,
  Zap,
  Flame,
  Circle,
  Square,
  type LucideIcon,
} from 'lucide-react';

export const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  react: Code2,
  nextjs: Zap,
  express: Flame,
  vue: Circle,
  svelte: Square,
};

export const TEMPLATE_NAMES: Record<string, string> = {
  react: 'React',
  nextjs: 'Next.js',
  express: 'Express',
  vue: 'Vue.js',
  svelte: 'Svelte',
};

export const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  react: 'Modern frontend library for building UIs',
  nextjs: 'React framework with SSR and static generation',
  express: 'Minimal web framework for Node.js',
  vue: 'Progressive JavaScript framework',
  svelte: 'Cybernetically enhanced web apps',
};

export const TEMPLATES = [
  'react',
  'nextjs',
  'express',
  'vue',
  'svelte',
] as const;
