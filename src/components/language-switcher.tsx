/**
 * Language Switcher Component
 *
 * Dropdown component to switch between supported languages
 */

'use client';

import { useI18n, locales, localeNames, type Locale } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className="flex items-center justify-between"
          >
            <span>{localeNames[loc]}</span>
            {locale === loc && <Check className="h-4 w-4 text-primary ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple inline language switcher
export function SimpleLanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === loc
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
