"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "./FileUpload";
import { AlertCircle, FileText, Plus, Merge, Download } from "lucide-react";
import type { Item } from "@/types/item";
import { getStoredPassword } from "@/lib/storage";
import { useKeyboardShortcut } from "@/lib/useKeyboardShortcut";

interface ItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
  onSuccess: () => void;
}

export function ItemForm({ open, onOpenChange, item, onSuccess }: ItemFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [mergedPdfPath, setMergedPdfPath] = useState<string | null>(null);
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setContent(item.content || "");
      setFiles(item.files || []);
      setKeywords(item.keywords.join(", "));
      // Vérifier si un PDF fusionné existe dans les fichiers
      const mergedPdf = (item.files || []).find(f => f.includes('merged-') && f.endsWith('.pdf'));
      setMergedPdfPath(mergedPdf || null);
    } else {
      setTitle("");
      setContent("");
      setFiles([]);
      setMergedPdfPath(null);
      setKeywords("");
    }
  }, [item, open]);

  // Raccourci Escape : Fermer le formulaire
  useKeyboardShortcut({
    key: "Escape",
    handler: () => {
      if (open && !loading) {
        onOpenChange(false);
      }
    },
    ctrlKey: false,
    allowInInput: true,
  });

  // Raccourci Ctrl/Cmd + S : Sauvegarder
  useKeyboardShortcut({
    key: "s",
    handler: (e) => {
      if (open && !loading && formRef.current) {
        e.preventDefault();
        const submitButton = formRef.current.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement;
        if (submitButton && !submitButton.disabled) {
          formRef.current.requestSubmit();
        }
      }
    },
    allowInInput: true,
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length === 0) return;

      // Uploader tous les fichiers
      const formData = new FormData();
      droppedFiles.forEach((file) => {
        formData.append("file", file);
      });

      setLoading(true);
      try {
        const password = getStoredPassword();
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            authorization: password || "",
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setFiles((prev) => [...prev, ...data.paths]);
        setError(null);
      } catch (error) {
        console.error("Upload error:", error);
        setError("Failed to upload file");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getAllFiles = (): string[] => {
    return files;
  };

  const isPdfOrImage = (path: string): boolean => {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const canMerge = (): boolean => {
    const allFiles = getAllFiles();
    if (allFiles.length < 2) return false;
    return allFiles.every(isPdfOrImage);
  };

  const handleMerge = async () => {
    if (!item || !canMerge()) return;

    setMerging(true);
    try {
      const password = getStoredPassword();
      const response = await fetch(`/api/items/${item.id}/merge`, {
        method: "POST",
        headers: {
          authorization: password || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to merge files");
      }

      const data = await response.json();
      setMergedPdfPath(data.path);
      setFiles((prev) => [...prev, data.path]);
      setError(null);
      onSuccess(); // Rafraîchir la liste
    } catch (error) {
      console.error("Error merging files:", error);
      setError("Failed to merge files");
    } finally {
      setMerging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const keywordsArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const password = getStoredPassword();
      const url = item ? `/api/items/${item.id}` : "/api/items";
      const method = item ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          authorization: password || "",
        },
        body: JSON.stringify({
          title: title || undefined,
          content: content || undefined,
          files: files.length > 0 ? files : undefined,
          type: "text",
          keywords: keywordsArray,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save item");
      }

      onSuccess();
      onOpenChange(false);
      setError(null);
    } catch (error) {
      console.error("Error saving item:", error);
      setError("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {item ? (
              <>
                <FileText className="h-5 w-5" />
                Edit Item
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Create New Item
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Update your item details"
              : "Add a new item to your vault"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content (optional)
            </Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text content..."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`space-y-2 transition-all ${
              isDragging ? "opacity-50" : ""
            }`}
          >
            <FileUpload
              type="document"
              value={files}
              onChange={(paths) => setFiles(Array.isArray(paths) ? paths : [])}
              accept="*/*"
              isDragging={isDragging}
              multiple={true}
              label="Files (optional)"
            />
            {item && canMerge() && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMerge}
                  disabled={merging}
                  className="flex items-center gap-2"
                >
                  <Merge className="h-4 w-4" />
                  {merging ? "Fusion en cours..." : "Fusionner"}
                </Button>
                {mergedPdfPath && (
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="flex items-center gap-2"
                  >
                    <a href={mergedPdfPath} download>
                      <Download className="h-4 w-4" />
                      Télécharger la fusion
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">
              Keywords (comma-separated)
            </Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="administratif/papier/passport, work/contract"
              className="bg-background/50 backdrop-blur-sm"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple keywords with commas
            </p>
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 flex-shrink-0 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : item ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

