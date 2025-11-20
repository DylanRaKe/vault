/**
 * Détecte si l'utilisateur est sur Mac
 */
export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  return (
    navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
    navigator.userAgent.toUpperCase().indexOf("MAC") >= 0
  );
}

/**
 * Retourne le symbole de la touche modificateur selon la plateforme
 * @returns "⌘" sur Mac, "Ctrl" sur Windows/Linux
 */
export function getModifierKey(): string {
  return isMac() ? "⌘" : "Ctrl";
}

/**
 * Formate un raccourci clavier pour l'affichage
 * @param key - La touche principale (ex: "N", "K", "S")
 * @returns Le raccourci formaté (ex: "⌘N" ou "Ctrl+N")
 */
export function formatShortcut(key: string): string {
  const modifier = getModifierKey();
  const separator = isMac() ? "" : "+";
  return `${modifier}${separator}${key}`;
}

/**
 * Vérifie si un élément est un champ de saisie (input, textarea, etc.)
 */
export function isInputElement(element: HTMLElement | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  const isEditable =
    element.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select";
  return isEditable;
}

