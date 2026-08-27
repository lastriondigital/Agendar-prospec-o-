import {
  Company,
  Contact,
  HistoryEvent,
  IdealCustomerProfile,
  Lead,
  LeadScoreClassification,
  LeadScoreResult,
  ScoringBreakdownItem,
  ScoringWeightConfig,
  Service,
} from '../types';

export const DEFAULT_SCORING_WEIGHTS: ScoringWeightConfig = {
  hasWebsite: 10,
  outdatedWebsite: 15,
  noWebsite: -5,
  hasGoogleBusiness: 10,
  hasInstagram: 10,
  hasDirectWhatsapp: 15,
  hasPhone: 5,
  noContactPhonePenalty: -10,
  hasDecisionMakerRole: 10,
  singleUnit: 5,
  multipleUnits: 12,
  largeChainUnits: 18,
  matchesIcpNiche: 15,
  matchesStrategicLocation: 8,
  apparentNeedIdentified: 10,
  hotTemperatureBonus: 12,
  recentActivityBonus: 5,
};

/**
 * Retorna a classificação textual do Lead Score
 * 0–39 = baixa
 * 40–69 = média
 * 70–84 = alta
 * 85–100 = prioridade máxima
 */
export function getScoreClassification(score: number): LeadScoreClassification {
  if (score >= 85) return 'prioridade_maxima';
  if (score >= 70) return 'alta';
  if (score >= 40) return 'média';
  return 'baixa';
}

export function getScoreClassificationLabel(classification: LeadScoreClassification): string {
  switch (classification) {
    case 'prioridade_maxima':
      return 'Prioridade Máxima';
    case 'alta':
      return 'Qualificação Alta';
    case 'média':
      return 'Qualificação Média';
    case 'baixa':
      return 'Qualificação Baixa';
    default:
      return 'Não Qualificado';
  }
}

export function getScoreColorTokens(score: number) {
  if (score >= 85) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      badgeBg: 'bg-emerald-600 dark:bg-emerald-500',
      badgeText: 'text-white',
      dotColor: 'bg-emerald-600 dark:bg-emerald-400',
      ringColor: 'ring-emerald-500/20',
      label: 'Prioridade Máxima',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-[#3F6FB5] dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800/40',
      badgeBg: 'bg-[#3F6FB5] dark:bg-blue-500',
      badgeText: 'text-white',
      dotColor: 'bg-[#3F6FB5] dark:bg-blue-400',
      ringColor: 'ring-blue-500/20',
      label: 'Alta',
    };
  }
  if (score >= 40) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/40',
      badgeBg: 'bg-amber-600 dark:bg-amber-500',
      badgeText: 'text-white',
      dotColor: 'bg-amber-600 dark:bg-amber-400',
      ringColor: 'ring-amber-500/20',
      label: 'Média',
    };
  }
  return {
    bg: 'bg-[#F7F8FA] dark:bg-[#20242A]',
    text: 'text-[#5F6368] dark:text-[#9AA0A6]',
    border: 'border-[#E6E8EB] dark:border-[#2D3139]',
    badgeBg: 'bg-neutral-600 dark:bg-neutral-700',
    badgeText: 'text-white',
    dotColor: 'bg-neutral-400 dark:bg-neutral-500',
    ringColor: 'ring-neutral-500/20',
    label: 'Baixa',
  };
}

/**
 * Calcula o Score Explicável do Lead de 0 a 100
 * Baseado estritamente em dados reais cadastrados
 */
export function calculateLeadScore(
  company?: Company,
  contact?: Contact,
  lead?: Lead,
  icps: IdealCustomerProfile[] = [],
  services: Service[] = [],
  history: HistoryEvent[] = [],
  weights: ScoringWeightConfig = DEFAULT_SCORING_WEIGHTS
): LeadScoreResult {
  const breakdown: ScoringBreakdownItem[] = [];
  let rawScore = 0;

  if (!company) {
    return {
      score: 0,
      classification: 'baixa',
      breakdown: [
        {
          ruleId: 'no_company',
          label: 'Sem empresa associada',
          points: 0,
          matched: true,
          reason: 'Nenhuma informação cadastrada para cálculo.',
        },
      ],
    };
  }

  // 1. Canal de Contato WhatsApp / Telefone
  const hasWhatsapp = Boolean(contact?.whatsapp || (!contact && company.notes?.includes('whatsapp')));
  const hasPhone = Boolean(contact?.phone);
  
  if (hasWhatsapp) {
    rawScore += weights.hasDirectWhatsapp;
    breakdown.push({
      ruleId: 'has_whatsapp',
      label: 'WhatsApp Direto',
      points: weights.hasDirectWhatsapp,
      matched: true,
      reason: 'WhatsApp de contato disponível para abordagem instantânea.',
    });
  } else if (hasPhone) {
    rawScore += weights.hasPhone;
    breakdown.push({
      ruleId: 'has_phone',
      label: 'Telefone Cadastrado',
      points: weights.hasPhone,
      matched: true,
      reason: 'Telefone disponível para ligação ou validação.',
    });
  } else {
    rawScore += weights.noContactPhonePenalty;
    breakdown.push({
      ruleId: 'no_phone',
      label: 'Sem Telefone / WhatsApp',
      points: weights.noContactPhonePenalty,
      matched: true,
      reason: 'Sem canal de contato direto por telefone ou WhatsApp.',
    });
  }

  // 2. Presença Digital: Website
  const notesAndDesc = `${company.notes || ''} ${lead?.notes || ''}`.toLowerCase();
  const isWebsiteOutdated = notesAndDesc.includes('desatualizado') || notesAndDesc.includes('lento') || notesAndDesc.includes('sem mobile') || notesAndDesc.includes('ruim');

  if (company.website && company.website.trim().length > 3) {
    if (isWebsiteOutdated) {
      rawScore += weights.outdatedWebsite;
      breakdown.push({
        ruleId: 'outdated_website',
        label: 'Website Oportunidade',
        points: weights.outdatedWebsite,
        matched: true,
        reason: 'Website existente com oportunidade de reformulação ou novo design.',
      });
    } else {
      rawScore += weights.hasWebsite;
      breakdown.push({
        ruleId: 'has_website',
        label: 'Website Ativo',
        points: weights.hasWebsite,
        matched: true,
        reason: 'Possui website próprio publicado.',
      });
    }
  } else {
    // Sem website
    const isWebTargetService = lead?.serviceName?.toLowerCase().includes('site') || lead?.serviceName?.toLowerCase().includes('landing');
    if (isWebTargetService) {
      rawScore += weights.outdatedWebsite;
      breakdown.push({
        ruleId: 'needs_website_opportunity',
        label: 'Sem Website (Alta Oportunidade)',
        points: weights.outdatedWebsite,
        matched: true,
        reason: 'Empresa ainda não possui website — oportunidade direta de venda.',
      });
    } else if (weights.noWebsite !== 0) {
      rawScore += weights.noWebsite;
      breakdown.push({
        ruleId: 'no_website',
        label: 'Sem Website',
        points: weights.noWebsite,
        matched: true,
        reason: 'Não possui endereço de website cadastrado.',
      });
    }
  }

  // 3. Instagram Ativo
  if (company.instagram && company.instagram.trim().length > 1) {
    rawScore += weights.hasInstagram;
    breakdown.push({
      ruleId: 'has_instagram',
      label: 'Instagram Ativo',
      points: weights.hasInstagram,
      matched: true,
      reason: 'Perfil de Instagram cadastrado para prospecção multicanal.',
    });
  }

  // 4. Google Business Profile
  if (company.googleBusiness && company.googleBusiness.trim().length > 3) {
    rawScore += weights.hasGoogleBusiness;
    breakdown.push({
      ruleId: 'has_google_business',
      label: 'Google Meu Negócio',
      points: weights.hasGoogleBusiness,
      matched: true,
      reason: 'Presença no Google Maps / Busca local identificada.',
    });
  }

  // 5. Número de Unidades
  const units = company.unitsCount ?? 1;
  if (units > 5) {
    rawScore += weights.largeChainUnits;
    breakdown.push({
      ruleId: 'units_large',
      label: 'Rede com 6+ unidades',
      points: weights.largeChainUnits,
      matched: true,
      reason: `Empresa opera rede com ${units} unidades físicas.`,
    });
  } else if (units >= 2) {
    rawScore += weights.multipleUnits;
    breakdown.push({
      ruleId: 'units_multiple',
      label: 'Multi-unidades (2 a 5)',
      points: weights.multipleUnits,
      matched: true,
      reason: `Empresa possui ${units} unidades cadastradas.`,
    });
  } else if (units === 1) {
    rawScore += weights.singleUnit;
    breakdown.push({
      ruleId: 'units_single',
      label: '1 Unidade Física Ativa',
      points: weights.singleUnit,
      matched: true,
      reason: 'Estrutura comercial com unidade física identificada.',
    });
  }

  // 6. Decisor Identificado
  if (contact?.role) {
    const roleLower = contact.role.toLowerCase();
    const isDecisionMaker =
      roleLower.includes('sócio') ||
      roleLower.includes('socio') ||
      roleLower.includes('diretor') ||
      roleLower.includes('ceo') ||
      roleLower.includes('proprietário') ||
      roleLower.includes('proprietario') ||
      roleLower.includes('gerente') ||
      roleLower.includes('head') ||
      roleLower.includes('dono');

    if (isDecisionMaker) {
      rawScore += weights.hasDecisionMakerRole;
      breakdown.push({
        ruleId: 'decision_maker',
        label: 'Decisor Mapeado',
        points: weights.hasDecisionMakerRole,
        matched: true,
        reason: `Contato tem cargo decisor: "${contact.role}".`,
      });
    }
  }

  // 7. Adequação ao ICP (Ideal Customer Profile)
  const activeIcps = icps.filter((i) => i.active !== false);
  const matchingIcp = activeIcps.find((icp) => {
    const matchesNiche = icp.niches.some(
      (n) =>
        company.niche.toLowerCase().includes(n.toLowerCase()) ||
        n.toLowerCase().includes(company.niche.toLowerCase()) ||
        company.category.toLowerCase().includes(n.toLowerCase())
    );
    return matchesNiche;
  });

  if (matchingIcp) {
    rawScore += weights.matchesIcpNiche;
    breakdown.push({
      ruleId: 'matches_icp',
      label: `Enquadramento no ICP: ${matchingIcp.name}`,
      points: weights.matchesIcpNiche,
      matched: true,
      reason: `Nicho "${company.niche}" corresponde exatamente ao ICP prioritário.`,
    });
  }

  // 8. Localização Estratégica
  if (company.city && company.city.trim().length > 0) {
    const isCityInIcp = activeIcps.some((icp) =>
      icp.cities.some((c) => company.city.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(company.city.toLowerCase()))
    );

    if (isCityInIcp) {
      rawScore += weights.matchesStrategicLocation;
      breakdown.push({
        ruleId: 'strategic_location',
        label: 'Localização Estratégica (ICP)',
        points: weights.matchesStrategicLocation,
        matched: true,
        reason: `Cidade "${company.city}" é praça prioritária no perfil ideal.`,
      });
    }
  }

  // 9. Necessidade Aparente Identificada
  if (
    notesAndDesc.includes('gargalo') ||
    notesAndDesc.includes('necessidade') ||
    notesAndDesc.includes('reclamação') ||
    notesAndDesc.includes('procurando') ||
    notesAndDesc.includes('interessado') ||
    notesAndDesc.includes('urgente')
  ) {
    rawScore += weights.apparentNeedIdentified;
    breakdown.push({
      ruleId: 'apparent_need',
      label: 'Necessidade Aparente Registrada',
      points: weights.apparentNeedIdentified,
      matched: true,
      reason: 'Notas comerciais apontam dor ou urgência clara.',
    });
  }

  // 10. Temperatura / Prioridade Manual
  if (lead?.temperature === 'quente' || lead?.temperature === 'hot') {
    rawScore += weights.hotTemperatureBonus;
    breakdown.push({
      ruleId: 'hot_temperature',
      label: 'Lead Quente',
      points: weights.hotTemperatureBonus,
      matched: true,
      reason: 'Lead classificado com alto engajamento / interesse recente.',
    });
  }

  // 11. Atividade Recente
  const recentCompanyHistory = history.filter(
    (h) => h.companyId === company.id || (lead && h.leadId === lead.id)
  );
  if (recentCompanyHistory.length > 0) {
    const latest = recentCompanyHistory.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    const daysAgo = (Date.now() - new Date(latest.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 7) {
      rawScore += weights.recentActivityBonus;
      breakdown.push({
        ruleId: 'recent_activity',
        label: 'Atividade Recente (< 7 dias)',
        points: weights.recentActivityBonus,
        matched: true,
        reason: 'Interação registrada nos últimos 7 dias na timeline.',
      });
    }
  }

  // Clamp entre 0 e 100
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const classification = getScoreClassification(finalScore);

  return {
    score: finalScore,
    classification,
    breakdown,
  };
}
