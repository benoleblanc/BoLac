import { useEffect } from 'react';
import { useUiStore } from '@/stores/uiStore';

/**
 * Applique le thème courant (issu de uiStore, déjà persisté dans
 * localStorage) comme classe `dark` sur <html>, pour que le variant
 * Tailwind `dark:` (voir src/index.css) réagisse au toggle.
 *
 * À monter une seule fois, près de la racine de l'app (voir src/App.tsx).
 */
export function useTheme(): void {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
}
