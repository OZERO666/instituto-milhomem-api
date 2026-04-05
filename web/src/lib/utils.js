// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Formatação ────────────────────────────────────────────────────────────
export const formatCurrency = (value, locale = 'pt-BR') => {
  return new Intl.NumberFormat(locale, {
    style:                 'currency',
    currency:              'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date, format = 'short') => {
  const opts = format === 'short'
    ? { day: '2-digit', month: '2-digit', year: 'numeric' }
    : { day: '2-digit', month: 'long',    year: 'numeric' };
  return new Intl.DateTimeFormat('pt-BR', opts).format(new Date(date));
};

export const formatReadingTime = (wordCount) => {
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min${minutes !== 1 ? 's' : ''}`;
};

// ─── Texto ─────────────────────────────────────────────────────────────────
export const truncate = (text, maxLength = 120) => {
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trim()}…`
    : text;
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str) => {
  return str
    .toLowerCase()
    .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1));
};

// ─── Slug e URL ────────────────────────────────────────────────────────────
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
};

export const isValidSlug = (slug) => {
  return /^[a-z0-9-]{3,50}$/.test(slug);
};

// ─── Validações ────────────────────────────────────────────────────────────
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^[+]?[1-9][\d]{0,15}$/.test(phone.replace(/\D/g, ''));
};

export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const isStrongPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

// ─── Clipboard ─────────────────────────────────────────────────────────────
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

// ─── Numbers ───────────────────────────────────────────────────────────────
export const formatNumber = (num, locale = 'pt-BR') => {
  return new Intl.NumberFormat(locale, {
    notation:             num >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(num);
};

export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

// ─── Arrays ────────────────────────────────────────────────────────────────
export const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

// ─── Debounce ──────────────────────────────────────────────────────────────
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export default {
  cn, formatCurrency, formatDate, formatReadingTime,
  truncate, capitalize, titleCase, generateSlug, isValidSlug,
  isValidEmail, isValidPhone, isValidDate, isStrongPassword,
  copyToClipboard, formatNumber, clamp, shuffle, debounce,
};
