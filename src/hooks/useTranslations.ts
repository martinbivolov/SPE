import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const cache: Record<string, Record<string, string>> = {};

export const clearTranslationCache = () => {
  Object.keys(cache).forEach((key) => delete cache[key]);
};

export const useTranslations = (tableName: string, columnName: string) => {
  const { language } = useLanguage();
  const cacheKey = `${tableName}:${columnName}:${language}`;
  const [translations, setTranslations] = useState<Record<string, string>>(
    cache[cacheKey] ?? {},
  );

  useEffect(() => {
    if (!language || language === 'en') {
      setTranslations({});
      return;
    }
    supabase
      .from('translations')
      .select('row_id, translated_text')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .eq('language', language)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((t: any) => {
          map[t.row_id] = t.translated_text;
        });
        cache[cacheKey] = map;
        setTranslations(map);
      });
  }, [tableName, columnName, language, cacheKey]);

  const translate = (id: string, fallback: string): string =>
    translations[id] ?? fallback;

  return { translate };
};
