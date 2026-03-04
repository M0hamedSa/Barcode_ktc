export async function apiLookupBarcode(barcode: string) {
    const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode }),
    });

    const json = await res.json();
    return { res, json };
}