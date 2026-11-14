// Limite solicitado para esta implementação, inclusive conteúdo Homebrew.
export function validateLevel(value) {
  const level = Number(value);
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new Error('O nível deve ser um número inteiro entre 1 e 20.');
  }
  return level;
}

export function clampResource(current, maximum) {
  const max = Math.max(0, Number(maximum) || 0);
  return Math.min(max, Math.max(0, Number(current) || 0));
}
