import { useMemo, useState } from "react";
import { AbilityProvider } from "@casl/react";
import { defineAbilityFor } from "./ability";
import { USERS, INITIAL_ARTICLES } from "./data";
import type { Article, User } from "./types";
import { UserSwitcher } from "./components/UserSwitcher";
import { ArticleCard } from "./components/ArticleCard";
import { NewArticleForm } from "./components/NewArticle";

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
      <div style={{ maxWidth: 720, margin: "32px auto", padding: 16 }}>
        <h1>CASL React POC</h1>
        <UserSwitcher currentUser={currentUser} onChange={setCurrentUser} />
        <NewArticleForm currentUser={currentUser} onCreate={handleCreate} />
        {articles.map((a) => (
          <ArticleCard
            key={a.id}
            article={a}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        ))}
      </div>
    </AbilityProvider>
  );
}