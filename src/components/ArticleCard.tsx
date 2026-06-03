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
    <article className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <header className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">
          {article.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            article.published
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-amber-50 text-amber-700 ring-amber-200"
          }`}
        >
          {article.published ? "Published" : "Draft"}
        </span>
      </header>

      <p className="mb-3 text-xs text-slate-500">
        Author:{" "}
        <span className="font-mono text-slate-600">{article.authorId}</span>
      </p>

      <p className="mb-4 text-sm leading-relaxed text-slate-700">
        {article.body}
      </p>

      <div className="flex flex-wrap gap-2">
        <Can I="update" this={item}>
          <button
            onClick={() => onTogglePublish(article.id)}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 active:bg-sky-800"
          >
            {article.published ? "Unpublish" : "Publish"}
          </button>
        </Can>

        <Can I="delete" this={item}>
          <button
            onClick={handleDelete}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100"
          >
            Delete
          </button>
        </Can>
      </div>
    </article>
  );
}