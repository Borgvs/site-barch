/**
 * O LINK DA OBRA — dono único (módulo NEUTRO: sem "use server", sem JSX). Curadoria 16/09 · L4-04.
 *
 * O endereço da obra (`projects.slug`, `/obra/<link>`) tinha cinco donos: a prévia do wizard, a
 * normalização do campo "Editar", as três actions de criação e o nascimento pelo funil — com cortes
 * diferentes (60 · 60 · 80 · sem corte) e a normalização FINAL aplicada durante a digitação: o hífen
 * digitado sumia na hora ("proj-casa" virava "projcasa"), e a obra gravava isso.
 *
 * Duas funções, dois momentos:
 *  · `slugDigitando` — a cada tecla: caixa, acento e separador viram "-", sem aparar o hífen final
 *    (é a tecla que a pessoa acabou de dar);
 *  · `slugFinal`     — no blur e na action: apara as pontas e corta num comprimento só.
 * E `composeSlugDaObra` compõe o link padrão (MAN-006 §54: `proj-[nome]-[código]-geral`) já dentro do
 * corte — a prévia é o que se grava. A RPC do banco só troca o que não for `[a-z0-9-]`; a saída daqui
 * já é isso, então ela não muda nada.
 *
 * Na tela o fato se chama "Link da obra" (D11): "slug" é nome de código, nunca rótulo.
 */
/** O nome do fato na tela (D11). */
export declare const ROTULO_DO_LINK_DA_OBRA = "Link da obra";
/** O comprimento máximo do link — um só para prévia, campo e actions. */
export declare const SLUG_MAX = 60;
/**
 * O link enquanto se digita: normaliza e corta em `SLUG_MAX`, mas NÃO apara o hífen final — digitar
 * "proj-casa" tecla a tecla chega a "proj-casa". Idempotente: aplicar de novo não muda nada.
 */
export declare function slugDigitando(v: string): string;
/** O link que se grava: normaliza, corta em `max` e apara o hífen das pontas ("obra-" → "obra"). */
export declare function slugFinal(v: string, max?: number): string;
/**
 * O link padrão da obra: `proj-[nome]-[código]-geral` (a composição do wizard, sem o nome quando ele
 * não tem letra nem número, sem o código enquanto ele não foi cunhado). O NOME é que se encurta para
 * caber em `SLUG_MAX` — o prefixo, o código e o escopo nunca se perdem, e
 * `slugFinal(composeSlugDaObra(n, c)) === composeSlugDaObra(n, c)` (a prévia é o gravado).
 */
export declare function composeSlugDaObra(nome: string, codigo: string | null): string;
