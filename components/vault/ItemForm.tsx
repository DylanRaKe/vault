"use client";

import { useState, useEffect, useRef } from "react";
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
import { AlertCircle } from "lucide-react";
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
  const formRef = useRef<HTMLFormElement>(null);

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
          <DialogTitle>{item ? "Edit Item" : "Create Item"}</DialogTitle>
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "text" ? "default" : "outline"}
                onClick={() => setType("text")}
              >
                Text
              </Button>
              <Button
                type="button"
                variant={type === "image" ? "default" : "outline"}
                onClick={() => setType("image")}
              >
                Image
              </Button>
              <Button
                type="button"
                variant={type === "document" ? "default" : "outline"}
                onClick={() => setType("document")}
              >
                Document
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
            />
          </div>

          {type === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your text content..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          ) : type === "image" ? (
            <FileUpload
              type="image"
              value={content}
              onChange={(path) => setContent(path)}
              accept="image/*"
            />
          ) : (
            <FileUpload
              type="document"
              value={content}
              onChange={(path) => setContent(path)}
              accept="*/*"
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="keywords">
              Keywords (comma-separated, e.g., "administratif/papier/passport")
            </Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="administratif/papier/passport, work/contract"
            />
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

