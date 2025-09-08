# 🧪 Teste da Funcionalidade Kanban para Subtarefas

## 🚀 **Como Testar**

### **1. Acesse a Página**
- Vá para a página "Minhas Atividades"
- Certifique-se de que há atividades com subtarefas

### **2. Expanda uma Atividade**
- Clique na **seta** ao lado de uma atividade que tenha subtarefas
- As subtarefas devem aparecer expandidas

### **3. Localize o Toggle**
- No header das subtarefas, você verá:
  - **"Lista"** (botão vermelho ativo)
  - **"Kanban"** (botão cinza)
  - **"🐛"** (botão azul de debug)

### **4. Teste o Toggle Normal**
- Clique no botão **"Kanban"**
- O fundo deve mudar de vermelho para **azul**
- O badge "Kanban" deve aparecer
- As subtarefas devem ser renderizadas em **colunas Kanban**

### **5. Teste o Botão de Debug**
- Se o toggle normal não funcionar, clique no botão **"🐛"**
- Isso força o modo Kanban diretamente
- Verifique o console do navegador para logs

## 🔍 **O que Verificar**

### **Console do Navegador**
- Abra as **Ferramentas do Desenvolvedor** (F12)
- Vá para a aba **Console**
- Você deve ver logs como:
  ```
  Toggle subtask view mode: { itemId: "123", currentMode: "list", newMode: "kanban" }
  Novos modos: { "123": "kanban" }
  Estado atual de subtaskViewModes: { "123": "kanban" }
  Renderizando atividade 123 em modo: kanban
  ```

### **Mudanças Visuais**
- **Fundo**: De vermelho/verde para azul
- **Badge**: "Kanban" deve aparecer
- **Conteúdo**: Lista → Colunas Kanban

### **Componente Kanban**
- **3 colunas**: "A Fazer", "Em Progresso", "Concluído"
- **Subtarefas** distribuídas nas colunas
- **Drag & Drop** funcional

## 🐛 **Solução de Problemas**

### **Se o Toggle não Funcionar**
1. **Verifique o console** para erros
2. **Use o botão de debug** 🐛
3. **Recarregue a página** e tente novamente

### **Se o Kanban não Aparecer**
1. **Verifique se há subtarefas** na atividade
2. **Confirme que o estado mudou** no console
3. **Verifique se o componente SubtaskKanban** está sendo renderizado

### **Se Houver Erros de Compilação**
1. **Execute `npm run build`** para ver erros
2. **Verifique os tipos** das interfaces
3. **Confirme as importações** dos componentes

## 📱 **Teste em Diferentes Dispositivos**

### **Desktop**
- **Mouse**: Clique nos botões
- **Drag & Drop**: Arraste subtarefas entre colunas

### **Mobile**
- **Touch**: Toque nos botões
- **Touch Drag**: Arraste com o dedo

## ✅ **Checklist de Teste**

- [ ] **Toggle aparece** na interface
- [ ] **Botão Lista** está ativo por padrão
- [ ] **Botão Kanban** responde ao clique
- [ ] **Estado muda** no console
- [ ] **Fundo muda** de cor
- [ ] **Badge "Kanban"** aparece
- [ ] **Componente Kanban** é renderizado
- [ ] **Colunas aparecem** corretamente
- [ ] **Subtarefas são exibidas** nas colunas
- [ ] **Drag & Drop** funciona
- [ ] **Preferências são salvas** no localStorage

## 🎯 **Resultado Esperado**

Após clicar em "Kanban":
1. **Interface muda** visualmente
2. **Subtarefas aparecem** em colunas Kanban
3. **Funcionalidade completa** de drag & drop
4. **Preferência salva** para próxima visita

---

**🧪 Teste e reporte qualquer problema encontrado!**
