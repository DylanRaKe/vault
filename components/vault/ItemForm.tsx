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
import { AlertCircle, FileText, Image as ImageIcon, File, Plus } from "lucide-react";
import type { Item, ItemType } from "@/types/item";
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
  const [type, setType] = useState<ItemType>("text");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setContent(item.content || "");
      setType(item.type);
      setKeywords(item.keywords.join(", "));
    } else {
      setTitle("");
      setContent("");
      setType("text");
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

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      const isImageFile = file.type.startsWith("image/");
      const isDocumentFile = !isImageFile && file.type !== "";

      // Déterminer le type automatiquement
      if (isImageFile) {
        setType("image");
      } else if (isDocumentFile) {
        setType("document");
      }

      // Uploader le fichier
      const formData = new FormData();
      formData.append("file", file);

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
        setContent(data.path);
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
          type,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
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
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="type">Item Type</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={type === "text" ? "default" : "outline"}
                onClick={() => setType("text")}
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                <span>Text</span>
              </Button>
              <Button
                type="button"
                variant={type === "image" ? "default" : "outline"}
                onClick={() => setType("image")}
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <ImageIcon className="h-5 w-5" />
                <span>Image</span>
              </Button>
              <Button
                type="button"
                variant={type === "document" ? "default" : "outline"}
                onClick={() => setType("document")}
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <File className="h-5 w-5" />
                <span>Document</span>
              </Button>
            </div>
          </div>

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

          {type === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your text content..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          ) : (
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`space-y-2 transition-all ${
                isDragging ? "opacity-50" : ""
              }`}
            >
              {type === "image" ? (
                <FileUpload
                  type="image"
                  value={content}
                  onChange={(path) => setContent(path)}
                  accept="image/*"
                  isDragging={isDragging}
                />
              ) : (
                <FileUpload
                  type="document"
                  value={content}
                  onChange={(path) => setContent(path)}
                  accept="*/*"
                  isDragging={isDragging}
                />
              )}
            </div>
          )}

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

          <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}

