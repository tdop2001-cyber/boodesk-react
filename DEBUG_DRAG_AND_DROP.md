# 🐛 Debug: Drag and Drop não está funcionando

## 🚨 **Problema Identificado**
O usuário não consegue arrastar as subtarefas entre as colunas do Kanban.

## 🔍 **Análise do Código**

### **1. Dependências Instaladas ✅**
- `@dnd-kit/core`: ^6.3.1
- `@dnd-kit/sortable`: ^10.0.0  
- `@dnd-kit/utilities`: ^3.2.2

### **2. Implementação Técnica ✅**
- `DndContext` configurado corretamente
- `useSensors` com `PointerSensor`
- `SortableContext` para cada coluna
- `useSortable` para cada item
- `handleDragStart` e `handleDragEnd` implementados

### **3. Possíveis Problemas**

#### **A) Configuração dos Sensores**
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Pode ser muito alto
    },
  })
);
```

#### **B) IDs das Subtarefas**
```typescript
// Verificar se os IDs estão sendo passados corretamente
items={getSubtasksByColumn(column.id).filter(s => s != null).map(s => (s.id || '').toString())}
```

#### **C) Área de Drop**
```typescript
// Verificar se a área de drop está sendo reconhecida
<div className="flex-1 min-h-[400px] p-4 rounded-b-2xl bg-gradient-to-b from-slate-50 to-white border-l-4 border-r-4 border-b-4 border-slate-200 shadow-sm">
```

## 🧪 **Testes para Identificar o Problema**

### **1. Verificar Console do Navegador**
- Abra F12 → Console
- Procure por erros relacionados ao drag and drop
- Verifique se há logs de `handleDragStart` e `handleDragEnd`

### **2. Testar Sensores**
- Reduzir `distance` de 8 para 3
- Adicionar `MouseSensor` como fallback
- Verificar se `activationConstraint` está funcionando

### **3. Verificar IDs**
- Confirmar que `subtask.id` não é `undefined`
- Verificar se `getSubtasksByColumn` retorna dados válidos
- Confirmar que `SortableContext` recebe IDs válidos

### **4. Testar Área de Drop**
- Verificar se as colunas têm `id` único
- Confirmar que `over.id` está sendo capturado
- Testar se `handleDragEnd` está sendo chamado

## 🔧 **Soluções Possíveis**

### **Solução 1: Reduzir Distância de Ativação**
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3, // Reduzir de 8 para 3
    },
  })
);
```

### **Solução 2: Adicionar MouseSensor como Fallback**
```typescript
import { MouseSensor } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3,
    },
  }),
  useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  })
);
```

### **Solução 3: Simplificar Ativação**
```typescript
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(MouseSensor)
);
```

### **Solução 4: Verificar IDs das Colunas**
```typescript
// Garantir que as colunas tenham IDs únicos
<div 
  id={column.id} // Verificar se este ID está sendo usado
  className={`${column.bgColor} ${column.color} p-4 rounded-t-2xl border-4 ${column.borderColor} shadow-sm`}
>
```

## 📋 **Checklist de Debug**

- [ ] **Console aberto** e sem erros
- [ ] **Logs de drag** aparecem no console
- [ ] **IDs das subtarefas** são válidos
- [ ] **IDs das colunas** são únicos
- [ ] **Sensores** estão configurados corretamente
- [ ] **Área de drop** está sendo reconhecida
- [ ] **handleDragEnd** está sendo chamado

## 🎯 **Próximos Passos**

1. **Testar com distância reduzida** (3 em vez de 8)
2. **Adicionar logs** para `handleDragStart` e `handleDragEnd`
3. **Verificar IDs** das subtarefas e colunas
4. **Simplificar sensores** removendo constraints
5. **Testar em diferentes navegadores**

---

**🐛 Use este guia para identificar e resolver o problema do drag and drop!**
