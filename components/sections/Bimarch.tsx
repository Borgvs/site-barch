"use client";

import { motion } from "framer-motion";

/**
 * Bimarch · BIM em obra · linguagem institucional sem códigos de manual.
 * Destino antes de mecanismo: o que o cliente ganha · ferramentas como prova.
 */

const tools = [
  {
    name: "Autodesk Docs",
    role: "Ambiente único de informação",
    detail: "Toda decisão técnica versionada e acessível ao GP, ao engenheiro residente e ao cliente — pelo mesmo endereço, ao mesmo tempo.",
  },
  {
    name: "ConstructIN",
    role: "Modelo no canteiro",
    detail: "O detalhe técnico aprovado chega ao mestre de obras pelo celular. O canteiro deixa de ser ilha; vira ponto vivo do modelo.",
  },
  {
    name: "Solibri",
    role: "Validação automática",
    detail: "Centenas de verificações automáticas a cada entrega. Conflito que aparece no modelo custa horas. No canteiro, custa contratos.",
  },
  {
    name: "eCustos + Prevision",
    role: "Quantitativo e prazo",
    detail: "Quantitativos extraídos diretamente do modelo. Cronograma físico-financeiro acoplado ao avanço real da obra.",
  },
];

const principles = [
  {
    title: "BIM é forma de pensar.",
    body: "O cliente não escolhe Barch por causa do software que usamos. Escolhe porque o método elimina retrabalho antes da execução começar.",
  },
  {
    title: "Coordenação antes da concretagem.",
    body: "Cada disciplina conversa com a outra no modelo federado. Quando a estrutura sobe, a hidráulica e a elétrica já se conhecem.",
  },
  {
    title: "Transparência sem vitrine.",
    body: "O cliente acompanha o que está sob controle e o que ainda não está. Sem maquiagem de relatório, sem surpresa de canteiro.",
  },
];

export function Bimarch() {
  return (
    <section id="bim" className="relative py-section sm:py-sectionLg">
      <div className="container-page">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <div className="mb-6">
            <span className="eyebrow-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-charcoal">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              BIM EM OBRA · BIMARCH
            </span>
          </div>
          <h2 className="font-display text-display-xl sm:text-display-2xl text-ink leading-[0.98] tracking-tight mb-6">
            O modelo vive no canteiro — não fica no escritório.
          </h2>
          <p className="text-body-lg text-charcoal leading-relaxed max-w-2xl">
            Bimarch é o braço técnico da Barch. O que para a maior parte do
            mercado é entregável de projeto, para nós é{" "}
            <span className="text-ink font-medium">
              instrumento vivo de coordenação
            </span>
            : do primeiro estudo de massas até o último relatório de pós-ocupação.
          </p>
        </div>

        {/* Ferramentas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-20">
          {tools.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="card-base card-hover p-6 group"
            >
              <div className="w-9 h-9 rounded-cardSm bg-ink flex items-center justify-center text-paperPure font-display text-[13px] font-semibold mb-5">
                {t.name.split(" ")[0].slice(0, 2).toUpperCase()}
              </div>
              <h3 className="font-display text-display-sm text-ink leading-tight mb-1">
                {t.name}
              </h3>
              <p className="text-caption text-muted uppercase tracking-wider mb-3">
                {t.role}
              </p>
              <p className="text-body-sm text-charcoal leading-relaxed">
                {t.detail}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Princípios */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
          <div>
            <p className="eyebrow text-muted mb-3">Como BIM aterrissa em obra</p>
            <h3 className="font-display text-display-lg text-ink leading-[1.05] tracking-tight">
              Três decisões que parecem técnicas.
              <br />
              <span className="text-muted">São culturais.</span>
            </h3>
          </div>
          <div className="space-y-8">
            {principles.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="border-l border-rule pl-6"
              >
                <h4 className="font-display text-display-sm text-ink leading-tight mb-2">
                  {p.title}
                </h4>
                <p className="text-body text-charcoal leading-relaxed">
                  {p.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
