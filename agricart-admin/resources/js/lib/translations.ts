// Legacy translation helper - redirects to new i18n system
import { __ as translate } from './i18n';

export function __(key: string, locale?: string): string {
    return translate(key, locale);
}