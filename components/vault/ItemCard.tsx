"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MagicCard } from "@/components/ui/magic-card";
import { Edit, Trash2, Eye, AlertCircle, Download, File } from "lucide-react";
import type { Item } from "@/types/item";
import { getStoredPassword } from "@/lib/storage";
import { useKeyboardShortcut } from "@/lib/useKeyboardShortcut";

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const password = getStoredPassword();
      const response = await fetch(`/api/items/${item.id}`, {
        method: "DELETE",
        headers: {
          authorization: password || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      onDelete(item.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item");
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const getFileExtension = (path: string) => {
    return path.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = (path: string) => {
    const ext = getFileExtension(path);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  // Raccourci Escape : Fermer les dialogs
  useKeyboardShortcut({
    key: "Escape",
    handler: () => {
      if (showViewDialog) {
        setShowViewDialog(false);
      }
      if (showDeleteDialog) {
        setShowDeleteDialog(false);
      }
    },
    ctrlKey: false,
    allowInInput: true,
  });

  const displayContent =
    item.type === "image" ? (
      <div className="relative h-48 w-full overflow-hidden rounded-md">
        <Image
          src={item.content || ""}
          alt={item.title || "Item image"}
          fill
          className="object-cover"
        />
      </div>
    ) : item.type === "document" ? (
      <div className="flex items-center justify-center h-48 w-full rounded-md border border-border bg-muted/50">
        <div className="text-center">
          <File className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {item.content?.split('/').pop() || "Document"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {item.content ? getFileExtension(item.content).toUpperCase() : ""} file
          </p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground line-clamp-3">
        {item.content}
      </p>
    );

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="group relative overflow-hidden border-2 border-border/60 transition-all duration-300 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10">
        <MagicCard
          gradientFrom="#00D9FF"
          gradientTo="#00D9FF"
          className="h-full"
        >
          <CardContent className="p-4">
            <div className="space-y-3">
            {item.title && (
              <h3 className="font-semibold text-lg">{item.title}</h3>
            )}
            {displayContent}
            <div className="flex flex-wrap gap-1">
              {item.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewDialog(true)}
              >
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
          </CardContent>
        </MagicCard>
      </Card>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{item.title || "Item Details"}</DialogTitle>
            <DialogDescription>
              View full content of this item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {item.type === "image" ? (
              <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-border">
                <Image
                  src={item.content || ""}
                  alt={item.title || "Item image"}
                  fill
                  className="object-contain"
                />
              </div>
            ) : item.type === "document" ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-border bg-muted/50 min-h-[300px]">
                <File className="h-24 w-24 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {item.content?.split('/').pop() || "Document"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.content ? getFileExtension(item.content).toUpperCase() : ""} file
                </p>
                <Button
                  variant="default"
                  onClick={() => {
                    if (item.content) {
                      const link = document.createElement('a');
                      link.href = item.content;
                      link.download = item.content.split('/').pop() || 'document';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Document
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                  {item.content}
                </pre>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">Keywords:</span>
              {item.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-primary/20 px-3 py-1 text-sm text-primary border border-primary/30"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              {(item.type === "image" || item.type === "document") && item.content && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = item.content || '';
                    link.download = item.content?.split('/').pop() || (item.title || 'file');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewDialog(false);
                  onEdit(item);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowViewDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-destructive/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this item? This action cannot be
              undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={deleting} className="mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

