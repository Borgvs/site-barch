/**
 * Catálogo de projetos · placeholders curados.
 * Single source of truth para /projetos (lista) e /projetos/[slug] (detalhe).
 */

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectFact {
  label: string;
  value: string;
}

export interface ProjectChapter {
  title: string;
  body: string;
}

export interface Project {
  slug: string;
  name: string;
  year: string;
  status: "em-andamento" | "concluido" | "estudo-conceitual" | "projeto";
  typology: string;
  location: string;
  scopeShort: string;
  scopeLong: string;
  facts: ProjectFact[];
  metrics: ProjectMetric[];
  chapters: ProjectChapter[];
  isFeatured?: boolean;
  isConfidential?: boolean;
}

export const projects: Project[] = [
  {
    slug: "silva",
    name: "Residência Família Silva",
    year: "2026",
    status: "em-andamento",
    typology: "Residencial · Alto Padrão",
    location: "Brasil",
    scopeShort:
      "Casa unifamiliar com piscina, climatização VRF e financiamento CAIXA. Painel cliente ao vivo + vistorias 360°.",
    scopeLong:
      "Projeto completo de residência unifamiliar de alto padrão com financiamento CAIXA estruturado em parcelas trimestrais e medições. Inclui projeto BIM coordenado, especificação de climatização VRF híbrida, elevador interno Pollo, piscina com hidráulica integrada e quadro elétrico dimensionado. Operação acompanhada em tempo real pelo painel.barch.com.br com vistorias 360° via Insta360 X5.",
    facts: [
      { label: "Contrato", value: "RL13A-CT-2512-Obra-R00" },
      { label: "Valor", value: "R$ 5,85M" },
      { label: "Prazo", value: "18 meses" },
      { label: "Mês atual", value: "5/18" },
      { label: "Financiamento", value: "CAIXA · 6 medições" },
    ],
    metrics: [
      { label: "Físico real", value: "25%" },
      { label: "Físico planejado", value: "25%" },
      { label: "Financeiro pago", value: "31%" },
      { label: "Decisões fechadas", value: "3" },
    ],
    chapters: [
      {
        title: "Diagnóstico SAPP",
        body:
          "Aplicação do Sistema de Avaliação Psicoarquitetônica Profunda com Lucimar e Camila Silva. Mapeamento de preferências de prospect-refuge, escala doméstica desejada, relação com áreas externas. Resultado orienta partido e materialidade.",
      },
      {
        title: "Coordenação BIM",
        body:
          "Modelo Revit federado com arquitetura, estrutura, hidráulica, elétrica e VRF. 70+ regras Solibri validadas. ConstructIN sincroniza modelo-campo. Solibri Ruleset Barch revisado em cada marco contratual.",
      },
      {
        title: "Decisões fechadas",
        body:
          "Elevador Pollo (vs Aelevadores), climatização VRF híbrida + split nas suítes, quadro elétrico com troca de poste pela concessionária. Todas decisões justificadas via VBA + comparação observable.",
      },
      {
        title: "Acompanhamento ao vivo",
        body:
          "Família Silva acessa painel.barch.com.br/obra/silva com curva S em tempo real, atualizações por reunião, decisões pendentes, medições CAIXA e vistorias 360° navegáveis. Transparência proativa MAN-010.",
      },
    ],
    isFeatured: true,
  },
  {
    slug: "airport-conceitual",
    name: "Aeroporto · Estudo Conceitual",
    year: "2024",
    status: "estudo-conceitual",
    typology: "Infraestrutura · Aeroportuária",
    location: "Brasil",
    scopeShort:
      "Estudo de viabilidade conceitual de terminal de passageiros regional. Massas, fluxos, modulação estrutural.",
    scopeLong:
      "Estudo conceitual de terminal de passageiros para aeroporto regional. Análise de fluxos embarque/desembarque, dimensionamento de áreas técnicas, modulação estrutural de coberturas amplas, integração com taxiway e road-side. Volumes preliminares para discussão com concessionária.",
    facts: [
      { label: "Área programada", value: "8.500 m²" },
      { label: "Capacidade", value: "1,2 MM PAX/ano" },
      { label: "Stack", value: "Forma + Revit + Veras" },
      { label: "Fase", value: "F0 · Triagem" },
    ],
    metrics: [
      { label: "Estudo entregue", value: "100%" },
      { label: "Sob NDA", value: "Sim" },
    ],
    chapters: [
      {
        title: "Análise de implantação",
        body:
          "Autodesk Forma processou orientação solar, ventos predominantes e ruído de pista. 3 cenários comparados quanto a conforto térmico, custo de envelope e legibilidade do percurso PAX. Cenário escolhido reduz envelope em 12% sem perda de capacidade.",
      },
      {
        title: "Modulação estrutural",
        body:
          "Cobertura sobre saguões em vão livre 36m com módulos repetitivos pré-fabricados. Otimização Finch 3D para minimizar peças não-padronizadas. Stack BIM permite custo paramétrico desde a viabilidade.",
      },
    ],
    isConfidential: true,
  },
  {
    slug: "music-university",
    name: "Universidade de Música",
    year: "2022",
    status: "projeto",
    typology: "Institucional · Cultural",
    location: "Brasil",
    scopeShort:
      "Edifício cultural com estúdios isolados acusticamente, sala de concertos e residência docente.",
    scopeLong:
      "Projeto para universidade de música com salas individuais de estudo, estúdios de gravação, sala de concertos de 280 lugares e residência docente. Foco em isolamento acústico, condicionamento HVAC silencioso e percurso interno como instrumento pedagógico.",
    facts: [
      { label: "Área construída", value: "4.200 m²" },
      { label: "Salas de estudo", value: "32" },
      { label: "Sala de concertos", value: "280 lugares" },
      { label: "Critério acústico", value: "NC-15 (estúdios)" },
    ],
    metrics: [
      { label: "Projeto concluído", value: "100%" },
      { label: "Reverberação T60 sala", value: "1,8s" },
    ],
    chapters: [
      {
        title: "Arquitetura acústica",
        body:
          "Cada estúdio resolvido como box-in-box com isolamento estrutural por borrachas anti-vibração. Pisos flutuantes, dupla parede com câmara, portas certificadas STC-50. HVAC com plenums silenciadores.",
      },
      {
        title: "Sala de concertos",
        body:
          "Geometria shoebox modulada com painéis reflexivos móveis em pinus e MDF perfurado. Tempo de reverberação ajustável entre 1,6s (recital) e 2,2s (sinfônico) por configuração.",
      },
    ],
  },
  {
    slug: "corporate-industrial",
    name: "Sede Corporativa Industrial",
    year: "2021",
    status: "projeto",
    typology: "Corporativo · Industrial",
    location: "Brasil",
    scopeShort:
      "Galpão administrativo integrado a plataforma fabril. Identidade de marca traduzida ao espaço.",
    scopeLong:
      "Sede de empresa industrial combinando galpão fabril, plataforma logística e bloco administrativo. Foco em transição entre escala industrial e humana, controle de ruído fabril nas áreas administrativas e identidade visual da marca traduzida em escolhas espaciais.",
    facts: [
      { label: "Área administrativa", value: "1.800 m²" },
      { label: "Galpão produtivo", value: "5.400 m²" },
      { label: "Pé-direito fabril", value: "12m" },
    ],
    metrics: [
      { label: "Projeto concluído", value: "100%" },
      { label: "Funcionários atendidos", value: "240" },
    ],
    chapters: [
      {
        title: "Transição de escala",
        body:
          "Bloco administrativo tratado como volume autônomo encostado ao galpão, com pátio interno como câmara de descompressão. Mudança de pé-direito mediada por mezanino que serve de mirante sobre a fábrica.",
      },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

export const STATUS_LABELS: Record<Project["status"], string> = {
  "em-andamento": "Em andamento",
  concluido: "Concluído",
  "estudo-conceitual": "Estudo conceitual",
  projeto: "Projeto",
};
