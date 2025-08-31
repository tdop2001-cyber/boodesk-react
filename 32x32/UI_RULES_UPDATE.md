
## 🎨 PADRÕES DE INTERFACE - TELAS DE CONFIGURAÇÃO

### ✅ SEMPRE USAR
1. **Layout**: `pack()` em vez de `grid()` para telas de configuração
2. **Container**: Frame principal com `pack(fill='both', expand=True, padx=20, pady=20)`
3. **Seções**: `LabelFrame` para agrupar configurações relacionadas
4. **Espaçamento**: `pady=(0, 15)` entre seções, `pady=(20, 0)` antes de botões
5. **Botões**: Sempre no final, alinhados à direita com `pack(side='right')`
6. **Estilo**: Usar `Accent.TButton` para botões principais

### 📋 ESTRUTURA PADRÃO
```python
def create_tab_name(self):
    frame = self.tab_name
    
    # Container principal
    main_container = ttk.Frame(frame)
    main_container.pack(fill='both', expand=True, padx=20, pady=20)
    
    # Seção 1
    section1_frame = ttk.LabelFrame(main_container, text="Título da Seção", padding=10)
    section1_frame.pack(fill='x', pady=(0, 15))
    
    # Widgets da seção...
    
    # Seção 2
    section2_frame = ttk.LabelFrame(main_container, text="Outra Seção", padding=10)
    section2_frame.pack(fill='x', pady=(0, 15))
    
    # Widgets da seção...
    
    # Botão de atualizar
    button_frame = ttk.Frame(main_container)
    button_frame.pack(fill='x', pady=(20, 0))
    
    ttk.Button(button_frame, text="Atualizar", command=self.save_settings, 
               style='Accent.TButton').pack(side='right')
```

### 🔧 CONFIGURAÇÕES JSON
1. **Função auxiliar**: Sempre usar `_get_safe_dict_setting()` para configurações JSON
2. **Tratamento**: Converter strings JSON para dicionários automaticamente
3. **Fallback**: Valores padrão em caso de erro na deserialização
4. **Salvamento**: Sempre salvar dicionários completos, não strings

### 🎯 REGRAS OBRIGATÓRIAS
- ❌ NUNCA usar `grid()` em telas de configuração
- ❌ NUNCA acessar `self.app.settings["key"].items()` diretamente
- ✅ SEMPRE usar `pack()` para layout
- ✅ SEMPRE usar `_get_safe_dict_setting()` para JSON
- ✅ SEMPRE incluir botão "Atualizar" no final
- ✅ SEMPRE usar `LabelFrame` para organizar seções
