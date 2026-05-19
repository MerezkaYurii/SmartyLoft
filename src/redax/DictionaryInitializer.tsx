'use client';

import { useRef } from 'react';
import { useStore } from 'react-redux';
import { setDictionary } from './dictionarySlice';
import type { Dictionary } from '../i18n-config';
import type { AppStore } from './store';

export default function DictionaryInitializer({
    dictionary,
}: {
    dictionary: Dictionary;
}) {
    const store = useStore() as AppStore;
    const initialized = useRef<boolean | null>(null);

    // Если флаг false — значит, мы ЕЩЕ НЕ инициализировали стор
    if (initialized.current === null) {
        store.dispatch(setDictionary(dictionary));
        initialized.current = true; // Меняем на true, чтобы больше сюда не заходить
    }

    return null;
}