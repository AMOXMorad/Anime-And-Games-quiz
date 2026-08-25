/**
 * Normalizes Arabic and English text for fuzzy matching in "Who Am I"
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  let normalized = text.toLowerCase().trim();

  // Remove Arabic diacritics (Tashkeel)
  normalized = normalized.replace(/[\u064B-\u0652\u0670]/g, '');

  // Normalize Alef variants
  normalized = normalized.replace(/[إأآٱ]/g, 'ا');

  // Normalize Taa Marbuta & Haa
  normalized = normalized.replace(/ة/g, 'ه');

  // Normalize Yaa variants
  normalized = normalized.replace(/ى/g, 'ي');

  // Remove common punctuation and special characters
  normalized = normalized.replace(/[-_.,'"!?:;()\[\]{}~`@#$%^&*+=<>/\\]/g, ' ');

  // Collapse multiple spaces into single space
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Calculates Levenshtein Distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;
  for (let i = 0; i <= bn; ++i) matrix[i][0] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Checks if user input matches character names (with fuzzy tolerance)
 */
export function checkCharacterGuess(
  userInput: string,
  targetNames: { ar: string; en: string }
): boolean {
  const normInput = normalizeText(userInput);
  if (!normInput || normInput.length < 2) return false;

  const normAr = normalizeText(targetNames.ar);
  const normEn = normalizeText(targetNames.en);

  // Direct normalized exact match or inclusion
  if (normInput === normAr || normInput === normEn) return true;
  if (normAr.includes(normInput) && normInput.length >= 3) return true;
  if (normEn.includes(normInput) && normInput.length >= 3) return true;

  // Check without "ال" in Arabic
  const inputNoAl = normInput.replace(/^ال/, '');
  const arNoAl = normAr.replace(/^ال/, '');
  if (inputNoAl && arNoAl && (inputNoAl === arNoAl || arNoAl.includes(inputNoAl))) return true;

  // Split into tokens (e.g. "ناروتو" matches "ناروتو أوزوماكي")
  const arTokens = normAr.split(' ').filter(t => t.length > 2);
  const enTokens = normEn.split(' ').filter(t => t.length > 2);
  const inputTokens = normInput.split(' ').filter(t => t.length > 2);

  for (const it of inputTokens) {
    if (arTokens.some(at => at === it || at.replace(/^ال/, '') === it.replace(/^ال/, ''))) return true;
    if (enTokens.some(et => et === it)) return true;
  }

  // Levenshtein distance check on key tokens (allow 1 typo per 4 characters)
  for (const at of arTokens) {
    const dist = levenshteinDistance(normInput, at);
    if (dist <= 1 && (normInput.length >= 3 || at.length >= 3)) return true;
    if (dist <= 2 && normInput.length >= 6) return true;
  }

  for (const et of enTokens) {
    const dist = levenshteinDistance(normInput, et);
    if (dist <= 1 && (normInput.length >= 3 || et.length >= 3)) return true;
    if (dist <= 2 && normInput.length >= 6) return true;
  }

  return false;
}
