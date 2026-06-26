# CASL POC

A hands-on practice project for learning **authorization** (role-based access control, RBAC) with [CASL](https://casl.js.org) in a **React + TypeScript** app built with **Vite**.

It answers the one question every authorization system exists to answer: **"Can this user perform this action on this resource?"** You switch between users with different roles and watch the UI allow or deny actions in real time.

## Tech stack

- **Vite** - build tool and dev server
- **React + TypeScript** - UI and type-safe rules
- **@casl/ability** - the authorization engine
- **@casl/react** - React bindings (`<Can>` component, `useAbility` hook)

## Authentication vs authorization

- **Authentication** = who you are (login).
- **Authorization** = what you are allowed to do.

This project is purely about the second one.

## Core concept: an Ability

A CASL permission is built from up to four parts (the last three are optional):

| Part | Meaning | Example |
| --- | --- | --- |
| Action | What the user is trying to do | `read`, `create`, `update`, `delete` |
| Subject | The resource the action applies to | `Article`, `User` |
| Conditions | Rules on the data that must be true | `{ authorId: user.id }` |
| Fields | Specific fields the rule applies to | `["title", "body"]` |

Two shortcuts: `manage` means any action, and `all` means any subject. So `can('manage', 'all')` is the classic "admin can do everything" rule.

## Project structure

```
casl-poc/
├── public/
├── src/
│   ├── assets/                 # images and icons (hero.png, react.svg, vite.svg)
│   ├── components/
│   │   ├── ArticleCard.tsx     # shows an article; Edit/Delete guarded by <Can>
│   │   ├── NewArticleForm.tsx  # create form, guarded by "create Article" ability
│   │   └── UserSwitcher.tsx    # switch the logged-in user to change roles
│   ├── ability.ts              # defines abilities per role + Ability context + <Can>
│   ├── data.ts                 # sample users and articles
│   ├── types.ts                # shared types (Actions, Subjects, User, Article)
│   ├── App.tsx                 # composes the demo and provides the ability
│   ├── App.css
│   └── main.tsx                # app entry
├── index.html
└── package.json
```

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server
npm run build   # production build
npm run preview # preview the production build
```

Then open the local URL Vite prints (usually http://localhost:5173).

## How it works

### 1. Shared types (`types.ts`)

Typing actions and subjects gives autocomplete and catches typos at compile time.

```ts
import type { MongoAbility } from "@casl/ability";

export type Actions = "create" | "read" | "update" | "delete" | "manage";
export type Subjects = "Article" | "User" | "all";
export type AppAbility = MongoAbility<[Actions, Subjects]>;

export type Role = "admin" | "editor" | "user";

export interface User {
  id: number;
  name: string;
  role: Role;
}

export interface Article {
  id: number;
  title: string;
  body: string;
  authorId: number;
  published: boolean;
}
```

### 2. Defining roles (`ability.ts`)

This is the heart of the project: each role gets a different set of rules.

```ts
import { createContext } from "react";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { createContextualCan } from "@casl/react";
import type { AppAbility, User } from "./types";

export function defineAbilityFor(user: User): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  switch (user.role) {
    case "admin":
      can("manage", "all"); // admin can do anything
      break;

    case "editor":
      can("read", "Article");
      can("create", "Article");
      can("update", "Article");
      cannot("delete", "Article"); // editors cannot delete
      break;

    case "user":
    default:
      can("read", "Article");
      can("update", "Article", { authorId: user.id }); // only their own
      can("delete", "Article", { authorId: user.id }); // only their own
      break;
  }

  return build();
}

// React context so any component can read the current ability
export const AbilityContext = createContext<AppAbility>(undefined!);
export const Can = createContextualCan(AbilityContext.Consumer);
```

The condition `{ authorId: user.id }` is the key idea behind ownership: the rule applies only when the article's `authorId` matches the current user.

### 3. Providing the ability (`App.tsx`)

```tsx
import { useMemo, useState } from "react";
import { AbilityContext, defineAbilityFor } from "./ability";
import { users } from "./data";
import UserSwitcher from "./components/UserSwitcher";
import NewArticleForm from "./components/NewArticleForm";
import ArticleCard from "./components/ArticleCard";
import { articles } from "./data";

export default function App() {
  const [currentUser, setCurrentUser] = useState(users[0]);
  const ability = useMemo(() => defineAbilityFor(currentUser), [currentUser]);

  return (
    <AbilityContext.Provider value={ability}>
      <h1>CASL RBAC demo</h1>
      <UserSwitcher users={users} current={currentUser} onSwitch={setCurrentUser} />
      <NewArticleForm />
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </AbilityContext.Provider>
  );
}
```

### 4. Guarding the UI with `<Can>`

`<Can>` renders its children only when the current ability permits the action. Use the `subject()` helper so CASL evaluates conditions against a specific object.

```tsx
// components/ArticleCard.tsx
import { subject } from "@casl/ability";
import { Can } from "../ability";
import type { Article } from "../types";

export default function ArticleCard({ article }: { article: Article }) {
  const a = subject("Article", article);
  return (
    <div className="card">
      <h3>{article.title}</h3>
      <p>{article.body}</p>

      <Can I="update" this={a}>
        <button>Edit</button>
      </Can>

      <Can I="delete" this={a}>
        <button>Delete</button>
      </Can>
    </div>
  );
}
```

```tsx
// components/NewArticleForm.tsx
import { Can } from "../ability";

export default function NewArticleForm() {
  return (
    <Can I="create" a="Article">
      <form>
        <input placeholder="Title" />
        <textarea placeholder="Body" />
        <button type="submit">Create article</button>
      </form>
    </Can>
  );
}
```

The `UserSwitcher` changes the current user, which rebuilds the ability, which instantly changes what every `<Can>` block renders.

## Checking permissions outside JSX

```ts
import { subject } from "@casl/ability";
import { defineAbilityFor } from "./ability";
import { users, articles } from "./data";

const ability = defineAbilityFor(users[0]);

ability.can("read", "Article");                          // true
ability.can("delete", subject("Article", articles[0]));  // depends on ownership/role
```

## Try this yourself

1. Add a `moderator` role that can delete any article but cannot create one.
2. Stop editors from updating an article once it is `published` (add a `cannot` with a condition).
3. Add field-level rules so users can edit only the `body`, not the `title`.
4. Add a new subject, such as `Comment`, with its own per-role rules.

## Key takeaways

- Authorization ("what can this user do") is separate from authentication ("who is this user").
- CASL turns business rules into a small set of `can` / `cannot` declarations in one place.
- Roles set the broad permissions; conditions handle ownership and data-specific access.
- `<Can>` keeps permission logic out of scattered `if` checks in your components.

## Security note

Keep CASL updated, since it occasionally ships security fixes (a prototype-pollution issue was patched in early 2026):

```bash
npm update @casl/ability @casl/react
```

Avoid passing untrusted user input directly into rule conditions.

## Resources

- CASL docs: https://casl.js.org
- React integration: https://casl.js.org/v6/en/package/casl-react

## License

MIT
