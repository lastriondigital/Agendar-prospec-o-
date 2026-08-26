import React, { useState } from 'react';
import {
  Flame,
  Info,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Star,
  TestTube,
} from 'lucide-react';
import { ScoringWeightConfig } from '../../types';
import { DEFAULT_SCORING_WEIGHTS } from '../../utils/leadScoring';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ScoringSettingsPanelProps {
  weights?: ScoringWeightConfig;
  onSave: (weights: ScoringWeightConfig) => Promise<void>;
  onOpenSimulator: () => void;
}

export const ScoringSettingsPanel: React.FC<ScoringSettingsPanelProps> = ({
  weights = DEFAULT_SCORING_WEIGHTS,
  onSave,
  onOpenSimulator,
}) => {
  const [config, setConfig] = useState<ScoringWeightConfig>({
    ...DEFAULT_SCORING_WEIGHTS,
    ...weights,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = (field: keyof ScoringWeightConfig, value: number) => {
    setConfig((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_SCORING_WEIGHTS);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Explicativo */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Configuração dos Pesos de Lead Scoring (0–100)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Defina o peso de cada critério para o cálculo automático da pontuação de qualificação.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSimulator}
              leftIcon={<TestTube className="w-4 h-4 text-sky-400" />}
            >
              Simulador em Tempo Real
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Salvar Pesos
            </Button>
          </div>
        </div>

        {/* Faixas de Classificação do Score */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
              0 a 39 pontos
            </span>
            <span className="font-bold text-neutral-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-500" />
              Baixa Prioridade
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
              40 a 69 pontos
            </span>
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Média Prioridade
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1">
            <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block">
              70 a 84 pontos
            </span>
            <span className="font-bold text-sky-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
              Alta Prioridade
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">
              85 a 100 pontos
            </span>
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              Prioridade Máxima
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Sliders de Pesos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Presença Digital & Website */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
              1. Presença Digital & Website
            </h4>
            <span className="text-[10px] text-neutral-500">Website & Qualidade</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Possui Website Próprio</span>
                <span className="font-mono font-bold text-emerald-400">+{config.hasWebsite} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={config.hasWebsite}
                onChange={(e) => handleUpdate('hasWebsite', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Qualidade do Website: Boa / Moderna</span>
                <span className="font-mono font-bold text-emerald-400">+{config.websiteQualityGood} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={config.websiteQualityGood}
                onChange={(e) => handleUpdate('websiteQualityGood', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Website Lento ou com Problemas (Oportunidade)</span>
                <span className="font-mono font-bold text-amber-400">+{config.websiteQualityPoor} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={config.websiteQualityPoor}
                onChange={(e) => handleUpdate('websiteQualityPoor', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* 2. Google & Redes Sociais */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
              2. Google & Redes Sociais
            </h4>
            <span className="text-[10px] text-neutral-500">Google Business & Instagram</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Presença Forte no Google (Avaliações / GBP)</span>
                <span className="font-mono font-bold text-emerald-400">+{config.googlePresenceStrong} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={config.googlePresenceStrong}
                onChange={(e) => handleUpdate('googlePresenceStrong', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Presença Média ou Básica no Google</span>
                <span className="font-mono font-bold text-sky-400">+{config.googlePresenceMedium} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={config.googlePresenceMedium}
                onChange={(e) => handleUpdate('googlePresenceMedium', Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Instagram Ativo & Atualizado</span>
                <span className="font-mono font-bold text-emerald-400">+{config.instagramActive} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={config.instagramActive}
                onChange={(e) => handleUpdate('instagramActive', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* 3. Porte, Unidades & Canais de Contato */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
              3. Porte & Canais de Contato
            </h4>
            <span className="text-[10px] text-neutral-500">Canais & Filiais</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>WhatsApp Comercial Disponível</span>
                <span className="font-mono font-bold text-emerald-400">+{config.hasWhatsApp} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={config.hasWhatsApp}
                onChange={(e) => handleUpdate('hasWhatsApp', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>E-mail Corporativo ou do Decisor</span>
                <span className="font-mono font-bold text-emerald-400">+{config.hasEmail} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={config.hasEmail}
                onChange={(e) => handleUpdate('hasEmail', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Múltiplas Unidades / Filiais (Escala)</span>
                <span className="font-mono font-bold text-sky-400">+{config.multipleUnits} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={config.multipleUnits}
                onChange={(e) => handleUpdate('multipleUnits', Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* 4. Aderência ao ICP & Atividade Recente */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
              4. Aderência ao ICP & Engajamento
            </h4>
            <span className="text-[10px] text-neutral-500">Match de Perfil & Resposta</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Encaixe Perfeito no ICP Alvo</span>
                <span className="font-mono font-bold text-emerald-400">+{config.fitIcpHigh} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={config.fitIcpHigh}
                onChange={(e) => handleUpdate('fitIcpHigh', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Necessidade Comercial Aparente Cadastrada</span>
                <span className="font-mono font-bold text-amber-400">+{config.hasApparentNeed} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={config.hasApparentNeed}
                onChange={(e) => handleUpdate('hasApparentNeed', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-neutral-200 mb-1">
                <span>Engajamento Recente (Lead Respondeu Mensagem)</span>
                <span className="font-mono font-bold text-emerald-400">+{config.recentActivityResponded} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={config.recentActivityResponded}
                onChange={(e) => handleUpdate('recentActivityResponded', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Footer com Ações */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetDefaults}
          leftIcon={<RotateCcw className="w-4 h-4 text-neutral-400" />}
        >
          Restaurar Pesos Recomendados
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Salvar Regras de Scoring
        </Button>
      </div>
    </div>
  );
};
