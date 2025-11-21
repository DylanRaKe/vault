export type ItemType = "text" | "image" | "document";

export interface Item {
  id: string;
  title: string | null;
  content: string | null;
  files?: string[];
  type: ItemType;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateItemInput {
  title?: string;
  content?: string;
  files?: string[];
  type: ItemType;
  keywords: string[];
}

export interface UpdateItemInput {
  title?: string;
  content?: string;
  files?: string[];
  keywords?: string[];
}

