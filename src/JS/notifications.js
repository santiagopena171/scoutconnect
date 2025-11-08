// ===== NOTIFICATIONS MODULE - JAVASCRIPT =====
// Proporciona utilidades para crear, listar y suscribirse a notificaciones
// Requiere Supabase cargado (initSupabase) y autenticación activa

(function () {
  const Notifications = (() => {
    let currentUser = null;
    let channel = null;
    let cache = [];
    let onNewCallback = null;

    function ensureSupabase() {
      if (typeof window.supabase === 'undefined' || window.supabase === null) {
        if (typeof window.initSupabase === 'function') {
          window.initSupabase();
        }
      }
      return typeof window.supabase !== 'undefined' && window.supabase !== null;
    }

    async function init({ onNew } = {}) {
      if (!ensureSupabase()) {
        console.warn('Notifications: Supabase no disponible');
        return;
      }
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
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
      if (!currentUser) return [];
      const { data, error } = await supabase
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
      if (!currentUser) return;
      let query = supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', currentUser.id);
      const { error } = id ? await query.eq('id', id) : await query.is('read_at', null);
      if (error) {
        console.warn('Notifications: markAsRead error', error);
      }
    }

    async function create({ userId, type, title, body, link = null, metadata = {} }) {
      if (!ensureSupabase()) {
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
      
      const { data, error } = await supabase
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
      if (!currentUser) return;
      try {
        if (channel) supabase.removeChannel(channel);
        channel = supabase
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

