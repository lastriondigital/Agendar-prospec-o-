import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initializer for Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health & Status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/copilot/status", (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    online: true,
    aiAvailable: hasKey,
    model: "gemini-3.7-flash",
  });
});

const SYSTEM_INSTRUCTION = `Você é o COPILOTO DE PERSONALIZAÇÃO COMERCIAL E PROSPECÇÃO B2B do PROSPECT OS.
Sua missão é estritamente analítica, consultiva e de assistência para equipes de vendas, adaptando a comunicação ao contexto cultural, geográfico, monetário e hierárquico do lead.

DIRETRIZES FUNDAMENTAIS & REGRAS RÍGIDAS DE CONDUTA:
1. A IA NUNCA deve tentar enviar mensagens nem disparar fluxos automatizados. Você apenas analisa, recomenda, personaliza e prepara textos para revisão humana.
2. ADAPTAÇÃO CULTURAL & GEOGRÁFICA:
   - Respeite o país e vocabulário regional do cliente (ex: Portugal: "sítio/website", "telemóvel", "equipa", Moeda: €; Moçambique: "página web/site", "contacto", Moeda: MT; Brasil: "site", "celular", "equipe", Moeda: R$).
   - Nunca faça conversão de moedas por taxas cambiais fictícias. Use apenas os valores reais e moedas fornecidos no contexto.
3. RESPEITO A CARGO & GÊNERO:
   - Nunca presuma o gênero apenas pelo nome se não houver confirmação expressa (use comunicação neutra e profissional como "Olá [Nome]").
   - Adapte o ângulo de abordagem ao cargo (Proprietário -> ROI, receita e clientes; Gerente -> processos, prazos e produtividade; Recepção -> mensagem ultra-curta e polida solicitando encaminhamento ao responsável comercial).
4. NÃO INVENTE FATOS: É estritamente proibido inventar nomes, número de funcionários, receita, depoimentos, falsas avaliações ou falsas estatísticas.
5. COMUNICAÇÃO NATURAL & HUMANA:
   - A mensagem deve parecer escrita por uma pessoa real, não por uma IA.
   - Proibido: excesso de emojis, frases artificiais, elogios exagerados, falsas urgências ("só até hoje"), falsas provas sociais ("temos 1000 clientes no seu bairro").
6. SEPARE FATO DE INFERÊNCIA: Fatos são dados expressos do cadastro; padrões de mercado são INFERÊNCIAS e devem ser rotulados como tal.
7. MARQUE INFORMAÇÕES AUSENTES: Se faltar preço, cidade, cargo ou dor específica, indique "DADOS AUSENTES" ou "Configuração não definida".

FORMATO DE RESPOSTA:
Sempre retorne estritamente um JSON estruturado com os campos solicitados.`;

// API Endpoint for Prospecting Copilot
app.post("/api/copilot/action", async (req, res) => {
  try {
    const { actionType, leadContext, inputMessage, tone, options } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY não configurada no servidor. O sistema continua em modo offline.",
        fallback: true,
      });
    }

    let actionPrompt = "";
    switch (actionType) {
      case "ANALISAR_LEAD_COMPLETO":
        actionPrompt = `AÇÃO: [DIAGNÓSTICO COMPLETO DO LEAD COM IA]
Realize uma análise consultiva e minuciosa deste prospect:
Contexto do Lead: ${JSON.stringify(leadContext)}
Catálogo de Serviços e ICPs: ${JSON.stringify(options?.availableServices || [])}

DIRETRIZES RÍGIDAS:
1. Avalie a aderência ao ICP: Classifique em A (Excelente Fit), B (Bom Fit), C (Fit Moderado) ou D (Baixo Fit) com justificativa.
2. Calcule 2 scores explicáveis de 0 a 100:
   - opportunityScore (0-100): urgência, demanda identificada, dores visíveis, facilidade de abordagem;
   - qualificationScore (0-100): fit com perfil de cliente ideal, porte, decisor identificado, maturidade.
3. Avalie o Potencial: "Alto", "Médio" ou "Baixo".
4. Identifique problemas reais ou dores latentes (ex: sem site, perfil incompleto no Google, processos manuais com múltiplas unidades).
5. Sugira o melhor serviço e o ângulo de abordagem consultivo (use linguagem hipotética quando falar de perdas ou riscos).
6. Recomende a próxima melhor ação imediata e o canal ideal.
7. Gere um script de abordagem altamente personalizado pronto para envio.
8. Separe com rigor absoluto: Fatos confirmados (factsUsed), Inferências de mercado (inferences) e Informações ausentes (missingData).`;
        break;

      case "PERSONALIZAR":
        actionPrompt = `AÇÃO: [PERSONALIZAR]
Gere uma mensagem altamente personalizada e humanizada de primeiro contato para este prospect.
Contexto do Lead: ${JSON.stringify(leadContext)}
Tom desejado: ${tone || "Consultivo e direto"}
Observações adicionais: ${options?.instructions || "Nenhuma"}

Gere a mensagem principal e 2 alternativas (ex: mais curta, mais consultiva).
Identifique:
- factsUsed: quais fatos do lead foram usados;
- inferences: quais inferências de mercado foram assumidas;
- missingData: quais informações importantes estão faltando sobre este lead.`;
        break;

      case "GERAR_FOLLOWUP":
        actionPrompt = `AÇÃO: [GERAR FOLLOW-UP]
Crie uma mensagem de follow-up estratégica baseada no histórico recente e no tempo decorrido.
Contexto do Lead e Histórico: ${JSON.stringify(leadContext)}
Tom desejado: ${tone || "Amigável, agregador de valor e sem cobrança invasiva"}
Informações de último contato: ${inputMessage || options?.lastContactInfo || "Sem contato recente registrado"}

Identifique:
- factsUsed: fatos da conversa anterior usados;
- inferences: inferências feitas;
- missingData: dados ausentes;
- suggestedNextStep: o que propor no fechamento do follow-up.`;
        break;

      case "ANALISAR_RESPOSTA":
        actionPrompt = `AÇÃO: [ANALISAR RESPOSTA]
Analise a resposta recebida do prospect:
"${inputMessage || options?.prospectResponse}"
Contexto do Lead: ${JSON.stringify(leadContext)}

Classifique:
1. intentClassification: Categoria da intenção (ex: "Interesse Imediato", "Objeção de Preço", "Objeção de Timing", "Pediu mais informações", "Desinteresse definitivo", "Dúvida técnica", "Encaminhou para outro decisor");
2. sentiment: Positivo, Neutro, Objeção ou Negativo;
3. suggestedReply: Resposta recomendada pronta para o usuário revisar e enviar;
4. factsUsed, inferences, missingData;
5. nextActionSuggestion: Próximo passo recomendado.`;
        break;

      case "SUGERIR_SERVICO":
        actionPrompt = `AÇÃO: [SUGERIR SERVIÇO]
Analise o perfil do prospect e o catálogo de serviços disponíveis:
Contexto do Lead: ${JSON.stringify(leadContext)}
Catálogo de Serviços: ${JSON.stringify(options?.availableServices || [])}

Identifique:
1. recommendedService: Qual serviço melhor atende esta empresa e por quê;
2. identifiedProblems: Dores e problemas prováveis enfrentados pela empresa no seu segmento;
3. pitchAngle: O melhor ângulo de abordagem comercial;
4. factsUsed, inferences, missingData.`;
        break;

      case "MELHORAR":
        actionPrompt = `AÇÃO: [MELHORAR]
Refine, corrija e otimize a seguinte mensagem de prospecção:
"${inputMessage}"
Contexto do Lead: ${JSON.stringify(leadContext)}
Tom desejado: ${tone || "Mais persuasivo e conciso"}

Gere uma versão melhorada, remova clichês vazios ("espero que esteja tudo bem", "venho por meio desta"), torne o CTA claro e forneça 2 alternativas com variações de estilo.`;
        break;

      case "RESUMIR":
        actionPrompt = `AÇÃO: [RESUMIR]
Faça um resumo executivo claro e conciso de todo o histórico, anotações e status deste prospect:
Contexto do Lead: ${JSON.stringify(leadContext)}

Gere:
1. summary: Resumo cronológico e estratégico em tópicos;
2. currentStageAssessment: Avaliação do momento atual do lead;
3. keyPoints: Pontos críticos a lembrar;
4. factsUsed, inferences, missingData.`;
        break;

      case "PROXIMA_ACAO":
        actionPrompt = `AÇÃO: [PRÓXIMA AÇÃO]
Com base no histórico e estágio atual do lead, sugira a próxima melhor ação comercial:
Contexto do Lead: ${JSON.stringify(leadContext)}

Recomende:
1. nextActionSuggestion: Ação concreta (ex: "Enviar mensagem com caso de estudo", "Ligar após 48h", "Mudar abordagem para LinkedIn");
2. recommendedChannel: WhatsApp, Ligação, LinkedIn, E-mail ou Reunião;
3. recommendedTiming: Em quantos dias/horas executar;
4. rationalReasoning: Justificativa comercial;
5. factsUsed, inferences, missingData.`;
        break;

      default:
        actionPrompt = `Analise este prospect e recomende as melhores práticas de abordagem:
Contexto do Lead: ${JSON.stringify(leadContext)}
Instruções: ${inputMessage || "Gere uma análise completa."}`;
        break;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: actionPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resultText: {
              type: Type.STRING,
              description: "Texto principal gerado (mensagem sugerida, análise ou resumo)",
            },
            alternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Variações alternativas de mensagem ou abordagem",
            },
            factsUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Fatos explicitamente confirmados que foram utilizados",
            },
            inferences: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Inferências ou suposições baseadas em padrões de mercado",
            },
            missingData: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Dados ausentes importantes que enriqueceriam a abordagem",
            },
            intentClassification: {
              type: Type.STRING,
              description: "Classificação da intenção ou objeção se aplicável",
            },
            sentiment: {
              type: Type.STRING,
              description: "Sentimento detectado: Positivo, Neutro, Objeção ou Negativo",
            },
            identifiedProblems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Problemas ou dores identificadas",
            },
            recommendedService: {
              type: Type.STRING,
              description: "Nome ou detalhe do serviço recomendado",
            },
            nextActionSuggestion: {
              type: Type.STRING,
              description: "Sugestão detalhada da próxima ação",
            },
            recommendedChannel: {
              type: Type.STRING,
              description: "Canal sugerido: whatsapp, linkedin, email, call",
            },
            icpFit: {
              type: Type.STRING,
              description: "Aderência ao ICP: A, B, C ou D com justificativa",
            },
            opportunityScore: {
              type: Type.INTEGER,
              description: "Score de Oportunidade (0 a 100) baseado em urgência e sinais",
            },
            qualificationScore: {
              type: Type.INTEGER,
              description: "Score de Qualificação (0 a 100) baseado em fit de ICP e decisor",
            },
            potential: {
              type: Type.STRING,
              description: "Potencial: Alto, Médio ou Baixo",
            },
            pitchAngle: {
              type: Type.STRING,
              description: "Ângulo de abordagem consultivo",
            },
            suggestedScript: {
              type: Type.STRING,
              description: "Script pronto para abordagem com variáveis",
            },
          },
          required: ["resultText", "factsUsed", "inferences", "missingData"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      actionType,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Erro no Copiloto Gemini:", error);
    return res.status(500).json({
      error: error.message || "Falha ao processar solicitação com Gemini.",
      fallback: true,
    });
  }
});

// Endpoint dedicado para Análise Completa de Lead com IA
app.post("/api/copilot/analyze-lead", async (req, res) => {
  try {
    const { leadContext, icps, availableServices } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY não configurada no servidor. O sistema utiliza análise determinística.",
        fallback: true,
      });
    }

    const prompt = `Analise este lead B2B estritamente com base nos dados fornecidos, sem inventar nenhuma informação não existente.

Contexto do Lead:
${JSON.stringify(leadContext)}

ICPs Cadastrados:
${JSON.stringify(icps || [])}

Serviços Disponíveis:
${JSON.stringify(availableServices || [])}

Retorne uma análise estruturada contendo:
1. icpAdequacy: Texto claro sobre a adequação ao ICP;
2. icpScore: Nota de adequação ao ICP (0 a 100);
3. problemsAndSignals: Lista de problemas ou sinais detectados;
4. commercialPotential: Avaliação do potencial comercial;
5. opportunityState: Estado da oportunidade (HIPOTESE, PROVAVEL, PROBLEMA_CONFIRMADO);
6. opportunityScore: Score de Oportunidade (0 a 100);
7. qualificationScore: Score de Qualificação (0 a 100);
8. recommendedService: Nome do serviço mais compatível;
9. analysisRiskOrLimitations: Riscos ou limitações da análise;
10. recommendedNextAction: Próxima ação recomendada;
11. recommendedChannel: Canal recomendado (whatsapp, call, linkedin, email);
12. recommendedScript: Script curto, humano e personalizado para a próxima ação;
13. confidence: "alta" (se houver dados suficientes) ou "baixa" (se faltarem dados essenciais);
14. confidenceReason: Justificativa da confiança;
15. factsUsed: Fatos confirmados utilizados;
16. missingData: Dados importantes ausentes no cadastro.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            icpAdequacy: { type: Type.STRING },
            icpScore: { type: Type.NUMBER },
            problemsAndSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
            commercialPotential: { type: Type.STRING },
            opportunityState: { type: Type.STRING },
            opportunityScore: { type: Type.NUMBER },
            qualificationScore: { type: Type.NUMBER },
            recommendedService: { type: Type.STRING },
            analysisRiskOrLimitations: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedNextAction: { type: Type.STRING },
            recommendedChannel: { type: Type.STRING },
            recommendedScript: { type: Type.STRING },
            confidence: { type: Type.STRING },
            confidenceReason: { type: Type.STRING },
            factsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingData: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "icpAdequacy",
            "icpScore",
            "problemsAndSignals",
            "commercialPotential",
            "opportunityScore",
            "qualificationScore",
            "recommendedService",
            "recommendedNextAction",
            "recommendedScript",
            "confidence",
            "factsUsed",
            "missingData",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Erro na Análise de Lead Gemini:", error);
    return res.status(500).json({
      error: error.message || "Falha ao analisar lead.",
      fallback: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PROSPECT OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
