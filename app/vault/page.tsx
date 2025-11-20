"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchBar, type SearchBarRef } from "@/components/vault/SearchBar";
import { ItemCard } from "@/components/vault/ItemCard";
import { ItemForm } from "@/components/vault/ItemForm";
import { KeywordTree } from "@/components/vault/KeywordTree";
import { KeyboardShortcutsMenu } from "@/components/vault/KeyboardShortcutsMenu";
import { VaultLogo } from "@/components/logo/VaultLogo";
import { Plus, LogOut } from "lucide-react";
import type { Item } from "@/types/item";
import { getStoredPassword, clearStoredPassword } from "@/lib/storage";
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

  useEffect(() => {
    const password = getStoredPassword();
    if (!password) {
      router.push("/login");
      return;
    }

    fetchItems();
  }, [router]);

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

  const fetchItems = async () => {
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
  };

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

  const handleLogout = () => {
    clearStoredPassword();
    router.push("/login");
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <VaultLogo size={32} />
            <h1 className="text-2xl font-bold">Vault</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Item
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card className="p-4">
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
              <Card className="p-12 text-center">
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
  );
}

