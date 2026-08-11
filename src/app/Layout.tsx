import type { ReactNode } from 'react';
import { BottomNav } from '@/app/BottomNav';
import { ThemeToggle } from '@/features/settings/components/ThemeToggle';
import { useUiStore } from '@/stores/uiStore';

const SCREEN_TITLES: Record<string, string> = {
  map: 'Carte',
  trips: 'Trajets',
  waypoints: 'Waypoints',
  export: 'Export',
  settings: 'Cartes hors ligne',
};

interface LayoutProps {
  children: ReactNode;
}

/**
 * Shell applicatif mobile-first : en-tête sobre + zone de contenu + nav
 * basse. `main` a `overflow-hidden` pour que ce soit l'écran actif (ex: la
 * carte plein cadre) qui gère son propre scroll interne si besoin.
 */
export function Layout({ children }: LayoutProps) {
  const activeScreen = useUiStore((state) => state.activeScreen);

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 pt-[env(safe-area-inset-top)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 py-2.5">
          <img src="/icons/icon.svg" alt="" className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              BoLac
            </p>
            <h1 className="text-base font-semibold">
              {SCREEN_TITLES[activeScreen] ?? 'BoLac'}
            </h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 overflow-hidden">{children}</main>

      <BottomNav />
    </div>
  );
}
