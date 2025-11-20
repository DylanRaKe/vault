"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchBar, type SearchBarRef } from "@/components/vault/SearchBar";
import { ItemCard } from "@/components/vault/ItemCard";
import { ItemForm } from "@/components/vault/ItemForm";
import { KeywordTree } from "@/components/vault/KeywordTree";
import { KeyboardShortcutsMenu } from "@/components/vault/KeyboardShortcutsMenu";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Plus } from "lucide-react";
import type { Item } from "@/types/item";
import { getStoredPassword } from "@/lib/storage";
import { useKeyboardShortcut } from "@/lib/useKeyboardShortcut";

export default function VaultPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortcutsMenuOpen, setShortcutsMenuOpen] = useState(false);
  const searchBarRef = useRef<SearchBarRef>(null);

  const fetchItems = useCallback(async () => {
    try {
      const password = getStoredPassword();
      const response = await fetch("/api/items", {
        headers: {
          authorization: password || "",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const password = getStoredPassword();
    if (!password) {
      router.push("/login");
      return;
    }

    fetchItems();
  }, [router, fetchItems]);

  useEffect(() => {
    let filtered = items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(query);
        const contentMatch = item.content?.toLowerCase().includes(query);
        const keywordMatch = item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(query)
        );
        return titleMatch || contentMatch || keywordMatch;
      });
    }

    if (selectedKeyword) {
      filtered = filtered.filter((item) =>
        item.keywords.some((keyword) => keyword === selectedKeyword)
      );
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedKeyword]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFormSuccess = () => {
    fetchItems();
  };


  // Raccourci Ctrl/Cmd + N : Nouvel item
  useKeyboardShortcut({
    key: "n",
    handler: () => {
      handleCreate();
    },
  });

  // Raccourci Ctrl/Cmd + K : Focus sur la recherche
  useKeyboardShortcut({
    key: "k",
    handler: () => {
      searchBarRef.current?.focus();
    },
  });

  // Raccourci / : Focus sur la recherche
  useKeyboardShortcut({
    key: "/",
    handler: () => {
      searchBarRef.current?.focus();
    },
    ctrlKey: false,
  });

  // Raccourci Ctrl/Cmd + E : Éditer le premier item
  useKeyboardShortcut({
    key: "e",
    handler: () => {
      if (filteredItems.length > 0) {
        handleEdit(filteredItems[0]);
      }
    },
  });

  // Raccourci Ctrl/Cmd + ? : Ouvrir le menu d'aide
  useKeyboardShortcut({
    key: "?",
    handler: () => {
      setShortcutsMenuOpen((prev) => !prev);
    },
    shiftKey: true,
  });

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <FlickeringGrid className="absolute inset-0" color="rgb(255, 255, 255)" />
        <div className="relative z-10 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      <FlickeringGrid className="absolute inset-0" color="rgb(255, 255, 255)" />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card className="p-4 bg-card/20 backdrop-blur-xl border-border/30">
              <h2 className="mb-4 font-semibold">Keywords</h2>
              <KeywordTree
                items={items}
                selectedKeyword={selectedKeyword || undefined}
                onSelectKeyword={setSelectedKeyword}
              />
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <SearchBar
                ref={searchBarRef}
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  if (!value) {
                    setSelectedKeyword(null);
                  }
                }}
              />
            </div>

            {filteredItems.length === 0 ? (
              <Card className="p-12 text-center bg-card/20 backdrop-blur-xl border-border/30">
                <p className="text-muted-foreground">
                  {searchQuery || selectedKeyword
                    ? "No items found matching your criteria"
                    : "No items yet. Create your first item to get started!"}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <ItemForm
          open={formOpen}
          onOpenChange={setFormOpen}
          item={editingItem}
          onSuccess={handleFormSuccess}
        />

        <KeyboardShortcutsMenu
          open={shortcutsMenuOpen}
          onOpenChange={setShortcutsMenuOpen}
        />
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={handleCreate}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Create new item"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}

