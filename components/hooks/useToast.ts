import { useCallback, useState } from "react";
import type { ToastType } from "../scanner/types";

export function useToast() {
    const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
        null,
    );

    const showToast = useCallback((msg: string, type: ToastType = "info") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2200);
    }, []);

    return { toast, showToast };
}