import { Moon, Sun } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggleTheme);
  return (
    <IconButton label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </IconButton>
  );
}
