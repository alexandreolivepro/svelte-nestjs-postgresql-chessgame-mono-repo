export type Form<T> = {
    [key in keyof T]: FormContent;
}

export type FormContent = {
    errors?: string[];
    value?: string | number;
}