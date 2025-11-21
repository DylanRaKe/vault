"use client";

import { useState, type KeyboardEvent, type MouseEvent } from "react";
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
import { Edit, Trash2, Eye, AlertCircle, Download, File, Merge } from "lucide-react";
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
  const [merging, setMerging] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [mergedPdfPath, setMergedPdfPath] = useState<string | null>(null);

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
    return path.split(".").pop()?.toLowerCase() || "";
  };

  const isImageFile = (path: string) => {
    const ext = getFileExtension(path);
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  };

  const isDocumentFile = (path: string) => {
    const ext = getFileExtension(path);
    return ["pdf", "doc", "docx"].includes(ext);
  };

  const getFileType = (path: string): "image" | "document" | null => {
    if (isImageFile(path)) return "image";
    if (isDocumentFile(path)) return "document";
    return null;
  };

  type FileCandidate = {
    url: string;
    type: "image" | "document";
    label: string;
  };

  const fileMap = new Map<string, FileCandidate>();
  const addCandidate = (url: string, type: "image" | "document") => {
    if (!url) return;
    if (fileMap.has(url)) return;
    const label = url.split("/").pop() || "file";
    fileMap.set(url, { url, type, label });
  };

  if (item.content) {
    if (item.type === "image") {
      addCandidate(item.content, "image");
    } else if (item.type === "document") {
      addCandidate(item.content, "document");
    }
  }

  (item.files || []).forEach((path) => {
    const type = getFileType(path);
    if (type) {
      addCandidate(path, type);
    }
  });

  const fileCandidates = Array.from(fileMap.values());
  const imageCandidates = fileCandidates.filter((candidate) => candidate.type === "image");
  const documentCandidates = fileCandidates.filter((candidate) => candidate.type === "document");
  const previewImage = imageCandidates[0] || null;
  const hasMultipleImages = imageCandidates.length > 1;
  const firstDocumentFile = documentCandidates[0] || null;
  const displayFileName =
    firstDocumentFile?.label ||
    (item.type === "document" ? item.content?.split("/").pop() : null) ||
    "Document";

  const downloadFile = (url: string, label?: string) => {
    const filename = label || url.split("/").pop() || item.title || "file";
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFiles = () => {
    fileCandidates.forEach((file) => {
      downloadFile(file.url, file.label);
    });
  };

  const handleCardClick = () => {
    setShowViewDialog(true);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setShowViewDialog(true);
    }
  };

  const handleMergeImages = async () => {
    if (imageCandidates.length < 2) return;
    setMerging(true);
    setError(null);
    setInfoMessage(null);
    try {
      const password = getStoredPassword();
      const response = await fetch(`/api/items/${item.id}/merge`, {
        method: "POST",
        headers: {
          authorization: password || "",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to merge files");
      }

      setMergedPdfPath(data?.path || null);
      setInfoMessage(
        `Fusion réussie${data?.path ? ` · ${data.path}` : ""}. Rafraîchis la liste pour voir le PDF.`
      );
      setTimeout(() => setInfoMessage(null), 5000);
    } catch (error) {
      console.error("Error merging files:", error);
      setError("Failed to merge files");
      setTimeout(() => setError(null), 5000);
    } finally {
      setMerging(false);
    }
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

  const displayContent = previewImage ? (
    <div className="relative h-48 w-full overflow-hidden rounded-md bg-muted/20">
      <Image
        src={previewImage.url}
        alt={item.title || "Item preview"}
        fill
        className="object-contain"
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 rounded-full border border-border/50 bg-card/70 p-1 text-sm"
        onClick={(event) => {
          event.stopPropagation();
          downloadFile(previewImage.url, previewImage.label);
        }}
      >
        <Download className="h-4 w-4" />
      </Button>
      {hasMultipleImages && (
        <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          +{imageCandidates.length - 1} images
        </span>
      )}
    </div>
  ) : firstDocumentFile ? (
    <div className="flex items-center justify-center h-48 w-full rounded-md border border-border bg-muted/50">
      <div className="text-center">
        <File className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{displayFileName}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {getFileExtension(displayFileName).toUpperCase()} file
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            if (firstDocumentFile) {
              downloadFile(firstDocumentFile.url, firstDocumentFile.label);
            }
          }}
          className="mt-2"
        >
          <Download className="mr-2 h-4 w-4" />
          Télécharger
        </Button>
      </div>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground line-clamp-3">
      {item.content}
    </p>
  );

  return (
    <>
      {infoMessage && (
        <Alert className="mb-4">
          <AlertDescription>{infoMessage}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className="group relative overflow-hidden border-2 border-border/30 bg-card/20 backdrop-blur-xl transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
      >
        <MagicCard
          gradientFrom="#00D9FF"
          gradientTo="#00D9FF"
          className="h-full"
          transparent={true}
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
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  setShowViewDialog(true);
                }}
              >
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  onEdit(item);
                }}
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  setShowDeleteDialog(true);
                }}
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
            {fileCandidates.length > 0 ? (
              <div className="space-y-4">
                {fileCandidates.map((file) => (
                  <div
                    key={file.url}
                    className="rounded-2xl border border-border bg-card/10 shadow-sm"
                  >
                    {file.type === "image" ? (
                      <div className="relative h-[420px] overflow-hidden rounded-2xl border-b border-border bg-muted/10">
                        <Image
                          src={file.url}
                          alt={item.title || "Item image"}
                          fill
                          className="object-contain"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-3 rounded-full border border-border/60 bg-background/80 p-2 shadow-md"
                          onClick={() => downloadFile(file.url, file.label)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 px-4 py-6">
                        <div className="flex items-center gap-3">
                          <File className="h-10 w-10 text-muted-foreground" />
                          <div>
                            <p className="text-base font-medium">
                              {file.label}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {getFileExtension(file.label).toUpperCase()} file
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => downloadFile(file.url, file.label)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
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
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={downloadAllFiles}
                disabled={fileCandidates.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger tout
              </Button>
              {imageCandidates.length > 1 && (
                <Button
                  variant="outline"
                  onClick={handleMergeImages}
                  disabled={merging}
                >
                  <Merge className="mr-2 h-4 w-4" />
                  {merging ? "Fusion..." : "Fusionner"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  if (!mergedPdfPath) return;
                  downloadFile(
                    mergedPdfPath,
                    mergedPdfPath.split("/").pop() || "fusion.pdf"
                  );
                }}
                disabled={!mergedPdfPath}
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger la fusion
              </Button>
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

