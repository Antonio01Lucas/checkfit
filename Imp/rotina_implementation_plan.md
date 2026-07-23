# Criar Página "Minha Rotina" (Agendamentos e Hábitos)

A página "Minha Rotina" será responsável por gerenciar a tabela `routines` do banco de dados, permitindo que o usuário cadastre seus horários fixos para treinos, refeições, ingestão de água ou hábitos.

## Open Questions
- Você quer que esses "Hábitos/Rotinas" adicionados aqui enviem automaticamente convites ou criem blocos de tempo no seu **Google Calendar** também, ou apenas existam dentro do CheckFit por enquanto?
- Você aprova a mudança da rota de `/routine` para `/dashboard/routine` para reaproveitar a barra lateral (assim como fizemos em configurações)?

## Proposed Changes

### `src/components/layout/sidebar.tsx`
- Alterar o `href` de "Minha Rotina" para `/dashboard/routine` para manter a consistência de rotas aninhadas.

### `src/app/actions/scheduled-routines.ts`
#### [NEW] `src/app/actions/scheduled-routines.ts`
Criar Server Actions para interagir com a tabela `routines`:
- `getRoutines()`: Busca todos os hábitos agendados do usuário ordenados por horário.
- `createRoutine(data)`: Adiciona um novo hábito (ex: 08:00 - Café da manhã).
- `deleteRoutine(id)`: Remove um hábito.
- `toggleRoutineActive(id, isActive)`: Ativa ou desativa um hábito temporariamente sem precisar deletar.

### `src/app/dashboard/routine/page.tsx`
#### [NEW] `src/app/dashboard/routine/page.tsx`
Página (Server Component) que:
- Busca o `profile` do usuário (para passar para o Header).
- Busca as rotinas usando `getRoutines()`.
- Envolve o layout com a `<Sidebar />` e `<Header />` (assim como em Configurações).

### `src/app/dashboard/routine/routine-client.tsx`
#### [NEW] `src/app/dashboard/routine/routine-client.tsx`
Client Component responsável pelo visual e interatividade:
- Lista de rotinas estilizada por categoria (ícones de comida, água, treino).
- Botão switch (toggle) para ativar/desativar uma rotina.
- Modal ou formulário inline para "Adicionar novo hábito" com inputs para Título, Horário, Categoria e Descrição.
- Otimização usando `useTransition` para atualizações de UI em tempo real.

## Verification Plan
1. Acessar `/dashboard/routine` pelo menu lateral.
2. Adicionar um novo hábito "Treino de Pernas" às 18:00.
3. Desativar/Ativar e Excluir um hábito e observar se a mudança reflete no Supabase em tempo real.
