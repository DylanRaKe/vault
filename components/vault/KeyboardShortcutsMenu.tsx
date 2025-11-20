"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatShortcut } from "@/lib/keyboard";

interface KeyboardShortcutsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

export function KeyboardShortcutsMenu({
  open,
  onOpenChange,
}: KeyboardShortcutsMenuProps) {
  const shortcuts: ShortcutItem[] = [
    {
      keys: ["N"],
      description: "Créer un nouvel item",
    },
    {
      keys: ["K", "/"],
      description: "Focus sur la barre de recherche",
    },
    {
      keys: ["E"],
      description: "Éditer le premier item de la liste",
    },
    {
      keys: ["S"],
      description: "Sauvegarder (dans le formulaire)",
    },
    {
      keys: ["?"],
      description: "Ouvrir/fermer ce menu d'aide",
    },
    {
      keys: ["Escape"],
      description: "Fermer les dialogs/formulaires",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Raccourcis clavier</DialogTitle>
          <DialogDescription>
            Liste de tous les raccourcis clavier disponibles dans l'application
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-border pb-3 last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex gap-2">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono font-semibold shadow-sm"
                  >
                    {key === "Escape"
                      ? "Esc"
                      : key === "/"
                      ? "/"
                      : formatShortcut(key)}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

