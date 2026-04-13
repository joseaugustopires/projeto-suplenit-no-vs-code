-- ============================================================================
-- CORREÇÃO DO ESQUEMA DE BANCO DE DADOS (SUPABASE)
-- Este script ajusta os tipos de dados para UUID e cria as colunas necessárias
-- para o funcionamento do código 'index.html'.
-- ============================================================================

-- 1. Limpeza (Opcional - CUIDADO: Apaga dados existentes nessas tabelas)
-- Execute apenas se estiver em ambiente de desenvolvimento/teste.
-- Usamos DROP TABLE... CASCADE para remover quaisquer dependências ocultas (como 'receitas')
DROP TABLE IF EXISTS nutri_ratings CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS itens_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS products CASCADE; -- Ajustado para 'products'
DROP TABLE IF EXISTS nutricionistas CASCADE;
DROP TABLE IF EXISTS vendedores CASCADE;
DROP TABLE IF EXISTS compradores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE; -- Tabela antiga não utilizada pelo Auth
-- Adicionando a tabela 'receitas' mencionada no erro
DROP TABLE IF EXISTS receitas CASCADE;
-- Tabela 'produtos' pode ter sido o nome original
DROP TABLE IF EXISTS produtos CASCADE; 

-- 2. Recriação das Tabelas de Perfil com UUID
-- O 'id_usuario' agora é UUID e referencia a tabela interna 'auth.users'

CREATE TABLE compradores (
    id_usuario UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    telefone TEXT,
    -- Campos extras podem ser adicionados aqui se decidir persistir no banco futuramente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE compradores ADD COLUMN idade INT;
ALTER TABLE compradores ADD COLUMN peso DECIMAL(5, 2);
ALTER TABLE compradores ADD COLUMN altura DECIMAL(5, 2);

CREATE TABLE vendedores (
    id_usuario UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_loja TEXT,
    descricao_loja TEXT,
    cnpj_cpf TEXT,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Adiciona colunas de localidade e tipo de pessoa à tabela de vendedores
ALTER TABLE vendedores ADD COLUMN tipo_pessoa TEXT; -- 'PF' ou 'PJ'
ALTER TABLE vendedores ADD COLUMN cidade TEXT;
ALTER TABLE vendedores ADD COLUMN estado TEXT;

-- Nota: A tabela já possuía 'cnpj_cpf', vamos usá-la para guardar o CPF ou CNPJ.
-- Nota: A tabela já possuía 'nome_loja', usaremos ela para 'Nome' (PF) ou 'Nome Fantasia' (PJ).

CREATE TABLE nutricionistas (
    id_usuario UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    crn TEXT,
    especialidade TEXT,
    telefone TEXT,
    aprovado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Produtos (Atualizada para usar UUID no dono)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT, -- Nome da coluna alterado de "desc" para "description"
    price DECIMAL(10, 2),
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE products ADD COLUMN stock INT DEFAULT 0;

-- 4. Tabela de Recomendações (Nutricionista -> Comprador)
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    buyer_id UUID REFERENCES compradores(id_usuario) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    nutritionist_id UUID REFERENCES nutricionistas(id_usuario) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela de Avaliações (Comprador -> Nutricionista)
CREATE TABLE nutri_ratings (
    id SERIAL PRIMARY KEY,
    nutri_id UUID REFERENCES nutricionistas(id_usuario) ON DELETE CASCADE,
    buyer_id UUID REFERENCES compradores(id_usuario) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(nutri_id, buyer_id) -- Impede múltiplas avaliações do mesmo par
);


-- 6. Configurar Políticas de Segurança (RLS) Básicas
-- Necessário para permitir inserts públicos via API (no cadastro)
ALTER TABLE compradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutricionistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutri_ratings ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para teste (Em produção, restrinja melhor)
CREATE POLICY "Acesso público compradores" ON compradores FOR ALL USING (true);
CREATE POLICY "Acesso público vendedores" ON vendedores FOR ALL USING (true);
CREATE POLICY "Acesso público nutricionistas" ON nutricionistas FOR ALL USING (true);
CREATE POLICY "Acesso público produtos" ON products FOR ALL USING (true);
CREATE POLICY "Acesso público recommendations" ON recommendations FOR ALL USING (true);
CREATE POLICY "Acesso público ratings" ON nutri_ratings FOR ALL USING (true);