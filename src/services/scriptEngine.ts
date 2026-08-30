import { Client, Company, Contact, HistoryEvent, Lead, Service } from '../types';
import {
  CountryCode,
  CommunicationStyle,
  ContactRoleType,
  FollowUpItem,
  ProspectingFlowType,
  ScriptRecommendationResult,
  ScriptStepDefinition,
  ObjectionComprehensive,
} from '../types/scripts';
import { PROBLEMA_IDENTIFICADO_STEPS } from '../db/whatsappProblemFlowSeed';
import { OPORTUNIDADE_LATENTE_STEPS } from '../db/whatsappLatentFlowSeed';
import { COMPREHENSIVE_OBJECTIONS } from '../db/whatsappObjectionsSeed';
import { CONTEXTUAL_FOLLOWUP_SCENARIOS } from '../db/whatsappContextFollowUpsSeed';
import { cleanPhoneNumberDigits, generateWhatsAppLink } from '../utils/formatting';

export interface ScriptRecommendationParams {
  client?: Partial<Client> | null;
  company?: Partial<Company> | null;
  contact?: Partial<Contact> | null;
  lead?: Partial<Lead> | null;
  service?: Partial<Service> | null;
  history?: HistoryEvent[];
  preferredFlow?: ProspectingFlowType;
  preferredCountry?: CountryCode;
  preferredTone?: CommunicationStyle;
  currentStepNumber?: number;
  detectedObjectionId?: string;
}

/**
 * Detect country code from company or client info
 */
export function detectCountry(
  company?: Partial<Company> | null,
  client?: Partial<Client> | null,
  fallback: CountryCode = 'BR'
): CountryCode {
  const countryStr = (company?.country || client?.segment || '').toLowerCase();
  const phone = company?.companyPhone || (company as any)?.phone || client?.phone || '';

  if (countryStr.includes('portugal') || countryStr.includes('pt') || phone.startsWith('+351') || phone.startsWith('351')) {
    return 'PT';
  }
  if (countryStr.includes('moçambique') || countryStr.includes('mozambique') || countryStr.includes('mz') || phone.startsWith('+258') || phone.startsWith('258')) {
    return 'MZ';
  }
  if (countryStr.includes('brasil') || countryStr.includes('brazil') || countryStr.includes('br') || phone.startsWith('+55') || phone.startsWith('55')) {
    return 'BR';
  }
  return fallback;
}

/**
 * Gets currency symbol according to country
 */
export function getCurrencyForCountry(country: CountryCode): string {
  switch (country) {
    case 'PT':
      return '€';
    case 'MZ':
      return 'MT';
    case 'BR':
    default:
      return 'R$';
  }
}

/**
 * Calculates pricing and market anchor values
 */
export function calculatePricingAndAnchor(
  service?: Partial<Service> | null,
  country: CountryCode = 'BR'
): { regularPrice: number; anchorPrice: number; currency: string; justification: string } {
  const currency = service?.currency || getCurrencyForCountry(country);
  let basePrice = service?.basePrice || 597;
  let anchorPrice = Math.round(basePrice * 3.5);

  if (country === 'PT') {
    basePrice = service?.basePrice ? service.basePrice : 180;
    anchorPrice = Math.round(basePrice * 3);
  } else if (country === 'MZ') {
    basePrice = service?.basePrice ? service.basePrice : 12000;
    anchorPrice = Math.round(basePrice * 2.8);
  }

  return {
    regularPrice: basePrice,
    anchorPrice,
    currency,
    justification: `Projetos deste porte no mercado costumam variar de ${currency} ${anchorPrice.toLocaleString('pt-BR')} a ${currency} ${(anchorPrice * 1.3).toLocaleString('pt-BR')}.`,
  };
}

/**
 * Comprehensive variable interpolator supporting all 22+ Leadion variables
 */
export function interpolateSmartVariables(
  template: string,
  params: {
    client?: Partial<Client> | null;
    company?: Partial<Company> | null;
    contact?: Partial<Contact> | null;
    lead?: Partial<Lead> | null;
    service?: Partial<Service> | null;
    country?: CountryCode;
    daysWithoutResponse?: number;
    lastInteractionNote?: string;
  }
): { text: string; variablesMap: Record<string, string> } {
  if (!template) return { text: '', variablesMap: {} };

  const { client, company, contact, lead, service, daysWithoutResponse = 0, lastInteractionNote = '' } = params;
  const country = params.country || detectCountry(company, client);
  const currency = getCurrencyForCountry(country);
  const pricing = calculatePricingAndAnchor(service, country);

  // Derive rich fields
  const fullName = contact?.name || client?.name || company?.name || 'Cliente';
  const firstName = fullName.trim().split(' ')[0] || 'Cliente';
  const companyName = company?.name || client?.company || 'sua empresa';
  const role = contact?.role || client?.role || 'gestor';
  const city = company?.city || client?.segment || (country === 'PT' ? 'sua região' : 'sua cidade');
  const countryName = country === 'PT' ? 'Portugal' : country === 'MZ' ? 'Moçambique' : 'Brasil';
  const niche = company?.niche || client?.segment || 'seu segmento';
  const serviceName = service?.name || 'otimização digital e presença online';
  
  // Specific observations & problem
  const specificObservation = company?.apparentNeed || 'que o site atual não possui botão direto de agendamento no WhatsApp para celular';
  const problem = company?.apparentNeed || service?.problemsSolved?.[0] || 'perda de clientes que tentam agendar pelo celular';
  const solution = (service as any)?.deliverables?.[0] || 'uma página ultra rápida com agendamento instantâneo via WhatsApp';
  const benefit = service?.benefits?.[0] || 'mais agendamentos e clientes qualificados todo mês';
  const realisticBenefit = service?.benefits?.[0] || 'aumento real nas mensagens diretas de novos clientes';
  const deliverables = (service as any)?.deliverables?.join(', ') || 'design responsivo, carregamento instantâneo, botão direto WhatsApp e painel simplificado';
  const deliveryDays = '3 a 5';
  const bonus = 'configuração completa do botão de agendamento e 30 dias de suporte';

  // Digital signals
  const website = company?.website || client?.company || 'site';
  const instagram = company?.instagram || (company?.name ? `@${company.name.toLowerCase().replace(/\s+/g, '')}` : '@empresa');
  const gmb = (company as any)?.googleMapsStatus || company?.googleBusiness || 'perfil no Google Maps';

  // Numbers & status
  const formattedPrice = `${currency} ${pricing.regularPrice.toLocaleString('pt-BR')}`;
  const formattedAnchor = `${currency} ${pricing.anchorPrice.toLocaleString('pt-BR')}`;
  const formattedAdjustedPrice = `${currency} ${Math.round(pricing.regularPrice * 0.7).toLocaleString('pt-BR')}`;
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const leadScore = lead?.score ? `${lead.score} pts` : 'Alto';
  const funnelStage = lead?.stage || 'Prospecção Inicial';

  const variablesMap: Record<string, string> = {
    '{{nome}}': fullName,
    '{{primeiro_nome}}': firstName,
    '{{empresa}}': companyName,
    '{{cargo}}': role,
    '{{cidade}}': city,
    '{{pais}}': countryName,
    '{{nicho}}': niche,
    '{{servico}}': serviceName,
    '{{problema}}': problem,
    '{{observacao_especifica}}': specificObservation,
    '{{solucao}}': solution,
    '{{beneficio}}': benefit,
    '{{beneficio_realista}}': realisticBenefit,
    '{{beneficio_principal}}': benefit,
    '{{beneficio_incluso}}': bonus,
    '{{escopo_entregas}}': deliverables,
    '{{prazo_entrega}}': deliveryDays,
    '{{prazo_dias}}': deliveryDays,
    '{{bonus_incluso}}': bonus,
    '{{website}}': website,
    '{{instagram}}': instagram,
    '{{gmb}}': gmb,
    '{{preco}}': formattedPrice,
    '{{preco_ancora}}': formattedAnchor,
    '{{preco_ajustado}}': formattedAdjustedPrice,
    '{{preco_minimo}}': `${currency} ${Math.round(pricing.regularPrice * 0.8).toLocaleString('pt-BR')}`,
    '{{preco_maximo}}': `${currency} ${Math.round(pricing.regularPrice * 2).toLocaleString('pt-BR')}`,
    '{{moeda}}': currency,
    '{{data}}': currentDate,
    '{{hora}}': currentTime,
    '{{nome_responsavel}}': contact?.name || 'Diretoria',
    '{{nome_funcionario}}': 'atendimento',
    '{{ultima_resposta}}': lastInteractionNote || 'sem resposta recente',
    '{{dias_sem_resposta}}': `${daysWithoutResponse} dias`,
    '{{score}}': leadScore,
    '{{etapa_funil}}': funnelStage,
    '{{ponto_a}}': 'com um canal estático sem agendamento direto',
    '{{ponto_b}}': 'recebendo mensagens de clientes qualificados todos os dias',
    '{{ponto_c}}': 'os visitantes desistem antes de falar com a equipe',
    '{{link_demonstracao}}': 'https://exemplo-preview.leadion.app',
    '{{link_prototipo}}': 'https://exemplo-preview.leadion.app',
    '{{links_demonstracoes}}': 'https://portfolio.leadion.app',
    '{{ajustes_solicitados}}': 'cores da marca, botão fixo de WhatsApp e textos dos serviços',
    '{{dados_pagamento}}': 'Chave Pix CNPJ: 00.000.000/0001-00 ou Transferência Bancária',
    '{{processo_chave}}': 'agendamento e captação de clientes',
    '{{etapa_1_entrada}}': 'cliente preenche os dados em 20 segundos',
    '{{etapa_2_processamento_automatico}}': 'o sistema organiza e notifica no WhatsApp da equipe',
    '{{etapa_3_saida_notificacao}}': 'o agendamento é confirmado instantaneamente',
    '{{escopo_mvp}}': 'painel de agendamento rápido e integração direta com WhatsApp',
    '{{prazo_mvp}}': '4',
    '{{link_meet}}': 'https://meet.google.com/abc-defg-hij',
    '{{ultimo_ponto_mencionado}}': 'como os clientes entram em contato hoje',
    '{{opcao_simples}}': 'a página de agendamento rápida',
    '{{opcao_completa}}': 'o sistema com painel e notificações automáticas',
    '{{escopo_reduzido}}': 'a página de agendamento essencial',
  };

  let interpolated = template;
  for (const [key, value] of Object.entries(variablesMap)) {
    interpolated = interpolated.replaceAll(key, value);
  }

  return { text: interpolated, variablesMap };
}

/**
 * Intelligent Next Action Calculator for WhatsApp Prospecting
 */
export function getSmartScriptRecommendation(
  params: ScriptRecommendationParams
): ScriptRecommendationResult {
  const {
    client,
    company,
    contact,
    lead,
    service,
    history = [],
    preferredFlow = 'problema_identificado',
    preferredTone = 'consultivo',
    currentStepNumber,
    detectedObjectionId,
  } = params;

  const country = params.preferredCountry || detectCountry(company, client);
  const currency = getCurrencyForCountry(country);
  const phone = company?.companyPhone || (company as any)?.phone || client?.phone || contact?.phone || '';
  const isDnc = Boolean((client as any)?.isDoNotContact || ((lead?.status === 'lost' || (lead?.status as string) === 'perdido') && (lead as any)?.lostReason?.toLowerCase()?.includes('não contactar')));

  // If DNC (Do Not Contact), enforce stop rule immediately
  if (isDnc) {
    return {
      stepId: 'dnc-stop',
      stepNumber: 0,
      stepTitle: 'CONTATO BLOQUEADO (NÃO CONTACTAR / DNC)',
      flowType: preferredFlow,
      rationale: 'Este prospect está marcado como Não Contactar (DNC) ou solicitou expressamente encerramento de mensagens. Regra de ouro: não insistir.',
      message: 'Contato bloqueado por política de respeito ao prospect (DNC). Nenhuma mensagem recomendada.',
      rawTemplate: '',
      alternatives: { consultivo: '', direto: '', casual: '' },
      variablesUsed: {},
      followUps: [],
      currentFollowUpIndex: 0,
      isFollowUp: false,
      isDnc: true,
      isStopped: true,
      stopReason: 'Prospect solicitou não receber mensagens ou atingiu limite de tentativas.',
      contactRoleDetected: 'indeterminado',
      channel: 'whatsapp',
      country,
      currency,
    };
  }

  // Calculate days without response from interaction history
  const lastInteraction = history.length > 0 ? history[0] : null;
  const lastDate = lastInteraction
    ? new Date(lastInteraction.timestamp || (lastInteraction as any).createdAt || Date.now())
    : (lead?.updatedAt ? new Date(lead.updatedAt) : new Date());
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Detect role
  let roleDetected: ContactRoleType = 'indeterminado';
  const contactRole = (contact?.role || client?.role || '').toLowerCase();
  if (contactRole.includes('dono') || contactRole.includes('sócio') || contactRole.includes('diretor') || contactRole.includes('proprietári') || contactRole.includes('ceo') || contactRole.includes('gerente')) {
    roleDetected = 'decisor';
  } else if (contactRole.includes('recep') || contactRole.includes('atendente') || contactRole.includes('secretár') || contactRole.includes('assistente')) {
    roleDetected = 'funcionario';
  }

  // Check if an objection is explicitly active
  if (detectedObjectionId) {
    const objection = COMPREHENSIVE_OBJECTIONS.find((o) => o.id === detectedObjectionId) || COMPREHENSIVE_OBJECTIONS[0];
    const { text: interpolatedMsg, variablesMap } = interpolateSmartVariables(objection.whatsappResponse, {
      client,
      company,
      contact,
      lead,
      service,
      country,
      daysWithoutResponse: diffDays,
      lastInteractionNote: lastInteraction?.description || (lastInteraction as any)?.notes,
    });

    const { text: consultivoText } = interpolateSmartVariables(objection.consultativeResponse, { client, company, contact, lead, service, country });
    const { text: diretoText } = interpolateSmartVariables(objection.shortResponse, { client, company, contact, lead, service, country });
    const { text: casualText } = interpolateSmartVariables(objection.whatsappResponse, { client, company, contact, lead, service, country });

    return {
      stepId: objection.id,
      stepNumber: objection.number,
      stepTitle: `OBJEÇÃO: ${objection.title}`,
      flowType: preferredFlow,
      rationale: `Objeção detectada: "${objection.clientPhrase}". O cliente busca validação e alívio de risco. Significado: ${objection.underlyingMeaning}.`,
      message: interpolatedMsg,
      rawTemplate: objection.whatsappResponse,
      alternatives: {
        consultivo: consultivoText,
        direto: diretoText,
        casual: casualText,
      },
      variablesUsed: variablesMap,
      followUps: objection.followUps,
      currentFollowUpIndex: 0,
      isFollowUp: false,
      isDnc: false,
      isStopped: false,
      contactRoleDetected: roleDetected,
      channel: 'whatsapp',
      whatsappUrl: generateWhatsAppLink(phone, interpolatedMsg),
      country,
      currency,
    };
  }

  // Select steps database by flow
  const stepsList = preferredFlow === 'oportunidade_latente' ? OPORTUNIDADE_LATENTE_STEPS : PROBLEMA_IDENTIFICADO_STEPS;
  
  // Determine step
  let stepIndex = 0;
  if (currentStepNumber && currentStepNumber >= 1 && currentStepNumber <= stepsList.length) {
    stepIndex = currentStepNumber - 1;
  } else if (history.length === 0) {
    stepIndex = 0; // Step 1 initial contact
  } else if (roleDetected === 'funcionario' && history.length === 1) {
    stepIndex = 2; // Step 3: Rota funcionário
  } else {
    // Map based on interaction count / lead stage
    const count = Math.min(history.length, stepsList.length - 1);
    stepIndex = count;
  }

  const currentStep = stepsList[stepIndex] || stepsList[0];

  // Determine if it's a follow-up or next primary step
  let isFollowUp = false;
  let followUpIndex = 0;
  let activeTemplate = currentStep.scriptTemplate;

  // Use country specific variation if present
  if (currentStep.countryVariations && currentStep.countryVariations[country]) {
    activeTemplate = currentStep.countryVariations[country]!;
  }

  // If waiting for response for > 0 days and follow-ups exist
  if (history.length > 0 && currentStep.followUps && currentStep.followUps.length > 0) {
    if (diffDays >= 1) {
      isFollowUp = true;
      if (diffDays >= 14) followUpIndex = Math.min(5, currentStep.followUps.length - 1);
      else if (diffDays >= 7) followUpIndex = Math.min(4, currentStep.followUps.length - 1);
      else if (diffDays >= 4) followUpIndex = Math.min(3, currentStep.followUps.length - 1);
      else if (diffDays >= 2) followUpIndex = Math.min(2, currentStep.followUps.length - 1);
      else if (diffDays >= 1) followUpIndex = Math.min(1, currentStep.followUps.length - 1);
      else followUpIndex = 0;

      activeTemplate = currentStep.followUps[followUpIndex]?.message || activeTemplate;
    }
  }

  // Check stop rule: if more than 6 follow-ups or > 30 days without response
  const isStopped = diffDays > 30 && history.length >= 6;

  // Interpolate texts
  const { text: interpolatedMsg, variablesMap } = interpolateSmartVariables(activeTemplate, {
    client,
    company,
    contact,
    lead,
    service,
    country,
    daysWithoutResponse: diffDays,
    lastInteractionNote: lastInteraction?.description || (lastInteraction as any)?.notes,
  });

  const { text: consultivoText } = interpolateSmartVariables(
    currentStep.alternativeTemplates?.consultivo || currentStep.scriptTemplate,
    { client, company, contact, lead, service, country }
  );
  const { text: diretoText } = interpolateSmartVariables(
    currentStep.alternativeTemplates?.direto || currentStep.scriptTemplate,
    { client, company, contact, lead, service, country }
  );
  const { text: casualText } = interpolateSmartVariables(
    currentStep.alternativeTemplates?.casual || currentStep.scriptTemplate,
    { client, company, contact, lead, service, country }
  );

  const pricingAnchor = calculatePricingAndAnchor(service, country);

  return {
    stepId: currentStep.id,
    stepNumber: currentStep.stepNumber,
    stepTitle: currentStep.title,
    flowType: currentStep.flowType,
    rationale: isFollowUp
      ? `Aguardando retorno há ${diffDays} dia(s). Recomendando Follow-up #${followUpIndex + 1} (${currentStep.followUps?.[followUpIndex]?.objective || 'Acompanhamento'}).`
      : `${currentStep.objective} ${currentStep.purposeDescription}`,
    message: interpolatedMsg,
    rawTemplate: activeTemplate,
    alternatives: {
      consultivo: consultivoText,
      direto: diretoText,
      casual: casualText,
    },
    variablesUsed: variablesMap,
    followUps: currentStep.followUps || [],
    currentFollowUpIndex: followUpIndex,
    isFollowUp,
    isDnc: false,
    isStopped,
    stopReason: isStopped ? 'Prospect com mais de 30 dias de inatividade ou limite de follow-ups atingido.' : undefined,
    contactRoleDetected: roleDetected,
    channel: 'whatsapp',
    whatsappUrl: generateWhatsAppLink(phone, interpolatedMsg),
    country,
    currency,
    pricingAnchor,
  };
}
