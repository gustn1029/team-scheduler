import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
    reducer: {},
    devTools: import.meta.env.MODE !== 'production', // 개발 모드일 때만 devTools 사용
});
