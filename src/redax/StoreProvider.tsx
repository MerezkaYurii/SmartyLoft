'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './store';

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Функция внутри useState выполнится строго один раз при инициализации компонента
    const [store] = useState<AppStore>(() => makeStore());

    return <Provider store={store}>{children}</Provider>;
}