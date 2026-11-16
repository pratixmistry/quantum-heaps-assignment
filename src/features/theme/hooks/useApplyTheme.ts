import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

/** Syncs the persisted theme to the <html> class that Tailwind's `dark:` variant keys off. */
export function useApplyTheme() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#f5f6f8');
  }, [theme]);
}
