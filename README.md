# CASL Practice Project

A small hands-on project for learning **authorization** (specifically **role-based access control**, or RBAC) with [CASL](https://casl.js.org), one of the most popular authorization libraries in the JavaScript ecosystem.

The goal here is not to build a full app, but to understand the core question every authorization system answers: **"Can this user perform this action on this resource?"**

## What is CASL

CASL (pronounced "castle") is an isomorphic authorization library. Isomorphic means the same rules run on both the frontend and the backend, so you define permissions once and reuse them in your UI, your API, and even your database queries. It scales from simple role checks all the way up to attribute-based rules (for example, "a user can edit a post only if they are its author").

## What you will learn

1. The difference between authentication (who you are) and authorization (what you are allowed to do).
2. How CASL models permissions as **abilities**.
3. How to define different permissions for different **roles**.
4. How to check permissions in your code with `can` and `cannot`.
5. How to add **conditions** so permissions depend on the data itself (ownership), not just the role.

## Core concept: an Ability

In CASL, a permission is built from up to four parts. The last three of these are increasingly specific.

| Part | Meaning | Example |
| --- | --- | --- |
| Action | What the user is trying to do (usually a verb) | `read`, `create`, `update`, `delete` |
| Subject | The resource or entity the action applies to | `Article`, `Comment`, `User` |
| Conditions | Optional rules on the data that must be true | `{ authorId: user.id }` |
| Fields | Optional specific fields the rule applies to | `["title", "body"]` |

Two special keywords make role setup concise:

- `manage` means **any action**.
- `all` means **any subject**.

So `can('manage', 'all')` is the classic "admin can do everything" rule.

## Installation

```bash
npm install @casl/ability
```

Then install the project's own dependencies:

```bash
npm install
```

## Project structure

> Adjust this to match your actual files.

```
casl-practise/
├── src/
│   ├── abilities.js     # defines permissions per role (the heart of the project)
│   ├── users.js         # sample users with roles
│   └── index.js         # runs the permission checks and prints results
├── package.json
└── README.md
```

## Defining roles and abilities

This is where role-based access is set up. Each role gets a different set of rules.

```js
// src/abilities.js
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  switch (user.role) {
    case "admin":
      // Admin can do anything to anything
      can("manage", "all");
      break;

    case "editor":
      // Editors can read and write articles, but not delete them
      can("read", "Article");
      can("create", "Article");
      can("update", "Article");
      // ...except they can update only their own once published
      cannot("update", "Article", { published: true, authorId: { $ne: user.id } });
      can("read", "Comment");
      break;

    case "user":
    default:
      // Regular users can read articles and manage only their own comments
      can("read", "Article");
      can("create", "Comment");
      can("update", "Comment", { authorId: user.id }); // ownership condition
      can("delete", "Comment", { authorId: user.id });
      break;
  }

  return build();
}
```

The condition `{ authorId: user.id }` is the key idea behind attribute-based checks: the permission is granted only when the resource's `authorId` matches the current user. This is how you express "you can edit your own comments, but not other people's."

## Checking permissions

Once an ability is built, you ask it yes/no questions.

```js
// src/index.js
import { defineAbilitiesFor } from "./abilities.js";
import { subject } from "@casl/ability";

const user = { id: 1, role: "user" };
const ability = defineAbilitiesFor(user);

// Simple checks (by subject type)
console.log(ability.can("read", "Article"));    // true
console.log(ability.can("delete", "Article"));   // false

// Checks against a specific object, so conditions are evaluated
const ownComment = subject("Comment", { id: 10, authorId: 1 });
const otherComment = subject("Comment", { id: 11, authorId: 2 });

console.log(ability.can("update", ownComment));   // true  (they own it)
console.log(ability.can("update", otherComment)); // false (not theirs)
```

Note the `subject()` helper. When checking conditions against a plain object, CASL needs to know which subject type that object is. `subject('Comment', data)` tags the object so the rules apply correctly.

## Throwing on a denied action

Instead of branching on `can`, you can enforce a permission and throw a clear error when it fails.

```js
import { ForbiddenError } from "@casl/ability";

ForbiddenError.from(ability).throwUnlessCan("delete", otherComment);
// throws: ForbiddenError: Cannot execute "delete" on "Comment"
```

## Running the project

> Adjust to your actual entry point.

```bash
node src/index.js
```

You should see a series of `true` / `false` results showing how the same action is allowed or denied depending on the user's role and whether they own the resource.

## Try this yourself

To deepen your understanding, experiment with the rules:

1. Add a new role, such as `moderator`, that can delete any comment but cannot touch articles.
2. Add a `published` condition so editors cannot edit an article after it is published.
3. Switch the `user` object's role and re-run to watch the permission results change.
4. Add field-level rules, for example letting users update only the `body` of their comment, not the `authorId`.

## Key takeaways

- Authorization answers "what can this user do," separate from authentication ("who is this user").
- CASL turns business rules into a small set of `can` / `cannot` declarations.
- Roles define the broad strokes; conditions handle ownership and data-specific access.
- The same ability object can be reused across UI, API, and data layers, which keeps permission logic in one place.

## Security note

CASL is actively maintained and occasionally ships security fixes (for example, a prototype-pollution issue patched in early 2026). Keep `@casl/ability` updated with `npm update @casl/ability` and avoid passing untrusted user input directly into rule conditions.

## Resources

- CASL documentation: https://casl.js.org
- Guide on abilities and conditions: https://casl.js.org/v6/en/guide/intro
- CASL on npm: https://www.npmjs.com/package/@casl/ability

## License

MIT
