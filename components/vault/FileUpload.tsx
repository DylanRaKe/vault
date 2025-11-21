"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, X, AlertCircle, File } from "lucide-react";
import { getStoredPassword } from "@/lib/storage";
import Image from "next/image";

interface FileUploadProps {
  value?: string | string[];
  onChange: (path: string | string[]) => void;
  accept?: string;
  label?: string;
  type: "image" | "document";
  isDragging?: boolean;
  multiple?: boolean;
}

export function FileUpload({ 
  value, 
  onChange, 
  accept,
  label,
  type,
  isDragging = false,
  multiple = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });

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
      
      if (multiple) {
        const currentFiles = Array.isArray(value) ? value : [];
        onChange([...currentFiles, ...data.paths]);
      } else {
        onChange(data.paths[0] || data.path);
      }
      setError(null);
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Failed to upload ${type}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (Array.isArray(value)) {
      const newFiles = value.filter((_, index) => index !== indexToRemove);
      onChange(newFiles);
    } else {
      onChange("");
    }
  };

  const getFileExtension = (path: string) => {
    return path.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = (path: string) => {
    const ext = getFileExtension(path);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  const filesArray = Array.isArray(value) ? value : (value ? [value] : []);

  return (
    <div className="space-y-2">
      <Label>{label || (type === "image" ? "Image" : "Document")}</Label>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {filesArray.length > 0 ? (
        <div className="space-y-2">
          {filesArray.map((filePath, index) => (
            <div key={index} className="relative">
              {type === "image" || isImage(filePath) ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={filePath}
                    alt={`Uploaded ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 w-full rounded-md border border-border bg-muted/50">
                  <div className="text-center">
                    <File className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {filePath.split('/').pop()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getFileExtension(filePath).toUpperCase()} file
                    </p>
                  </div>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      {(multiple || filesArray.length === 0) && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 transition-all
            ${isDragging 
              ? "border-primary bg-primary/10" 
              : "border-border hover:border-primary/50 hover:bg-accent/5"
            }
            ${uploading ? "opacity-50 cursor-wait" : "cursor-pointer"}
          `}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept || (type === "image" ? "image/*" : "*/*")}
            onChange={handleFileChange}
            disabled={uploading}
            multiple={multiple}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className={`
              p-4 rounded-full transition-colors
              ${isDragging ? "bg-primary/20" : "bg-muted/50"}
            `}>
              <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragging 
                  ? "Drop your file here" 
                  : uploading 
                    ? "Uploading..." 
                    : `Click or drag to upload ${multiple ? "files" : (type === "image" ? "image" : "document")}`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {type === "image" 
                  ? "PNG, JPG, GIF up to 10MB" 
                  : "Any file type up to 10MB"
                }
                {multiple && " (multiple files allowed)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

