/**
 * SHA-256 síncrono e isomórfico para pequenos contratos JSON canônicos.
 * Evita depender de `node:crypto` em módulos também consumidos no browser.
 * Não substitui assinatura/consulta ao registro server-side.
 */
export declare function sha256Utf8(value: string): string;
export declare function canonicalSha256(value: unknown): string;
