import type { User } from "../types";
import { USERS } from "../data";

interface Props {
  currentUser: User;
  onChange: (user: User) => void;
}

const roleStyles: Record<User["role"], string> = {
  admin: "bg-rose-100 text-rose-700 ring-rose-200",
  writer: "bg-sky-100 text-sky-700 ring-sky-200",
  guest: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function UserSwitcher({ currentUser, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <span className="mr-1 text-sm font-medium text-slate-500">
        Logged in as
      </span>
      {USERS.map((u) => {
        const active = u.id === currentUser.id;
        return (
          <button
            key={u.id}
            onClick={() => onChange(u)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ring-1 ring-inset ${
              active
                ? "bg-slate-900 text-white ring-slate-900 shadow"
                : `${roleStyles[u.role]} hover:brightness-95`
            }`}
          >
            {u.name}
          </button>
        );
      })}
    </div>
  );
}