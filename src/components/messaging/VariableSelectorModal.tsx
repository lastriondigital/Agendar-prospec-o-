import React, { useState } from 'react';
import {
  Code,
  Search,
  User,
  Building2,
  Briefcase,
  AlertCircle,
  Plus,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { DYNAMIC_VARIABLES, VariableDef } from '../../utils/messagePersonalizer';

interface VariableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVariable: (tag: string) => void;
}

export const VariableSelectorModal: React.FC<VariableSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectVariable,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customVarName, setCustomVarName] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todas as Variáveis', icon: Code },
    { id: 'contato', label: 'Contato & Persona', icon: User },
    { id: 'empresa', label: 'Empresa & Local', icon: Building2 },
    { id: 'servico', label: 'Serviço & Oferta', icon: Briefcase },
    { id: 'diagnostico', label: 'Diagnóstico & Contexto', icon: AlertCircle },
  ];

  const filteredVariables = DYNAMIC_VARIABLES.filter((v) => {
    if (activeCategory !== 'all' && v.category !== activeCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        v.tag.toLowerCase().includes(q) ||
        v.label.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.example.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelect = (tag: string) => {
    onSelectVariable(tag);
    setCopiedTag(tag);
    setTimeout(() => {
      setCopiedTag(null);
      onClose();
    }, 300);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVarName.trim()) return;
    
    // Normaliza para formato [NOME_VARIAVEL]
    const cleanName = customVarName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '');
    
    const finalTag = `[${cleanName}]`;
    handleSelect(finalTag);
    setCustomVarName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inserir Variável Dinâmica"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Info Box */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-200">Personalização Dinâmica de Scripts</p>
            <p className="text-blue-300/80 mt-0.5">
              Ao usar variáveis como <code className="bg-blue-950 px-1 py-0.5 rounded text-blue-200">[NOME]</code> ou <code className="bg-blue-950 px-1 py-0.5 rounded text-blue-200">[PROBLEMA]</code>, o sistema substituirá automaticamente pelas informações correspondentes cadastradas no lead no momento do envio.
            </p>
          </div>
        </div>

        {/* Busca e Filtros de Categoria */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar variável (ex: nome, problema, preço)..."
              leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
              autoFocus
            />
          </div>
        </div>

        {/* Categorias Pills */}
        <div className="flex flex-wrap gap-1.5 pb-1 border-b border-neutral-800">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Lista de Variáveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredVariables.map((v) => {
            const isJustCopied = copiedTag === v.tag;
            return (
              <button
                key={v.tag}
                type="button"
                onClick={() => handleSelect(v.tag)}
                className={`text-left p-3 rounded-xl border transition-all duration-150 relative group ${
                  isJustCopied
                    ? 'bg-emerald-500/20 border-emerald-500/50'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-blue-500/40 hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-blue-400 group-hover:text-blue-300">
                      {v.tag}
                    </span>
                    {v.isContextual && (
                      <Badge variant="amber" size="sm" className="text-[10px] py-0 px-1">
                        Contextual
                      </Badge>
                    )}
                  </div>
                  {isJustCopied ? (
                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Inserido
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      + Inserir
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-neutral-200">{v.label}</div>
                <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{v.description}</p>
                <div className="mt-2 text-[10px] text-neutral-400 flex items-center gap-1 font-mono bg-neutral-950/60 px-2 py-1 rounded">
                  <span className="text-neutral-400">Ex:</span> {v.example}
                </div>
              </button>
            );
          })}
        </div>

        {/* Criar Variável Personalizada */}
        <div className="pt-3 border-t border-neutral-800">
          <form onSubmit={handleAddCustom} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                value={customVarName}
                onChange={(e) => setCustomVarName(e.target.value)}
                placeholder="Criar variável customizada (ex: CONCORRENTE, ULTIMO_POST, NUMERO_AVALIACOES)"
                leftIcon={<Plus className="w-4 h-4 text-emerald-400" />}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!customVarName.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Inserir Personalizada
            </Button>
          </form>
          <p className="text-[11px] text-neutral-400 mt-1.5">
            Variáveis personalizadas podem receber valores customizados para cada lead ou campanha.
          </p>
        </div>

        {/* Rodapé com botão de fechar */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
