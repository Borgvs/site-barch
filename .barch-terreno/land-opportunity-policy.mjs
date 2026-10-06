/** Generated from bases-sistemicas/valor-terreno-oportunidade-v1/matriz-qualificacao.json. Do not maintain a second policy. */
export const LAND_OPPORTUNITY_POLICY={
  "schema": "barch.land-prequalification-matrix/v1",
  "version": "1.0.0",
  "state": "proposed_calibration_pending",
  "visibility": "internal",
  "name": "Índice de pré-qualificação da área",
  "scoreUnit": "points_0_to_100",
  "probability": false,
  "guarantee": false,
  "automaticApproval": false,
  "defaultRatePremium": null,
  "defaultMarketDiscount": null,
  "purpose": "Prioritize diligence and negotiation before detailed product modelling; no product viability percentage.",
  "assessmentScale": [
    {
      "code": "adverse",
      "points": 0
    },
    {
      "code": "conditional",
      "points": 50
    },
    {
      "code": "favorable",
      "points": 100
    }
  ],
  "applicability": "Only evidenced not-applicable items leave denominator; unknown is not not-applicable.",
  "factorEvidence": "Rating requires a reviewer, claim/evidence references, rationale and current input hash. Unknown has no rating.",
  "axes": [
    {
      "id": "identity_rights",
      "label": "Identidade e direitos",
      "weightPct": 20,
      "factors": [
        {
          "id": "object_match",
          "label": "Objeto, fração e benfeitorias conciliados",
          "sharePct": 30,
          "critical": true
        },
        {
          "id": "title_control",
          "label": "Domínio/direito transferível e ônus identificados",
          "sharePct": 40,
          "critical": true
        },
        {
          "id": "legal_access",
          "label": "Acesso e ocupação compatíveis",
          "sharePct": 30,
          "critical": true
        }
      ]
    },
    {
      "id": "regulatory_environment",
      "label": "Usos, normas e ambiente",
      "weightPct": 20,
      "factors": [
        {
          "id": "normative_currency",
          "label": "Vigência/cobertura/incidência normativa verificadas",
          "sharePct": 30,
          "critical": true
        },
        {
          "id": "admissible_uses",
          "label": "Uso atual e possibilidades comprováveis",
          "sharePct": 30,
          "critical": true
        },
        {
          "id": "environmental_constraints",
          "label": "Restrição e passivos com alcance definido",
          "sharePct": 40,
          "critical": true
        }
      ]
    },
    {
      "id": "physical_infrastructure",
      "label": "Condição física e infraestrutura",
      "weightPct": 15,
      "factors": [
        {
          "id": "geometry_reconciliation",
          "label": "Área, polígono e confrontações reconciliados",
          "sharePct": 25,
          "critical": true
        },
        {
          "id": "terrain_water_soil",
          "label": "Relevo, água, solo e necessidade de investigação",
          "sharePct": 35,
          "critical": false
        },
        {
          "id": "serviceability",
          "label": "Acesso físico e serviços ou custo de provisão",
          "sharePct": 25,
          "critical": false
        },
        {
          "id": "inspection_validation",
          "label": "Verificação de fatos observáveis in loco",
          "sharePct": 15,
          "critical": false
        }
      ]
    },
    {
      "id": "market_value_liquidity",
      "label": "Valor e liquidez de mercado",
      "weightPct": 25,
      "factors": [
        {
          "id": "comparables_quality",
          "label": "Comparáveis equivalentes, independentes e atuais",
          "sharePct": 35,
          "critical": true
        },
        {
          "id": "adjustments_defensible",
          "label": "Ajustes e faixa com método defendível",
          "sharePct": 25,
          "critical": true
        },
        {
          "id": "liquidity_exit",
          "label": "Mercado comprador e saída/renda plausíveis",
          "sharePct": 25,
          "critical": false
        },
        {
          "id": "valuation_crosschecks",
          "label": "Corroboração sem confundir referência fiscal/residual",
          "sharePct": 15,
          "critical": false
        }
      ]
    },
    {
      "id": "acquisition_opportunity",
      "label": "Aquisição e custo de oportunidade",
      "weightPct": 20,
      "factors": [
        {
          "id": "all_in_cost",
          "label": "Preço, condições e custos totais conhecidos",
          "sharePct": 25,
          "critical": true
        },
        {
          "id": "capital_benchmark",
          "label": "Custo de oportunidade/taxa compatível e documentados",
          "sharePct": 20,
          "critical": true
        },
        {
          "id": "cashflow_capacity",
          "label": "Prazo, caixa, funding e capacidade de suportar exposição",
          "sharePct": 20,
          "critical": true
        },
        {
          "id": "price_vs_reference",
          "label": "Condição pedida versus valor e tese de aquisição",
          "sharePct": 20,
          "critical": false
        },
        {
          "id": "adverse_resilience",
          "label": "Resistência a atrasos, custo e saída adversa",
          "sharePct": 15,
          "critical": false
        }
      ]
    }
  ],
  "gates": [
    {
      "id": "identity_not_reconciled",
      "trigger": "Object or material area/title contradiction unresolved.",
      "effect": "No conclusive acquisition recommendation; pricing can continue in clearly separated scenarios."
    },
    {
      "id": "right_or_access_failed",
      "trigger": "Transferable right or necessary legal access explicitly fails.",
      "effect": "Block affected acquisition thesis."
    },
    {
      "id": "prohibited_use",
      "trigger": "Proposed necessary use confirmed forbidden or incompatible.",
      "effect": "Block that use, not automatically all possible market value."
    },
    {
      "id": "environmental_material_unknown",
      "trigger": "Material environmental liability/physical risk cannot be bounded.",
      "effect": "Do not conclude acquisition viability; quantified conditional scenario only."
    },
    {
      "id": "market_insufficient",
      "trigger": "Comparables/value basis below authoritative policy.",
      "effect": "No adopted market value; no automated purchase recommendation."
    },
    {
      "id": "financial_mismatch_or_missing",
      "trigger": "Perspective/rate/taxes mismatch, or material flow inputs unknown.",
      "effect": "Conclusive NPV/IRR/acquisition cap remain null."
    },
    {
      "id": "funding_shortfall",
      "trigger": "Required capital exceeds documented capacity or unresolved liquidity constraint.",
      "effect": "No acquisition recommendation even with positive NPV."
    },
    {
      "id": "stale_or_unreviewed",
      "trigger": "Input hash changed, review absent or source expired.",
      "effect": "Invalidate current score/decision promotion until reverified."
    }
  ],
  "formulas": {
    "factorWeight": "w_j = axisWeightPct × factorSharePct / 100",
    "observedScore": "sum(w_j × points_j) / sum(w_j for current evidenced rated applicable factors); null if denominator=0",
    "coveragePct": "100 × sum(w_j for current evidenced rated applicable factors) / sum(w_j for all applicable factors)",
    "boundedLower": "sum(w_j × points_j for known factors) / sum(w_j for all applicable factors)",
    "boundedUpper": "boundedLower + 100 × sum(w_j for unknown applicable factors) / sum(w_j for all applicable factors)",
    "boundsMeaning": "Completude do índice se os itens desconhecidos recebessem 0 ou 100; não faixa de valor nem confiança estatística.",
    "completeScore": "observedScore only with complete applicable evidence coverage and current independent review; display gates alongside score."
  },
  "decision": "Blocked/pending/potentially_qualified/under_negotiation are recommendations, not productive enums. Human decision states may be mapped only through the existing canonical workflow.",
  "thresholds": {
    "automaticPurchase": null,
    "approvedProduct": null,
    "empiricalCalibrationRequired": true,
    "policyOwnerRequired": true
  },
  "prohibitedInterpretations": [
    "chance_de_sucesso",
    "probabilidade_de_aprovacao",
    "probabilidade_de_venda",
    "percentual_de_retorno",
    "desconto_automatico_no_valor",
    "acrescimo_automatico_a_tma",
    "substituicao_da_vistoria_ou_legislacao",
    "compensacao_de_gate_critico_por_media"
  ],
  "riskLadder": {
    "source": "direct_user_instruction_2026-09-30",
    "ordinalOnly": true,
    "classes": [
      "sovereign_benchmark",
      "ready_leased_property",
      "stabilized_property_with_vacancy",
      "retrofit",
      "built_to_suit",
      "development_preleased",
      "residential_development",
      "speculative_development",
      "unapproved_land",
      "speculative_land_banking"
    ],
    "actualCaseCanDiffer": true,
    "riskDrivers": [
      "tenant_counterparty",
      "title_access",
      "approval",
      "engineering",
      "liquidity",
      "funding",
      "duration",
      "market_exposure",
      "environmental_liability"
    ]
  },
  "display": {
    "summary": "Pré-qualificação X/100 • cobertura Y% • condições/gates",
    "criticalUnknown": "Diligência pendente",
    "criticalAdverse": "Tese bloqueada",
    "sourceMethod": "Explain contributions and evidence, unknown items and reviewer; no green score as legal/investment approval."
  },
  "runtime": "Generated integracoes/land-opportunity-policy.mjs mirrors this owner. Runtime suggestions are provisional; no complete adopted score without current independent review."
};
