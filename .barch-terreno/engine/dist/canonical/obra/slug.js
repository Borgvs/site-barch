"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLUG_MAX = exports.ROTULO_DO_LINK_DA_OBRA = void 0;
exports.slugDigitando = slugDigitando;
exports.slugFinal = slugFinal;
exports.composeSlugDaObra = composeSlugDaObra;
/** O nome do fato na tela (D11). */
exports.ROTULO_DO_LINK_DA_OBRA = "Link da obra";
/** O comprimento máximo do link — um só para prévia, campo e actions. */
exports.SLUG_MAX = 60;
/** Sem acento, minúsculas; tudo que não é `[a-z0-9]` vira UM hífen; nunca começa com hífen. */
function normalizar(v) {
    return (typeof v === "string" ? v : "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+/, "");
}
/**
 * O link enquanto se digita: normaliza e corta em `SLUG_MAX`, mas NÃO apara o hífen final — digitar
 * "proj-casa" tecla a tecla chega a "proj-casa". Idempotente: aplicar de novo não muda nada.
 */
function slugDigitando(v) {
    return normalizar(v).slice(0, exports.SLUG_MAX);
}
/** O link que se grava: normaliza, corta em `max` e apara o hífen das pontas ("obra-" → "obra"). */
function slugFinal(v, max = exports.SLUG_MAX) {
    return normalizar(v).slice(0, Math.max(0, max)).replace(/-+$/, "");
}
/**
 * O link padrão da obra: `proj-[nome]-[código]-geral` (a composição do wizard, sem o nome quando ele
 * não tem letra nem número, sem o código enquanto ele não foi cunhado). O NOME é que se encurta para
 * caber em `SLUG_MAX` — o prefixo, o código e o escopo nunca se perdem, e
 * `slugFinal(composeSlugDaObra(n, c)) === composeSlugDaObra(n, c)` (a prévia é o gravado).
 */
function composeSlugDaObra(nome, codigo) {
    const cod = slugFinal(codigo ?? "");
    const fixo = ["proj", cod, "geral"].filter(Boolean).join("-");
    const orcamentoDoNome = exports.SLUG_MAX - fixo.length - 1;
    const corpo = orcamentoDoNome > 0 ? slugFinal(nome, orcamentoDoNome) : "";
    return slugFinal(["proj", corpo, cod, "geral"].filter(Boolean).join("-"));
}
