// ===== NOTIFICATIONS MODULE - JAVASCRIPT =====
// Proporciona utilidades para crear, listar y suscribirse a notificaciones
// Requiere Supabase cargado (initSupabase) y autenticación activa

(function () {
  const Notifications = (() => {
    let currentUser = null;
    let channel = null;
    let cache = [];
    let onNewCallback = null;
    let supabaseClient = null;

    async function ensureSupabase() {
      if (supabaseClient !== null) {
        return supabaseClient;
      }

      try {
        if (typeof getSupabaseClient === 'function') {
          supabaseClient = await getSupabaseClient();
        } else if (typeof initSupabase === 'function') {
          supabaseClient = await initSupabase();
        } else if (typeof window.supabase !== 'undefined' && window.supabase !== null) {
          supabaseClient = window.supabase;
        } else {
          throw new Error('Supabase no disponible');
        }
        return supabaseClient;
      } catch (error) {
        console.warn('Notifications: Error inicializando Supabase:', error);
        return null;
      }
    }

    async function init({ onNew } = {}) {
      const client = await ensureSupabase();
      if (!client) {
        console.warn('Notifications: Supabase no disponible');
        return;
      }
      try {
        const { data: { user }, error } = await client.auth.getUser();
        if (error || !user) {
          console.warn('Notifications: no hay usuario autenticado');
          return;
        }
        currentUser = user;
        onNewCallback = typeof onNew === 'function' ? onNew : null;
        await fetchLatest();
        subscribe();
      } catch (e) {
        console.warn('Notifications: init error', e);
      }
    }

    async function fetchLatest(limit = 20) {
      if (!currentUser || !supabaseClient) return [];
      const { data, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.warn('Notifications: fetch error', error);
        return [];
      }
      cache = Array.isArray(data) ? data : [];
      return cache;
    }

    async function markAsRead(id = null) {
      if (!currentUser || !supabaseClient) return;
      let query = supabaseClient
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', currentUser.id);
      const { error } = id ? await query.eq('id', id) : await query.is('read_at', null);
      if (error) {
        console.warn('Notifications: markAsRead error', error);
      }
    }

    async function create({ userId, type, title, body, link = null, metadata = {} }) {
      const client = await ensureSupabase();
      if (!client) {
        console.warn('❌ Supabase no disponible para crear notificación');
        return null;
      }
      
      console.log('📤 Intentando crear notificación:', { userId, type, title, body });
      
      const payload = {
        user_id: userId,
        type: type || 'general',
        title: title || null,
        body: body || null,
        link: link || null,
        metadata: metadata || null
      };
      
      console.log('📦 Payload a insertar:', payload);
      
      const { data, error } = await client
        .from('notifications')
        .insert([payload])
        .select()
        .single();
        
      if (error) {
        console.error('❌ Notifications: create error', error);
        console.error('📋 Detalles:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }
      
      console.log('✅ Notificación creada exitosamente:', data);
      return data;
    }

    function subscribe() {
      if (!currentUser || !supabaseClient) return;
      try {
        if (channel) supabaseClient.removeChannel(channel);
        channel = supabaseClient
          .channel('notifications_realtime')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUser.id}`
          }, (payload) => {
            const n = payload && payload.new ? payload.new : null;
            if (n) {
              cache.unshift(n);
              if (onNewCallback) onNewCallback(n);
            }
          })
          .subscribe();
      } catch (e) {
        console.warn('Notifications: subscribe error', e);
      }
    }

    function getCache() {
      return cache.slice();
    }

    return { init, fetchLatest, markAsRead, create, getCache };
  })();

  window.Notifications = Notifications;
})();

