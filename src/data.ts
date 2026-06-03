import type { Article, User } from "./types";

export const USERS: User[] = [
  { id: "u_admin", name: "Asha (Admin)", role: "admin" },
  { id: "u_writer", name: "Ravi (Writer)", role: "writer" },
  { id: "u_guest", name: "Pat (Guest)", role: "guest" },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "a1",
    title: "Getting started with CASL",
    body: "CASL is an authorization library.",
    authorId: "u_writer",
    published: true,
  },
  {
    id: "a2",
    title: "Draft: advanced conditions",
    body: "MongoDB-style operators let you express complex rules.",
    authorId: "u_writer",
    published: false,
  },
  {
    id: "a3",
    title: "Admin announcement",
    body: "An internal note.",
    authorId: "u_admin",
    published: true,
  },
];