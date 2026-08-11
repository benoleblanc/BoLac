// Diacritiques (accents) isolés par normalize('NFD') — plage Unicode U+0300 à U+036F.
const DIACRITICS_PATTERN = /[̀-ͯ]/g;

/** Convertit un texte libre en identifiant de fichier sûr (minuscules, tirets, sans accents). */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.length > 0 ? slug : 'sans-titre';
}
