import { Can, useAbility } from "@casl/react";
import { ForbiddenError, subject as asSubject } from "@casl/ability";
import type { Article } from "../types";
import type { AppAbility } from "../ability";

interface Props {
  article: Article;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
}

export function ArticleCard({ article, onDelete, onTogglePublish }: Props) {
  const ability = useAbility<AppAbility>();
  const item = asSubject("Article", article);

  const handleDelete = () => {
    try {
      ForbiddenError.from(ability).throwUnlessCan("delete", item);
      onDelete(article.id);
    } catch (err) {
      if (err instanceof ForbiddenError) {
        alert(`Not allowed: ${err.message}`);
      }
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <h3>
        {article.title} {article.published ? "🟢 Published" : "⚪ Draft"}
      </h3>
      <p style={{ color: "#666", fontSize: 13 }}>Author: {article.authorId}</p>
      <p>{article.body}</p>
      <div>
        <Can I="update" this={item}>
          <button
            style={{ marginRight: 8 }}
            onClick={() => onTogglePublish(article.id)}
          >
            {article.published ? "Unpublish" : "Publish"}
          </button>
        </Can>
        <Can I="delete" this={item}>
          <button onClick={handleDelete}>Delete</button>
        </Can>
      </div>
    </div>
  );
}
