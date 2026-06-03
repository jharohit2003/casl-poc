import type { User } from "../types";
import { USERS } from "../data";

interface Props {
  currentUser: User;
  onChange: (user: User) => void;
}

export function UserSwitcher({ currentUser, onChange }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span>Logged in as: </span>
      {USERS.map((u) => (
        <button
          key={u.id}
          style={{
            marginRight: 8,
            fontWeight: u.id === currentUser.id ? "bold" : "normal",
          }}
          onClick={() => onChange(u)}
        >
          {u.name}
        </button>
      ))}
    </div>
  );
}
