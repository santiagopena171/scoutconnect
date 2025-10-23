-- ============================================
-- FUNCTION: get_or_create_direct_conversation
-- Devuelve la conversación directa entre el usuario actual y target_user_id.
-- Si no existe, la crea de forma atómica colocando a ambos como participantes.
-- ============================================

create or replace function public.get_or_create_direct_conversation(target_user_id uuid)
returns public.conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_conversation public.conversations;
  created_conversation public.conversations;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if target_user_id is null then
    raise exception 'Target user required';
  end if;

  if current_user_id = target_user_id then
    raise exception 'Cannot create direct conversation with yourself';
  end if;

  select c.*
    into existing_conversation
    from public.conversations c
    join (
      select conversation_id
      from public.conversation_participants
      where user_id in (current_user_id, target_user_id)
      group by conversation_id
      having count(distinct user_id) = 2
    ) pairs on pairs.conversation_id = c.id
   where c.is_group = false
   order by c.created_at asc
   limit 1;

  if existing_conversation.id is not null then
    return existing_conversation;
  end if;

  insert into public.conversations (is_group, created_by)
  values (false, current_user_id)
  returning * into created_conversation;

  insert into public.conversation_participants (conversation_id, user_id, role_in_conversation)
  values
    (created_conversation.id, current_user_id, 'owner'),
    (created_conversation.id, target_user_id, 'member');

  return created_conversation;
end;
$$;

revoke all on function public.get_or_create_direct_conversation(uuid) from public;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;
