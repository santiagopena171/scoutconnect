-- ============================================
-- FUNCTION: get_conversation_contacts
-- Permite obtener los perfiles de los participantes de una conversación
-- asegurando que el usuario autenticado forme parte de la misma.
-- ============================================

create or replace function public.get_conversation_contacts(conversation_id uuid)
returns setof public.profiles
language sql
security definer
set search_path = public
as $$
  select p.*
  from public.conversation_participants cp
  join public.profiles p on p.id = cp.user_id
  where cp.conversation_id = get_conversation_contacts.conversation_id
    and exists (
      select 1
      from public.conversation_participants cp_self
      where cp_self.conversation_id = get_conversation_contacts.conversation_id
        and cp_self.user_id = auth.uid()
    );
$$;

revoke all on function public.get_conversation_contacts(uuid) from public;
grant execute on function public.get_conversation_contacts(uuid) to authenticated;
