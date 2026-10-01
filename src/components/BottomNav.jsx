import { NavLink } from "react-router-dom";

/** Mobil ilova uslubidagi pastki menyu */
export default function BottomNav({ items }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex max-w-3xl">
        {items.map(({ to, label, icon: Icon, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold leading-tight ${
                isActive ? "text-brand" : "text-muted"
              }`
            }
          >
            <span className="relative">
              <Icon size={22} />
              {badge > 0 && (
                <span className="absolute -right-2 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-pen px-1 text-[10px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
            <span className="text-center">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
