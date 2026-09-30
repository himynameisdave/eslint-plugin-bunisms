const effects = globalThis as typeof globalThis & { bunismsModuleMockEffects?: number };
effects.bunismsModuleMockEffects = (effects.bunismsModuleMockEffects ?? 0) + 1;

export const value = 'original';
