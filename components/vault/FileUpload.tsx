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
  value?: string;
  onChange: (path: string) => void;
  accept?: string;
  label?: string;
  type: "image" | "document";
}

export function FileUpload({ 
  value, 
  onChange, 
  accept,
  label,
  type 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

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
      onChange(data.path);
      setError(null);
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Failed to upload ${type}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  const getFileExtension = (path: string) => {
    return path.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = (path: string) => {
    const ext = getFileExtension(path);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

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
      {value ? (
        <div className="relative">
          {type === "image" || isImage(value) ? (
            <img
              src={value}
              alt="Uploaded"
              className="h-48 w-full rounded-md object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-48 w-full rounded-md border border-border bg-muted/50">
              <div className="text-center">
                <File className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {value.split('/').pop()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getFileExtension(value).toUpperCase()} file
                </p>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div>
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept || (type === "image" ? "image/*" : "*/*")}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : `Upload ${type === "image" ? "Image" : "Document"}`}
          </Button>
        </div>
      )}
    </div>
  );
}

