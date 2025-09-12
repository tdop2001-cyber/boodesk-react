// Script para debugar a função updateCardById
// Adicione este código no arquivo database.ts para debug

// Versão corrigida da função updateCardById com logs detalhados
async updateCardById(id: number, updates: Partial<Card>): Promise<boolean> {
  console.log('=== DATABASE: updateCardById ===');
  console.log('id:', id);
  console.log('updates:', updates);
  console.log('updates.tags:', updates.tags);
  console.log('Tipo de updates.tags:', typeof updates.tags);
  console.log('JSON.stringify(updates):', JSON.stringify(updates));
  
  try {
    // Verificar se o card existe
    const { data: existingCard, error: fetchError } = await supabase
      .from('cards')
      .select('id, title, tags')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar card existente:', fetchError);
      return false;
    }

    console.log('Card existente:', existingCard);
    console.log('Tags atuais:', existingCard.tags);

    // Preparar updates para o Supabase
    const mappedUpdates: any = {};
    
    if (updates.title !== undefined) mappedUpdates.title = updates.title;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.priority !== undefined) mappedUpdates.priority = updates.priority;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.due_date !== undefined) mappedUpdates.due_date = updates.due_date;
    if (updates.importance !== undefined) mappedUpdates.importance = updates.importance;
    if (updates.category !== undefined) mappedUpdates.category = updates.category;
    if (updates.estimated_time !== undefined) mappedUpdates.estimated_time = updates.estimated_time;
    
    // Tratamento especial para tags
    if (updates.tags !== undefined) {
      console.log('Processando tags:', updates.tags);
      if (Array.isArray(updates.tags)) {
        mappedUpdates.tags = updates.tags;
        console.log('Tags mapeadas como array:', mappedUpdates.tags);
      } else {
        console.log('Tags não são array, ignorando');
      }
    }
    
    if (updates.updated_at !== undefined) mappedUpdates.updated_at = updates.updated_at;

    console.log('Updates mapeados:', mappedUpdates);

    const { data, error } = await supabase
      .from('cards')
      .update(mappedUpdates)
      .eq('id', id)
      .select();

    console.log('updateCardById - data:', data);
    console.log('updateCardById - error:', error);
    
    if (error) {
      console.error('Erro detalhado do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    if (data && data.length > 0) {
      console.log('Card atualizado com sucesso:', data[0]);
      return true;
    } else {
      console.error('Nenhum card foi atualizado');
      return false;
    }
  } catch (error) {
    console.error('Erro ao atualizar card por ID:', error);
    return false;
  }
}

// Função para testar a atualização de tags especificamente
async testUpdateTags(cardId: number, tags: string[]): Promise<boolean> {
  console.log('=== TESTE: Atualização de Tags ===');
  console.log('Card ID:', cardId);
  console.log('Tags:', tags);
  
  try {
    const { data, error } = await supabase
      .from('cards')
      .update({ 
        tags: tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select();

    console.log('Resultado do teste:', { data, error });
    
    if (error) {
      console.error('Erro no teste:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('Teste bem-sucedido:', data[0]);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro no teste:', error);
    return false;
  }
}
