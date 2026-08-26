import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Company, Contact, ExecutionMetrics, ExecutionQueueItem, Lead, LeadScoreResult, ProspectAction } from '../types';
import { formatDurationMinutes, interpolateMessage } from '../utils/formatting';
import { calculateLeadScore, DEFAULT_SCORING_WEIGHTS } from '../utils/leadScoring';

export interface DailyWeeklyDay {
  dateStr: string;
  dayLabel: string;
  dayShort: string;
  isToday: boolean;
  isFuture: boolean;
  completedCount: number;
  goal: number;
  goalMet: boolean;
}

export interface EnrichedPriorityLead {
  lead: Lead;
  company?: Company;
  contact?: Contact;
  scoreResult: LeadScoreResult;
}

export function useExecutionQueue() {
  const {
    actions,
    clients,
    companies,
    contacts,
    leads,
    history,
    campaigns,
    services,
    icps,
    templates,
    settings,
  } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const weights = settings.scoringWeights || DEFAULT_SCORING_WEIGHTS;

  // Mapa memoizado de scores calculados em tempo real com base nos dados reais
  const scoresMap = useMemo(() => {
    const map = new Map<string, LeadScoreResult>();
    companies.forEach((company) => {
      const contact = contacts.find((c) => c.companyId === company.id && c.isPrimary) || contacts.find((c) => c.companyId === company.id);
      const lead = leads.find((l) => l.companyId === company.id);
      const res = calculateLeadScore(company, contact, lead, icps, services, history, weights);
      map.set(company.id, res);
    });
    return map;
  }, [companies, contacts, leads, icps, services, history, weights]);

  // Filter actions for today or overdue pending
  const todayActions = useMemo(() => {
    return actions.filter((a) => {
      // Include pending from today or overdue past dates
      if (a.status === 'pending') {
        return a.scheduledDate <= todayStr;
      }
      // Include completed today
      return a.scheduledDate === todayStr || (a.executedAt && a.executedAt.slice(0, 10) === todayStr);
    });
  }, [actions, todayStr]);

  const pendingActions = useMemo(() => {
    return todayActions
      .filter((a) => a.status === 'pending')
      .sort((a, b) => {
        // 1. Overdue first
        const aOverdue = a.scheduledDate < todayStr ? 1 : 0;
        const bOverdue = b.scheduledDate < todayStr ? 1 : 0;
        if (bOverdue !== aOverdue) return bOverdue - aOverdue;

        // 2. High priority first
        const priorityScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const pDiff = (priorityScore[b.priority] || 2) - (priorityScore[a.priority] || 2);
        if (pDiff !== 0) return pDiff;

        // 3. Lead score calculado em tempo real
        const aScore = scoresMap.get(a.clientId)?.score ?? 50;
        const bScore = scoresMap.get(b.clientId)?.score ?? 50;
        if (bScore !== aScore) return bScore - aScore;

        return a.scheduledDate.localeCompare(b.scheduledDate);
      });
  }, [todayActions, todayStr, scoresMap]);

  const overdueActions = useMemo(() => {
    return actions.filter((a) => a.status === 'pending' && a.scheduledDate < todayStr);
  }, [actions, todayStr]);

  const completedToday = useMemo(() => {
    return actions.filter(
      (a) => a.status === 'completed' && ((a.executedAt && a.executedAt.slice(0, 10) === todayStr) || a.scheduledDate === todayStr)
    );
  }, [actions, todayStr]);

  const totalMinutesLeft = useMemo(() => {
    return pendingActions.reduce((acc, curr) => acc + (curr.estMinutes || settings.estMinutesPerAction || 2), 0);
  }, [pendingActions, settings.estMinutesPerAction]);

  // Lead segmentation counts for "Hoje" breakdown
  const categoryCounts = useMemo(() => {
    const activeLeads = leads.filter((l) => l.status === 'active');

    // 1. Primeiros Contactos
    const firstContacts = activeLeads.filter(
      (l) => l.stage === 'NOVO' || l.stage === 'PRIMEIRO_CONTACTO'
    ).length;

    // 2. Follow-ups
    const followUps = activeLeads.filter(
      (l) => l.stage === 'RESPONDEU' || l.stage === 'INTERESSADO' || l.stage === 'SEM_RESPOSTA' || l.stage === 'OBJEÇÃO'
    ).length;

    // 3. Propostas
    const proposals = activeLeads.filter(
      (l) => l.stage === 'REUNIÃO' || l.stage === 'PROPOSTA' || l.stage === 'NEGOCIAÇÃO'
    ).length;

    // 4. Reativações
    const reactivations = activeLeads.filter(
      (l) => l.stage === 'REATIVAÇÃO' || l.stage === 'ADIADO'
    ).length;

    return {
      firstContacts,
      followUps,
      proposals,
      reactivations,
    };
  }, [leads]);

  // Streak de Execução: Calculate consecutive days with at least 1 completed action or interaction
  const streakDays = useMemo(() => {
    const completedDates = new Set<string>();
    
    actions.forEach((a) => {
      if (a.status === 'completed') {
        const d = a.executedAt ? a.executedAt.slice(0, 10) : a.scheduledDate;
        if (d) completedDates.add(d);
      }
    });

    history.forEach((h) => {
      if (h.type === 'action_completed' || h.type === 'message_sent' || h.type === 'contact_made') {
        const d = h.timestamp ? h.timestamp.slice(0, 10) : '';
        if (d) completedDates.add(d);
      }
    });

    let currentStreak = 0;
    const checkDate = new Date();
    
    // Check today first
    const todayFormatted = checkDate.toISOString().slice(0, 10);
    const hasToday = completedDates.has(todayFormatted);
    if (hasToday) {
      currentStreak += 1;
    }

    // Check backwards from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const dateStr = checkDate.toISOString().slice(0, 10);
      if (completedDates.has(dateStr)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      if (currentStreak > 365) break; // safety guard
    }

    return currentStreak;
  }, [actions, history]);

  // Weekly Progress (Mon - Sun of current week)
  const weeklyProgress = useMemo((): DailyWeeklyDay[] => {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const distanceToMonday = (currentDayOfWeek + 6) % 7;

    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const daysLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const fullDaysLabels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    const result: DailyWeeklyDay[] = [];
    const dailyGoal = settings.dailyGoal || 15;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;

      const completedCount = actions.filter((a) => {
        if (a.status !== 'completed') return false;
        const executed = a.executedAt ? a.executedAt.slice(0, 10) : a.scheduledDate;
        return executed === dateStr;
      }).length;

      result.push({
        dateStr,
        dayLabel: fullDaysLabels[i],
        dayShort: daysLabels[i],
        isToday,
        isFuture,
        completedCount,
        goal: dailyGoal,
        goalMet: completedCount >= dailyGoal,
      });
    }

    return result;
  }, [actions, settings.dailyGoal, todayStr]);

  // Full detailed queue items enriched with relational entities
  const queueItems: ExecutionQueueItem[] = useMemo(() => {
    return pendingActions
      .map((action) => {
        const client = clients.find((c) => c.id === action.clientId);
        const company = companies.find((c) => c.id === action.clientId);
        const contact = contacts.find((c) => c.companyId === action.clientId && c.isPrimary) || contacts.find((c) => c.companyId === action.clientId);
        const lead = leads.find((l) => l.companyId === action.clientId);

        if (!client && !company) return null;

        const effectiveClient = client || {
          id: company!.id,
          name: contact?.name || company!.name,
          company: company!.name,
          role: contact?.role,
          phone: contact?.phone,
          whatsapp: contact?.whatsapp || contact?.phone,
          email: contact?.email,
          website: company!.website,
          linkedinUrl: company!.linkedin,
          segment: company!.niche,
          status: 'in_contact',
          stageId: 'stage-contacted',
          serviceIds: lead?.serviceId ? [lead.serviceId] : [],
          tags: [company!.niche],
          createdAt: company!.createdAt,
          updatedAt: company!.updatedAt,
        };

        const campaign = campaigns.find((c) => c.id === action.campaignId);
        const service = services.find((s) =>
          campaign?.serviceId
            ? s.id === campaign.serviceId
            : lead?.serviceId
            ? s.id === lead.serviceId
            : effectiveClient.serviceIds?.includes(s.id)
        );

        let template = templates.find((t) => t.id === action.templateId);
        if (!template && campaign?.defaultTemplateId) {
          template = templates.find((t) => t.id === campaign.defaultTemplateId);
        }
        if (!template) {
          template = templates.find((t) => t.channel === action.channel);
        }

        const rawMessage = action.customMessage || template?.content || 'Olá {{primeiro_nome}}, tudo bem?';
        const interpolated = interpolateMessage(rawMessage, effectiveClient, service);

        // Derive action objective
        let objective = 'Prospecção Inicial';
        if (lead) {
          if (lead.stage === 'NOVO' || lead.stage === 'PRIMEIRO_CONTACTO') objective = 'Primeiro Contacto';
          else if (lead.stage === 'RESPONDEU' || lead.stage === 'INTERESSADO') objective = 'Follow-up de Qualificação';
          else if (lead.stage === 'REUNIÃO') objective = 'Confirmação / Agendamento de Reunião';
          else if (lead.stage === 'PROPOSTA' || lead.stage === 'NEGOCIAÇÃO') objective = 'Apresentação de Proposta / Negociação';
          else if (lead.stage === 'REATIVAÇÃO' || lead.stage === 'ADIADO') objective = 'Reativação de Contato';
          else if (lead.stage === 'SEM_RESPOSTA') objective = 'Tentativa de Follow-up #2';
        }

        const recentHistory = history
          .filter((h) => h.companyId === (company?.id || effectiveClient.id))
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .slice(0, 5);

        return {
          action,
          client: effectiveClient,
          company,
          contact,
          lead,
          campaign,
          service,
          template,
          interpolatedMessage: interpolated,
          objective,
          recentHistory,
        };
      })
      .filter(Boolean) as ExecutionQueueItem[];
  }, [pendingActions, clients, companies, contacts, leads, campaigns, services, templates, history]);

  // Next immediate action item with resolved relations and pre-compiled message
  const nextItem: ExecutionQueueItem | null = useMemo(() => {
    if (queueItems.length > 0) {
      return queueItems[0];
    }
    return null;
  }, [queueItems]);

  // Priority Leads enriquecidos com score explicável em tempo real
  const priorityLeads: EnrichedPriorityLead[] = useMemo(() => {
    const list: EnrichedPriorityLead[] = [];

    companies.forEach((company) => {
      const contact = contacts.find((c) => c.companyId === company.id && c.isPrimary) || contacts.find((c) => c.companyId === company.id);
      const lead = leads.find((l) => l.companyId === company.id);
      const scoreResult = scoresMap.get(company.id) || calculateLeadScore(company, contact, lead, icps, services, history, weights);

      // Inclui se score >= 40 ou prioridade alta ou lead ativo
      if (scoreResult.score >= 40 || lead?.priority === 'alta' || lead?.temperature === 'quente') {
        list.push({
          lead: lead || {
            id: `lead-temp-${company.id}`,
            companyId: company.id,
            contactId: contact?.id || '',
            stage: 'NOVO',
            status: 'active',
            priority: 'media',
            score: scoreResult.score,
            temperature: 'morno',
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
          },
          company,
          contact,
          scoreResult,
        });
      }
    });

    return list
      .sort((a, b) => b.scoreResult.score - a.scoreResult.score)
      .slice(0, 10);
  }, [companies, contacts, leads, scoresMap, icps, services, history, weights]);

  // Critical rule: Leads without next action
  const leadsWithoutNextAction = useMemo(() => {
    return leads.filter((l) => l.status === 'active' && (!l.nextActionDate || !l.nextActionTitle));
  }, [leads]);

  const metrics: ExecutionMetrics = useMemo(() => {
    return {
      totalActionsToday: todayActions.length,
      completedToday: completedToday.length,
      pendingToday: pendingActions.length,
      estimatedMinutesLeft: totalMinutesLeft,
      nextAction: nextItem ? { action: nextItem.action, client: nextItem.client, template: nextItem.template } : null,
    };
  }, [todayActions.length, completedToday.length, pendingActions.length, totalMinutesLeft, nextItem]);

  const dailyGoal = settings.dailyGoal || 15;
  const progressPercentage = Math.min(
    100,
    Math.round((completedToday.length / Math.max(1, dailyGoal)) * 100)
  );

  return {
    todayActions,
    pendingActions,
    overdueActions,
    completedToday,
    queueItems,
    nextItem,
    metrics,
    categoryCounts,
    streakDays,
    weeklyProgress,
    priorityLeads,
    scoresMap,
    leadsWithoutNextAction,
    totalMinutesLeft,
    dailyGoal,
    formattedDuration: formatDurationMinutes(totalMinutesLeft),
    progressPercentage,
  };
}

