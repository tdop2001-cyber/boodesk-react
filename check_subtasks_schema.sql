-- Verificar estrutura atual da tabela subtasks
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks' 
ORDER BY ordinal_position;

-- Verificar se a coluna completed existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'subtasks' AND column_name = 'completed'
        ) 
        THEN 'Coluna completed EXISTE' 
        ELSE 'Coluna completed NÃO EXISTE' 
    END as status_completed;

-- Verificar se a coluna completed_at existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'subtasks' AND column_name = 'completed_at'
        ) 
        THEN 'Coluna completed_at EXISTE' 
        ELSE 'Coluna completed_at NÃO EXISTE' 
    END as status_completed_at;


