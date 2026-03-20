const arrayToCSV = (arr:string[]) => {
    if (!arr || arr.length === 0) return null;
    return arr.join(", ");
}   

const safeStringArray = (value: any) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
    } catch {
        return [];
    }
}

export { arrayToCSV, safeStringArray }