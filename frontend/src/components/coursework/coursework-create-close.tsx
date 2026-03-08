"use client";

import { createContext, useContext } from "react";

type CloseContextValue = {
    setBeforeClose: (fn: (() => void) | null) => void;
};

const CourseworkCreateCloseContext = createContext<CloseContextValue | null>(null);

export function useCourseworkCreateClose() {
    const value = useContext(CourseworkCreateCloseContext);
    if (!value) {
        throw new Error("useCourseworkCreateClose must be used within its provider.");
    }
    return value;
}

export { CourseworkCreateCloseContext };