// src/lib/validateForm.js
/**
 * Validações completas de formulário para o Instituto Milhomem.
 * Compatível com react-hook-form (uso direto nas regras de validação).
 */

// ─── Primitivos ─────────────────────────────────────────────────────────────

export const isValidEmail = (email) => {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
};

export const isStrongPassword = (password) => {
  if (!password) return false;
  // Mín. 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 especial
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  // Aceita números BR: 10 ou 11 dígitos (com ou sem DDD)
  return digits.length >= 10 && digits.length <= 11;
};

export const isValidCPF = (cpf) => {
  const digits = cpf?.replace(/\D/g, '');
  if (!digits || digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // Todos iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check1 = (sum * 10) % 11;
  if (check1 === 10 || check1 === 11) check1 = 0;
  if (check1 !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  let check2 = (sum * 10) % 11;
  if (check2 === 10 || check2 === 11) check2 = 0;
  return check2 === parseInt(digits[10]);
};

export const isValidSlug = (slug) => {
  if (!slug) return false;
  return /^[a-z0-9-]{3,60}$/.test(slug);
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// ─── Regras para react-hook-form ────────────────────────────────────────────
// Uso: {...register('email', RULES.email)}

export const RULES = {
  nome: {
    required: 'Nome é obrigatório',
    minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
    maxLength: { value: 100, message: 'Nome muito longo' },
  },
  email: {
    required: 'E-mail é obrigatório',
    validate: (v) => isValidEmail(v) || 'E-mail inválido',
  },
  telefone: {
    required: 'Telefone é obrigatório',
    validate: (v) => isValidPhone(v) || 'Telefone inválido (mín. 10 dígitos com DDD)',
  },
  password: {
    required: 'Senha é obrigatória',
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
    validate: (v) =>
      isStrongPassword(v) ||
      'Senha deve ter maiúscula, minúscula, número e símbolo (@$!%*?&)',
  },
  slug: {
    required: 'Slug é obrigatório',
    validate: (v) =>
      isValidSlug(v) || 'Slug inválido. Use apenas letras, números e hífens (3-60 chars)',
  },
  url: {
    validate: (v) => !v || isValidURL(v) || 'URL inválida',
  },
  titulo: {
    required: 'Título é obrigatório',
    minLength: { value: 3, message: 'Título muito curto' },
    maxLength: { value: 200, message: 'Título muito longo' },
  },
  mensagem: {
    maxLength: { value: 2000, message: 'Mensagem muito longa (máx. 2000 caracteres)' },
  },
};

// ─── Validações de formulários completos ────────────────────────────────────

export const validateContactForm = (data) => {
  const errors = {};

  if (!data.nome || data.nome.trim().length < 3)
    errors.nome = 'Nome deve ter pelo menos 3 caracteres.';

  if (!data.email || !isValidEmail(data.email))
    errors.email = 'E-mail inválido.';

  if (!data.telefone || !isValidPhone(data.telefone))
    errors.telefone = 'Telefone inválido. Informe DDD + número.';

  if (data.mensagem && data.mensagem.length > 2000)
    errors.mensagem = 'Mensagem muito longa.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateArticleForm = (data) => {
  const errors = {};

  if (!data.titulo || data.titulo.trim().length < 3)
    errors.titulo = 'Título deve ter pelo menos 3 caracteres.';

  if (!data.slug || !isValidSlug(data.slug))
    errors.slug = 'Slug inválido. Use apenas letras minúsculas, números e hífens.';

  if (!data.conteudo || data.conteudo.replace(/<[^>]*>/g, '').trim().length < 50)
    errors.conteudo = 'Conteúdo deve ter pelo menos 50 caracteres.';

  if (data.resumo && data.resumo.length > 160)
    errors.resumo = 'Resumo muito longo. Máximo 160 caracteres para SEO.';

  if (data.data_publicacao && !isValidDate(data.data_publicacao))
    errors.data_publicacao = 'Data inválida.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (data) => {
  const errors = {};

  if (!data.email || !isValidEmail(data.email))
    errors.email = 'E-mail inválido.';

  if (!data.password || data.password.length < 8)
    errors.password = 'Senha deve ter no mínimo 8 caracteres.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateServiceForm = (data) => {
  const errors = {};

  if (!data.nome || data.nome.trim().length < 2)
    errors.nome = 'Nome do serviço é obrigatório.';

  if (data.descricao && data.descricao.length > 2000)
    errors.descricao = 'Descrição muito longa.';

  if (data.ordem !== undefined && data.ordem !== null && isNaN(parseInt(data.ordem)))
    errors.ordem = 'Ordem deve ser um número.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ─── Helpers de feedback visual ─────────────────────────────────────────────

export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: 'bg-muted' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Muito fraca', color: 'bg-red-500' };
  if (score === 2) return { level: 2, label: 'Fraca', color: 'bg-orange-500' };
  if (score === 3) return { level: 3, label: 'Média', color: 'bg-amber-500' };
  if (score === 4) return { level: 4, label: 'Forte', color: 'bg-emerald-400' };
  return { level: 5, label: 'Muito forte', color: 'bg-emerald-600' };
};

export const formatPhoneDisplay = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
};

export default {
  isValidEmail,
  isStrongPassword,
  isValidPhone,
  isValidCPF,
  isValidSlug,
  isValidURL,
  isValidDate,
  RULES,
  validateContactForm,
  validateArticleForm,
  validateLoginForm,
  validateServiceForm,
  getPasswordStrength,
  formatPhoneDisplay,
};
