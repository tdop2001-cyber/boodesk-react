-- =====================================================
-- CRIAR TIPOS ENUMERADOS PARA POSTGRESQL
-- =====================================================

-- Tipo para roles de usuário
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');

-- Tipo para roles de board
CREATE TYPE board_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Tipo para importância de cards
CREATE TYPE card_importance AS ENUM ('Crítica', 'Alta', 'Normal', 'Baixa');

-- Tipo para recorrência de cards
CREATE TYPE card_recurrence AS ENUM ('Nenhuma', 'Diariamente', 'Semanalmente', 'Mensalmente', 'Anualmente');

-- Tipo para status de tarefas pomodoro
CREATE TYPE pomodoro_status AS ENUM ('Pendente', 'Em Progresso', 'Concluída', 'Cancelada');

-- Tipo para tipos de assunto
CREATE TYPE subject_type AS ENUM ('pomodoro', 'boodesk', 'unified');

-- Tipo para tipos de transação
CREATE TYPE transaction_type AS ENUM ('Entrada', 'Saída');

-- Tipo para tipos de categoria financeira
CREATE TYPE finance_type AS ENUM ('income', 'expense', 'both');

-- Tipo para plataformas de reunião
CREATE TYPE meeting_platform AS ENUM ('zoom', 'teams', 'google_meet');

-- Tipo para status de reunião
CREATE TYPE meeting_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');

-- Tipo para roles de participante
CREATE TYPE participant_role AS ENUM ('organizer', 'participant');
