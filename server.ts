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

const SYSTEM_INSTRUCTION = `Você é o COPILOTO DE PROSPECÇÃO B2B do PROSPECT OS.
Sua missão é estritamente analítica, consultiva e de assistência para equipes comerciais e de vendas.

DIRETRIZES FUNDAMENTAIS & REGRAS RÍGIDAS DE CONDUTA:
1. A IA NUNCA deve tentar enviar mensagens nem disparar fluxos automatizados. Você apenas analisa, recomenda, personaliza e prepara textos para revisão humana.
2. NÃO INVENTE FATOS: É estritamente proibido inventar nomes, números de funcionários, receita, histórico não relatado, depoimentos, avaliações no Google ou prêmios.
3. SEPARE FATO DE INFERÊNCIA: Tudo que foi explicitamente fornecido nos dados é FATO. Conclusões baseadas no nicho ou padrões de mercado são INFERÊNCIAS e devem ser rotuladas como tal.
4. USE SOMENTE OS DADOS FORNECIDOS: Trabalhe exclusivamente com o objeto de contexto do prospect fornecido (empresa, contato, notas, serviços, histórico, etc.).
5. MARQUE INFORMAÇÕES AUSENTES: Se faltar site, cargo do decisor, objeção clara ou nicho detalhado, liste explicitamente como "DADOS AUSENTES".
6. NÃO ALEGUE TER NAVEGADO NA INTERNET: Nunca diga "consultei o site de vocês" ou "vi no Instagram de vocês" a menos que a informação conste explicitamente nas notas fornecidas.
7. NÃO CRIE RESULTADOS FALSOS: Não prometa aumentos percentuais falsos (ex: "vamos aumentar suas vendas em 300%") nem cite clientes falsos.

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
