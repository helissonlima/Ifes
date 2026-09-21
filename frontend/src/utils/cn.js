import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário padrão para concatenação condicional e merge inteligente
 * de classes utilitárias do Tailwind CSS.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
