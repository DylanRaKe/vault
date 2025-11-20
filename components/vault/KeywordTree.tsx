"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Item } from "@/types/item";

interface KeywordTreeProps {
  items: Item[];
  selectedKeyword?: string;
  onSelectKeyword: (keyword: string | null) => void;
}

interface KeywordNode {
  name: string;
  fullPath: string;
  children: Map<string, KeywordNode>;
  items: Item[];
}

function buildKeywordTree(items: Item[]): KeywordNode {
  const root: KeywordNode = {
    name: "",
    fullPath: "",
    children: new Map(),
    items: [],
  };

  items.forEach((item) => {
    item.keywords.forEach((keyword) => {
      const parts = keyword.split("/").filter((p) => p.trim());
      let current = root;
      current.items.push(item);

      parts.forEach((part, index) => {
        if (!current.children.has(part)) {
          current.children.set(part, {
            name: part,
            fullPath: parts.slice(0, index + 1).join("/"),
            children: new Map(),
            items: [],
          });
        }
        current = current.children.get(part)!;
        current.items.push(item);
      });
    });
  });

  return root;
}

function TreeNode({
  node,
  level,
  selectedKeyword,
  onSelectKeyword,
  expanded,
  onToggle,
}: {
  node: KeywordNode;
  level: number;
  selectedKeyword?: string;
  onSelectKeyword: (keyword: string | null) => void;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const hasChildren = node.children.size > 0;
  const isExpanded = expanded.has(node.fullPath);
  const isSelected = selectedKeyword === node.fullPath;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors",
          isSelected && "bg-primary/20 text-primary",
          !isSelected && "hover:bg-muted cursor-pointer"
        )}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={() => {
          if (hasChildren) {
            onToggle(node.fullPath);
          }
          onSelectKeyword(node.fullPath || null);
        }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.fullPath);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="h-4 w-4" />
        )}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )
        ) : null}
        <span className="flex-1">
          {node.name || "All Items"} ({node.items.length})
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {Array.from(node.children.values()).map((child) => (
            <TreeNode
              key={child.fullPath}
              node={child}
              level={level + 1}
              selectedKeyword={selectedKeyword}
              onSelectKeyword={onSelectKeyword}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function KeywordTree({
  items,
  selectedKeyword,
  onSelectKeyword,
}: KeywordTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildKeywordTree(items), [items]);

  const toggleExpanded = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="space-y-1">
      <TreeNode
        node={tree}
        level={0}
        selectedKeyword={selectedKeyword}
        onSelectKeyword={onSelectKeyword}
        expanded={expanded}
        onToggle={toggleExpanded}
      />
    </div>
  );
}

