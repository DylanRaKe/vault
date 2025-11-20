import { db } from "@/lib/db";
import type { Item, CreateItemInput, UpdateItemInput, ItemType } from "@/types/item";

function isTableNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2021"
  );
}

export async function getAllItems(): Promise<Item[]> {
  try {
    const items = await db.item.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return items.map((item) => ({
      ...item,
      type: item.type as ItemType,
      keywords: JSON.parse(item.keywords || "[]") as string[],
    }));
  } catch (error) {
    // Si la table n'existe pas encore, retourner un tableau vide
    if (isTableNotFoundError(error)) {
      return [];
    }
    throw error;
  }
}

export async function getItemById(id: string): Promise<Item | null> {
  try {
    const item = await db.item.findUnique({
      where: { id },
    });

    if (!item) return null;

    return {
      ...item,
      type: item.type as ItemType,
      keywords: JSON.parse(item.keywords || "[]") as string[],
    };
  } catch (error) {
    // Si la table n'existe pas encore, retourner null
    if (isTableNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

export async function searchItems(query: string): Promise<Item[]> {
  const allItems = await getAllItems();
  const lowerQuery = query.toLowerCase();

  return allItems.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(lowerQuery);
    const contentMatch = item.content?.toLowerCase().includes(lowerQuery);
    const keywordMatch = item.keywords.some((keyword) =>
      keyword.toLowerCase().includes(lowerQuery)
    );

    return titleMatch || contentMatch || keywordMatch;
  });
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const item = await db.item.create({
    data: {
      title: input.title,
      content: input.content,
      type: input.type,
      keywords: JSON.stringify(input.keywords),
    },
  });

  return {
    ...item,
    type: item.type as ItemType,
    keywords: JSON.parse(item.keywords || "[]") as string[],
  };
}

export async function updateItem(
  id: string,
  input: UpdateItemInput
): Promise<Item> {
  const updateData: {
    title?: string;
    content?: string;
    keywords?: string;
  } = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.keywords !== undefined)
    updateData.keywords = JSON.stringify(input.keywords);

  const item = await db.item.update({
    where: { id },
    data: updateData,
  });

  return {
    ...item,
    type: item.type as ItemType,
    keywords: JSON.parse(item.keywords || "[]") as string[],
  };
}

export async function deleteItem(id: string): Promise<void> {
  await db.item.delete({
    where: { id },
  });
}

