import { useMemo, useState } from "react";
import { AbilityProvider } from "@casl/react";
import { defineAbilityFor } from "./ability";
import { USERS, INITIAL_ARTICLES } from "./data";
import type { Article, User } from "./types";
import { UserSwitcher } from "./components/UserSwitcher";
import { ArticleCard } from "./components/ArticleCard";
import { NewArticleForm } from "./components/NewArticleForm";

const RULES_BY_ROLE: Record<User["role"], string[]> = {
  admin: [
    "manage all — do anything to anything",
    "except: delete published articles",
  ],
  writer: [
    "read all articles",
    "create new articles",
    "update own articles",
    "delete own articles, drafts only",
  ],
  guest: ["read published articles only"],
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);

  const ability = useMemo(() => defineAbilityFor(currentUser), [currentUser]);

  const handleDelete = (id: string) =>
    setArticles((prev) => prev.filter((a) => a.id !== id));

  const handleTogglePublish = (id: string) =>
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, published: !a.published } : a))
    );

  const handleCreate = (article: Article) =>
    setArticles((prev) => [article, ...prev]);

  return (
    <AbilityProvider value={ability}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              CASL React POC
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Switch users to see how the UI changes based on permissions.
            </p>
          </header>

          <div className="mb-4">
            <UserSwitcher currentUser={currentUser} onChange={setCurrentUser} />
          </div>

          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
              Active rules for {currentUser.role}
            </p>
            <ul className="list-disc pl-5 text-sm text-amber-900">
              {RULES_BY_ROLE[currentUser.role].map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <NewArticleForm currentUser={currentUser} onCreate={handleCreate} />
          </div>

          <div className="space-y-3">
            {articles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-sm text-slate-500">
                No articles to show.
              </div>
            ) : (
              articles.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </AbilityProvider>
  );
}