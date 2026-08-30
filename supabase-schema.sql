-- ==============================================================================
-- LEADION - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Este arquivo contém o schema SQL completo para o backend do Leadion no Supabase.
-- Execute este script no SQL Editor do dashboard do Supabase (https://supabase.com/dashboard).
-- ==============================================================================

-- Habilita a extensão de UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS (public.profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Usuário',
    email TEXT,
    avatar_url TEXT,
    country TEXT DEFAULT 'Brasil',
    currency TEXT DEFAULT 'BRL',
    language TEXT DEFAULT 'pt-BR',
    communication_style TEXT DEFAULT 'consultivo',
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    onboarding_completed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. TABELA DE EMPRESAS (public.companies)
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trade_name TEXT,
    segment TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Brasil',
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    instagram TEXT,
    linkedin TEXT,
    google_maps_url TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    estimated_size TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. TABELA DE CONTATOS (public.contacts)
CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    salutation TEXT,
    gender TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    instagram TEXT,
    linkedin TEXT,
    is_decision_maker BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. TABELA DE LEADS (public.leads)
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    contact_id TEXT REFERENCES public.contacts(id) ON DELETE SET NULL,
    title TEXT,
    stage TEXT NOT NULL DEFAULT 'NOVO',
    prospecting_type TEXT DEFAULT 'identified_demand', -- 'identified_demand' | 'latent_opportunity'
    opportunity_mode TEXT DEFAULT 'DEMANDA_IDENTIFICADA',
    priority TEXT DEFAULT 'média',
    temperature TEXT DEFAULT 'morno',
    estimated_value NUMERIC(12, 2) DEFAULT 0,
    service_id TEXT,
    score INTEGER DEFAULT 50,
    score_details JSONB DEFAULT '{}'::jsonb,
    signals TEXT[] DEFAULT ARRAY[]::TEXT[],
    lost_reason TEXT,
    lost_notes TEXT,
    won_notes TEXT,
    last_contact_at TIMESTAMPTZ,
    next_action_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. TABELA DE SERVIÇOS / PRODUTOS (public.services)
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    base_price NUMERIC(12, 2) DEFAULT 0,
    min_price NUMERIC(12, 2) DEFAULT 0,
    max_price NUMERIC(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    pricing_model TEXT DEFAULT 'fixed',
    deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. TABELA DE SCRIPTS E TEMPLATES DE MENSAGENS (public.scripts)
CREATE TABLE IF NOT EXISTS public.scripts (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'primeiro_contacto',
    channel TEXT DEFAULT 'whatsapp',
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    response_rate NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. TABELA DO MOTOR DE VENDAS / OBJEÇÕES (public.objections)
CREATE TABLE IF NOT EXISTS public.objections (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'objection', 'pain_point', 'argument', 'proof', 'cta'
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    script TEXT,
    response TEXT,
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    effectiveness_score NUMERIC(5, 2) DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. TABELA DE SEQUÊNCIAS E FOLLOW-UPS (public.follow_ups)
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    contact_id TEXT REFERENCES public.contacts(id) ON DELETE SET NULL,
    step_number INTEGER DEFAULT 1,
    title TEXT,
    channel TEXT DEFAULT 'whatsapp',
    scheduled_for TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- 'pending', 'done', 'skipped', 'cancelled'
    message_content TEXT,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. TABELA DE ATIVIDADES E HISTÓRICO (public.activities)
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    contact_id TEXT REFERENCES public.contacts(id) ON DELETE SET NULL,
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'whatsapp_sent', 'call', 'note', 'stage_change', 'meeting', 'task'
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 10. TABELA DE CAMPANHAS DE PROSPECÇÃO (public.campaigns)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'prospeccao',
    status TEXT DEFAULT 'active',
    target_segment TEXT,
    leads_count INTEGER DEFAULT 0,
    responses_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 11. TABELA DE TESTES A/B (public.ab_tests)
CREATE TABLE IF NOT EXISTS public.ab_tests (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hypothesis TEXT,
    category TEXT,
    variant_a JSONB NOT NULL,
    variant_b JSONB NOT NULL,
    status TEXT DEFAULT 'draft',
    winner TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 12. TABELA DE CONFIGURAÇÕES E INTEGRAÇÕES DE IA (public.ai_integrations)
CREATE TABLE IF NOT EXISTS public.ai_integrations (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'google_gemini',
    api_key_set BOOLEAN DEFAULT false,
    model_version TEXT DEFAULT 'gemini-2.5-flash',
    prompt_tuning JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Garante o isolamento estrito de dados entre usuários autenticados
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_integrations ENABLE ROW LEVEL SECURITY;

-- Profiles: Usuário só lê e atualiza seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Macro policies para tabelas com user_id
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'companies', 'contacts', 'leads', 'services', 'scripts', 
            'objections', 'follow_ups', 'activities', 'campaigns', 
            'ab_tests', 'ai_integrations'
        ])
    LOOP
        EXECUTE format('
            CREATE POLICY "%1$s_user_isolation_select" ON public.%1$s FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "%1$s_user_isolation_insert" ON public.%1$s FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "%1$s_user_isolation_update" ON public.%1$s FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "%1$s_user_isolation_delete" ON public.%1$s FOR DELETE USING (auth.uid() = user_id);
        ', t);
    END LOOP;
END $$;

-- ==============================================================================
-- TRIGGER AUTOMÁTICO PARA CRIAR PERFIL NA INSCRIÇÃO DO AUTH (auth.users)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1), 'Usuário'),
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.profiles.name);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id ON public.follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
