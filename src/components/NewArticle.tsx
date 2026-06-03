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
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="New article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: 8, padding: 4 }}
        />
        <button onClick={handleSubmit}>Create</button>
      </div>
    </Can>
  );
}
