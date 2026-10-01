import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchUnreadCount } from "../api";
import { useAuth } from "./AuthContext";

const Ctx = createContext({ count: 0, refresh: () => {} });
export const useUnread = () => useContext(Ctx);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) return;
    fetchUnreadCount().then(setCount).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) { setCount(0); return; }
    refresh();
    const t = setInterval(refresh, 20000);
    return () => clearInterval(t);
  }, [user, refresh]);

  return <Ctx.Provider value={{ count, refresh, setCount }}>{children}</Ctx.Provider>;
}
