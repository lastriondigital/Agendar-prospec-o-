import React, { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Flame,
  Globe,
  HelpCircle,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  TestTube,
  X,
} from 'lucide-react';
import { Company, Contact, IdealCustomerProfile, Lead, ScoringWeightConfig, Service } from '../../types';
import { calculateLeadScore, DEFAULT_SCORING_WEIGHTS, getScoreClassificationLabel, getScoreColorTokens } from '../../utils/leadScoring';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ScoreBreakdownModal } from './ScoreBreakdownModal';

interface ScoreSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  icps: IdealCustomerProfile[];
  services: Service[];
  weights?: ScoringWeightConfig;
}

export const ScoreSimulatorModal: React.FC<ScoreSimulatorModalProps> = ({
  isOpen,
  onClose,
  icps,
  services,
  weights = DEFAULT_SCORING_WEIGHTS,
}) => {
  // Simulator State
  const [hasWebsite, setHasWebsite] = useState(true);
  const [websiteQuality, setWebsiteQuality] = useState<'boa' | 'media' | 'ruim' | 'nenhuma'>('media');
  const [googlePresence, setGooglePresence] = useState<'forte' | 'media' | 'nula'>('forte');
  const [instagramPresence, setInstagramPresence] = useState<'ativo' | 'inativo' | 'nenhum'>('ativo');
  const [unitsCount, setUnitsCount] = useState<number>(2);
  const [hasWhatsApp, setHasWhatsApp] = useState(true);
  const [hasEmail, setHasEmail] = useState(true);
  const [hasApparentNeed, setHasApparentNeed] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState('Odontologia');
  const [selectedCity, setSelectedCity] = useState('São Paulo');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [leadStage, setLeadStage] = useState<'NOVO' | 'RESPONDEU' | 'REUNIÃO'>('RESPONDEU');

  const simulatedResult = useMemo(() => {
    const mockCompany: Company = {
      id: 'mock-sim',
      name: 'Empresa Teste de Qualificação',
      niche: selectedNiche,
      city: selectedCity,
      state: 'SP',
      country: 'Brasil',
      website: hasWebsite ? 'https://empresateste.com.br' : undefined,
      websiteQuality: hasWebsite ? websiteQuality : undefined,
      googleRating: googlePresence === 'forte' ? 4.8 : googlePresence === 'media' ? 3.9 : undefined,
      googleReviewsCount: googlePresence === 'forte' ? 85 : googlePresence === 'media' ? 12 : undefined,
      instagram: instagramPresence !== 'nenhum' ? 'https://instagram.com/empresa' : undefined,
      instagramActive: instagramPresence === 'ativo',
      numberOfUnits: unitsCount,
      apparentNeed: hasApparentNeed ? 'Precisa de novo site e melhor posicionamento no Google' : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockContact: Contact = {
      id: 'mock-cont',
      companyId: 'mock-sim',
      name: 'Doutor Marcelo',
      role: 'Sócio Fundador',
      phone: hasWhatsApp ? '+55 11 99999-8888' : undefined,
      whatsapp: hasWhatsApp ? '+55 11 99999-8888' : undefined,
      email: hasEmail ? 'marcelo@empresateste.com.br' : undefined,
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockLead: Lead = {
      id: 'mock-lead',
      companyId: 'mock-sim',
      contactId: 'mock-cont',
      stage: leadStage as any,
      status: 'active',
      priority: 'media',
      score: 50,
      serviceId: selectedServiceId || undefined,
      temperature: 'morno',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return calculateLeadScore(mockCompany, mockContact, mockLead, icps, services, [], weights);
  }, [
    hasWebsite,
    websiteQuality,
    googlePresence,
    instagramPresence,
    unitsCount,
    hasWhatsApp,
    hasEmail,
    hasApparentNeed,
    selectedNiche,
    selectedCity,
    selectedServiceId,
    leadStage,
    icps,
    services,
    weights,
  ]);

  const tokens = getScoreColorTokens(simulatedResult.score);
  const classLabel = getScoreClassificationLabel(simulatedResult.classification);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulador de Qualificação de Lead em Tempo Real"
      size="xl"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Fechar Simulador
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Controles de Simulação */}
        <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-2">
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px]">
              1. Presença Digital
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWebsite}
                  onChange={(e) => setHasWebsite(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-neutral-950 border-neutral-700"
                />
                <span className="text-neutral-300 font-medium">Possui Website</span>
              </label>

              {hasWebsite && (
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Qualidade do Site</label>
                  <select
                    value={websiteQuality}
                    onChange={(e) => setWebsiteQuality(e.target.value as any)}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-1.5 text-xs text-neutral-200"
                  >
                    <option value="boa">Boa / Moderno</option>
                    <option value="media">Média / Básico</option>
                    <option value="ruim">Ruim / Lento</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Google Meu Negócio</label>
                <select
                  value={googlePresence}
                  onChange={(e) => setGooglePresence(e.target.value as any)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-1.5 text-xs text-neutral-200"
                >
                  <option value="forte">Forte (4.8★ e 85 avaliações)</option>
                  <option value="media">Média (Poucas avaliações)</option>
                  <option value="nula">Nenhuma presença</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Instagram</label>
                <select
                  value={instagramPresence}
                  onChange={(e) => setInstagramPresence(e.target.value as any)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-1.5 text-xs text-neutral-200"
                >
                  <option value="ativo">Ativo & Postando</option>
                  <option value="inativo">Inativo / Abandonado</option>
                  <option value="nenhum">Sem Instagram</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px]">
              2. Porte, Canais & Segmento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWhatsApp}
                  onChange={(e) => setHasWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-neutral-950 border-neutral-700"
                />
                <span className="text-neutral-300 font-medium">WhatsApp do Decisor</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEmail}
                  onChange={(e) => setHasEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-neutral-950 border-neutral-700"
                />
                <span className="text-neutral-300 font-medium">E-mail Corporativo</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Nº de Filiais / Unidades</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={unitsCount}
                  onChange={(e) => setUnitsCount(Number(e.target.value))}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-1.5 text-xs text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Nicho Cadastrado</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-1.5 text-xs text-neutral-200"
                >
                  <option value="Odontologia">Odontologia (Saúde)</option>
                  <option value="Dermatologia">Dermatologia (Saúde)</option>
                  <option value="Restaurante">Restaurante / Gastronomia</option>
                  <option value="Advocacia">Advocacia / Jurídico</option>
                  <option value="Imobiliária">Imobiliária</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasApparentNeed}
                  onChange={(e) => setHasApparentNeed(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-neutral-950 border-neutral-700"
                />
                <span className="text-neutral-300 font-medium">Necessidade Comercial Detectada</span>
              </label>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Placar de Pontuação Explicável */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-5 rounded-2xl border ${tokens.bg} ${tokens.border} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${tokens.badgeBg} ${tokens.badgeText}`}>
                {classLabel}
              </span>
              <span className="text-xs font-mono text-neutral-400">Score de 0–100</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-black font-mono tracking-tight ${tokens.text}`}>
                {simulatedResult.score}
              </span>
              <span className="text-sm font-bold text-neutral-500">/ 100 pontos</span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {simulatedResult.summaryReason}
            </p>
          </div>

          {/* Lista de Fatores Avaliados */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span>Critérios Pontuados</span>
              <span className="font-mono text-emerald-400">+{simulatedResult.breakdown.reduce((a, b) => a + Math.max(0, b.points), 0)} pts</span>
            </h5>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {simulatedResult.breakdown.map((item) => (
                <div
                  key={item.ruleId}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs"
                >
                  <span className="text-neutral-300 truncate">{item.label}</span>
                  <span
                    className={`font-mono font-bold px-1.5 py-0.5 rounded shrink-0 text-[11px] ${
                      item.points > 0
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : item.points < 0
                        ? 'text-rose-400 bg-rose-500/10'
                        : 'text-neutral-500 bg-neutral-800'
                    }`}
                  >
                    {item.points > 0 ? `+${item.points}` : item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
