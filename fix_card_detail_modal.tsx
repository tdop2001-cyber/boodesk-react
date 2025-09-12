// Correção para a função handleTagsChange no CardDetailModal
// Adicione este código no CardDetailModal.tsx

// Função para gerenciar tags do card (versão corrigida)
const handleTagsChange = async (newTags: string[]) => {
  try {
    console.log('=== HANDLE TAGS CHANGE ===');
    console.log('Card ID:', card.id);
    console.log('Card card_id:', card.card_id);
    console.log('Novas tags:', newTags);
    
    // Atualizar o estado local primeiro
    setCardTags(newTags);
    
    // Atualizar no banco de dados
    if (card.id) {
      try {
        console.log('Atualizando tags no banco de dados...');
        
        // Usar updateCardById em vez de updateCard
        const success = await db.updateCardById(card.id, { 
          tags: newTags,
          updated_at: new Date().toISOString()
        });
        
        console.log('Resultado da atualização:', success);
        
        if (!success) {
          throw new Error('Falha ao atualizar no banco de dados');
        }

        // Atualizar o card local
        const updatedCard = { ...editedCard, tags: newTags };
        setEditedCard(updatedCard);
        onSave(updatedCard);

        addToast({
          type: 'success',
          title: 'Tags atualizadas',
          message: 'Tags do card foram atualizadas com sucesso!'
        });
        
        console.log('Tags atualizadas com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar tags:', error);
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'Não foi possível atualizar as tags no banco de dados'
        });
        
        // Reverter o estado local em caso de erro
        setCardTags(card.tags || []);
        return;
      }
    } else {
      console.error('Card ID não encontrado');
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'ID do card não encontrado'
      });
    }
  } catch (error) {
    console.error('Erro geral ao gerenciar tags:', error);
    addToast({
      type: 'error',
      title: 'Erro',
      message: 'Não foi possível gerenciar as tags'
    });
  }
};

// Função para testar a persistência das tags
const testTagsPersistence = async () => {
  try {
    console.log('=== TESTE DE PERSISTÊNCIA DE TAGS ===');
    
    // Testar com tags de exemplo
    const testTags = ['API', 'Frontend', 'Teste'];
    
    console.log('Testando com tags:', testTags);
    
    if (card.id) {
      const success = await db.updateCardById(card.id, { 
        tags: testTags,
        updated_at: new Date().toISOString()
      });
      
      console.log('Resultado do teste:', success);
      
      if (success) {
        addToast({
          type: 'success',
          title: 'Teste realizado',
          message: 'Tags de teste foram salvas com sucesso!'
        });
        
        // Recarregar o card para verificar
        setTimeout(async () => {
          try {
            const { data, error } = await supabase
              .from('cards')
              .select('*')
              .eq('id', card.id)
              .single();
              
            if (error) {
              console.error('Erro ao recarregar card:', error);
            } else {
              console.log('Card recarregado:', data);
              console.log('Tags no banco:', data.tags);
            }
          } catch (error) {
            console.error('Erro ao recarregar:', error);
          }
        }, 1000);
      } else {
        addToast({
          type: 'error',
          title: 'Teste falhou',
          message: 'Não foi possível salvar as tags de teste'
        });
      }
    }
  } catch (error) {
    console.error('Erro no teste:', error);
    addToast({
      type: 'error',
      title: 'Erro no teste',
      message: 'Erro ao executar teste de persistência'
    });
  }
};
