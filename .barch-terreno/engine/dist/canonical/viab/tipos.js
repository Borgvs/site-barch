"use strict";
/**
 * Módulo de Viabilidade · contrato do motor determinístico.
 * ARQ-VIAB-GATES-001 §23.1
 *
 * O motor é PURO: recebe inputs versionados, devolve outputs e diagnósticos. Não lê
 * banco, não chama rede, não olha o relógio. Isso não é purismo — é o que torna o
 * estudo reproduzível: mesmo input + mesma data-base + mesma seed = mesmo número, ao
 * centavo, hoje e daqui a dois anos, quando alguém precisar defender a decisão.
 *
 * Convenções que valem para o arquivo inteiro:
 * • Dinheiro em BRL, número JS (double). Arredondamento só na fronteira de saída.
 * • Tempo em índice de mês inteiro a partir de 0 = mês da data-base.
 * • Percentual em PONTOS (10 = 10%), nunca fração — o schema guarda assim e converter
 *   no meio do caminho é como nasce erro de 100×.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENGINE_VERSION = void 0;
exports.ENGINE_VERSION = "viab-1.2.1";
