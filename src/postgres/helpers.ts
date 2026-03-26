export const nowIso = () => new Date().toISOString();

export const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
