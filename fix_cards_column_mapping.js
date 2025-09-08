/**
 * Script para corrigir o mapeamento de cartões e colunas
 * 
 * PROBLEMA IDENTIFICADO:
 * - Os cartões estão sendo salvos com 'list_name' no banco
 * - O frontend espera 'column_id' para filtrar os cartões
 * - O mapeamento entre list_name e column_id não está funcionando corretamente
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Função principal para corrigir o mapeamento
 */
async function fixCardsColumnMapping() {
    console.log('🔧 Iniciando correção do mapeamento de cartões e colunas...');
    
    try {
        // 1. Buscar todos os boards
        const boards = await getBoards();
        console.log(`📋 Encontrados ${boards.length} boards`);
        
        for (const board of boards) {
            console.log(`\n🔍 Processando board: ${board.name} (ID: ${board.board_id})`);
            
            // 2. Buscar colunas do board
            const columns = await getColumnsForBoard(board.board_id);
            console.log(`📝 Encontradas ${columns.length} colunas`);
            
            // 3. Buscar cartões do board
            const cards = await getCardsForBoard(board.board_id);
            console.log(`🃏 Encontrados ${cards.length} cartões`);
            
            // 4. Corrigir mapeamento dos cartões
            await fixCardsMapping(board, columns, cards);
        }
        
        console.log('\n✅ Correção concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
    }
}

/**
 * Buscar todos os boards
 */
async function getBoards() {
    const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at');
    
    if (error) throw error;
    return data || [];
}

/**
 * Buscar colunas de um board
 */
async function getColumnsForBoard(boardId) {
    const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position');
    
    if (error) throw error;
    return data || [];
}

/**
 * Buscar cartões de um board
 */
async function getCardsForBoard(boardId) {
    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', boardId)
        .eq('is_archived', false)
        .order('created_at');
    
    if (error) throw error;
    return data || [];
}

/**
 * Corrigir mapeamento dos cartões
 */
async function fixCardsMapping(board, columns, cards) {
    console.log(`\n🔧 Corrigindo mapeamento para board: ${board.name}`);
    
    // Criar mapa de list_name para column_id
    const listNameToColumnId = {};
    columns.forEach(column => {
        listNameToColumnId[column.name] = column.id;
    });
    
    console.log('📋 Mapeamento de colunas:', listNameToColumnId);
    
    // Processar cada cartão
    for (const card of cards) {
        const expectedColumnId = listNameToColumnId[card.list_name];
        
        if (!expectedColumnId) {
            console.warn(`⚠️ Cartão "${card.title}" tem list_name "${card.list_name}" que não corresponde a nenhuma coluna`);
            
            // Tentar mapear para uma coluna padrão
            const defaultColumnId = getDefaultColumnId(card.list_name, columns);
            if (defaultColumnId) {
                console.log(`🔄 Mapeando para coluna padrão: ${defaultColumnId}`);
                await updateCardColumn(card.id, defaultColumnId);
            }
        } else {
            console.log(`✅ Cartão "${card.title}" já está mapeado corretamente para coluna ${expectedColumnId}`);
        }
    }
}

/**
 * Obter ID da coluna padrão baseado no list_name
 */
function getDefaultColumnId(listName, columns) {
    // Mapear nomes comuns para colunas padrão
    const mapping = {
        'A Fazer': 'A Fazer',
        'To Do': 'A Fazer',
        'Pendente': 'A Fazer',
        'Backlog': 'A Fazer',
        
        'Em Progresso': 'Em Progresso',
        'In Progress': 'Em Progresso',
        'Em Andamento': 'Em Progresso',
        'Desenvolvimento': 'Em Progresso',
        
        'Concluído': 'Concluído',
        'Done': 'Concluído',
        'Finalizado': 'Concluído',
        'Completo': 'Concluído'
    };
    
    const targetColumnName = mapping[listName] || 'A Fazer';
    const column = columns.find(col => col.name === targetColumnName);
    
    return column ? column.id : null;
}

/**
 * Atualizar coluna de um cartão
 */
async function updateCardColumn(cardId, columnId) {
    try {
        const { error } = await supabase
            .from('cards')
            .update({ 
                column_id: columnId,
                updated_at: new Date().toISOString()
            })
            .eq('id', cardId);
        
        if (error) throw error;
        
        console.log(`✅ Cartão ${cardId} atualizado para coluna ${columnId}`);
        
    } catch (error) {
        console.error(`❌ Erro ao atualizar cartão ${cardId}:`, error);
    }
}

/**
 * Criar colunas padrão para um board se não existirem
 */
async function createDefaultColumns(boardId) {
    console.log(`📝 Criando colunas padrão para board ${boardId}`);
    
    const defaultColumns = [
        { list_id: `list-${Date.now()}-1`, board_id: boardId, name: 'A Fazer', position: 1 },
        { list_id: `list-${Date.now()}-2`, board_id: boardId, name: 'Em Progresso', position: 2 },
        { list_id: `list-${Date.now()}-3`, board_id: boardId, name: 'Concluído', position: 3 }
    ];
    
    const { error } = await supabase
        .from('lists')
        .insert(defaultColumns);
    
    if (error) throw error;
    
    console.log('✅ Colunas padrão criadas');
}

/**
 * Verificar se um board tem colunas
 */
async function ensureBoardHasColumns(boardId) {
    const columns = await getColumnsForBoard(boardId);
    
    if (columns.length === 0) {
        console.log(`⚠️ Board ${boardId} não tem colunas, criando colunas padrão...`);
        await createDefaultColumns(boardId);
    }
}

/**
 * Função para executar diagnóstico completo
 */
async function runDiagnostic() {
    console.log('🔍 Executando diagnóstico completo...');
    
    const boards = await getBoards();
    let totalProblems = 0;
    
    for (const board of boards) {
        console.log(`\n📋 Analisando board: ${board.name}`);
        
        // Verificar se tem colunas
        const columns = await getColumnsForBoard(board.board_id);
        if (columns.length === 0) {
            console.log('❌ Board sem colunas');
            totalProblems++;
        }
        
        // Verificar cartões
        const cards = await getCardsForBoard(board.board_id);
        const unmappedCards = cards.filter(card => {
            const column = columns.find(col => col.name === card.list_name);
            return !column;
        });
        
        if (unmappedCards.length > 0) {
            console.log(`❌ ${unmappedCards.length} cartões sem mapeamento de coluna`);
            totalProblems += unmappedCards.length;
        }
        
        console.log(`✅ Board analisado: ${columns.length} colunas, ${cards.length} cartões`);
    }
    
    console.log(`\n📊 Diagnóstico concluído: ${totalProblems} problemas encontrados`);
    return totalProblems;
}

// Exportar funções para uso
export {
    fixCardsColumnMapping,
    runDiagnostic,
    ensureBoardHasColumns,
    createDefaultColumns
};

// Executar automaticamente se chamado diretamente
if (typeof window === 'undefined') {
    // Executar no Node.js
    fixCardsColumnMapping().catch(console.error);
}

