export interface Article {
  id: string;
  title: string;
  body: string;
  authorId: string;
  published: boolean;
}

export type Role = "guest" | "writer" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
}