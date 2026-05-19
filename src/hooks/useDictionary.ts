'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '../redax/store';
import type { Dictionary } from '../i18n-config';

export const useDictionary = (): Dictionary | null => {
  // Возвращаем чистый объект из стора без фейковых затылок `{}`
  return useSelector((state: RootState) => state.dictionary.dict);
};
