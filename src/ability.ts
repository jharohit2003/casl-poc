import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";
import type { Article, User } from "./types";

export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects = "Article" | "all" | Article;

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFor(user: User): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility
  );

  if (user.role === "admin") {
    can("manage", "all");
    cannot("delete", "Article", { published: true }).because(
      "Published articles must be unpublished before deletion."
    );
  } else if (user.role === "writer") {
    can("read", "Article");
    can("create", "Article");
    can("update", "Article", { authorId: user.id });
    can("delete", "Article", { authorId: user.id, published: false });
  } else {
    can("read", "Article", { published: true });
  }

  return build();
}