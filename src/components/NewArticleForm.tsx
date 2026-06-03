import { useState } from "react";
import { Can } from "@casl/react";
import type { Article, User } from "../types";

interface Props {
  currentUser: User;
  onCreate: (article: Article) => void;
}

export function NewArticleForm({ currentUser, onCreate }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate({
      id: `a_${Date.now()}`,
      title,
      body: "A new draft article.",
      authorId: currentUser.id,
      published: false,
    });
    setTitle("");
  };

  return (
    <Can I="create" a="Article">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Create a new article
        </label>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Article title…"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:bg-slate-700"
          >
            Create
          </button>
        </div>
      </div>
    </Can>
  );
}