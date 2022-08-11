export function sliceArray<T>(array: T[], index: number): T[] {
    return [...array.slice(0, index).concat(array.slice(index + 1))];
}

export const range = (start: number, length: number, modifier: number) => Array.from({ length: length }, (_, i) => (start + (i * modifier)));
