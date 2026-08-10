import clsx from 'clsx';
import { useUiStore, type Screen } from '@/stores/uiStore';

interface NavItem {
  screen: Screen;
  label: string;
  icon: React.ReactNode;
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v14M15 6v14" />
    </svg>
  );
}

function TripsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 15h5" />
    </svg>
  );
}

function WaypointIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { screen: 'map', label: 'Carte', icon: <MapIcon /> },
  { screen: 'trips', label: 'Trajets', icon: <TripsIcon /> },
  { screen: 'waypoints', label: 'Mises à l’eau', icon: <WaypointIcon /> },
  { screen: 'export', label: 'Export', icon: <ExportIcon /> },
  { screen: 'settings', label: 'Réglages', icon: <SettingsIcon /> },
];

/** Navigation basse mobile-first — remplace un routeur pour cette app à 5 écrans fixes. */
export function BottomNav() {
  const activeScreen = useUiStore((state) => state.activeScreen);
  const setActiveScreen = useUiStore((state) => state.setActiveScreen);

  return (
    <nav
      className="flex shrink-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900"
      aria-label="Navigation principale"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.screen === activeScreen;
        return (
          <button
            key={item.screen}
            type="button"
            onClick={() => setActiveScreen(item.screen)}
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
              isActive
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
