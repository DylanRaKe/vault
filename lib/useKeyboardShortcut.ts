import { useEffect } from "react";
import { isMac, isInputElement } from "./keyboard";

interface UseKeyboardShortcutOptions {
  /**
   * La touche principale (ex: "n", "k", "s")
   */
  key: string;
  /**
   * Fonction à exécuter quand le raccourci est pressé
   */
  handler: (event: KeyboardEvent) => void;
  /**
   * Si true, le raccourci fonctionne même dans les champs de saisie
   * @default false
   */
  allowInInput?: boolean;
  /**
   * Si true, nécessite la touche Ctrl (ou Cmd sur Mac)
   * @default true
   */
  ctrlKey?: boolean;
  /**
   * Si true, nécessite la touche Shift
   * @default false
   */
  shiftKey?: boolean;
  /**
   * Si true, nécessite la touche Alt
   * @default false
   */
  altKey?: boolean;
}

/**
 * Hook personnalisé pour gérer les raccourcis clavier
 */
export function useKeyboardShortcut({
  key,
  handler,
  allowInInput = false,
  ctrlKey = true,
  shiftKey = false,
  altKey = false,
}: UseKeyboardShortcutOptions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Vérifier si on est dans un champ de saisie
      if (!allowInInput && isInputElement(event.target as HTMLElement)) {
        return;
      }

      // Vérifier la touche principale
      if (event.key.toLowerCase() !== key.toLowerCase()) {
        return;
      }

      // Vérifier les touches modificateurs
      const isMacPlatform = isMac();
      const hasCtrlOrCmd = isMacPlatform
        ? event.metaKey
        : event.ctrlKey;
      const hasShift = event.shiftKey;
      const hasAlt = event.altKey;

      if (ctrlKey && !hasCtrlOrCmd) return;
      if (!ctrlKey && hasCtrlOrCmd) return;
      if (shiftKey && !hasShift) return;
      if (!shiftKey && hasShift) return;
      if (altKey && !hasAlt) return;
      if (!altKey && hasAlt) return;

      // Empêcher le comportement par défaut
      event.preventDefault();
      event.stopPropagation();

      // Exécuter le handler
      handler(event);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, handler, allowInInput, ctrlKey, shiftKey, altKey]);
}

