# Actividad Reciente del Scout - Configuración

## Descripción
Sistema de registro de actividad en tiempo real para scouts que muestra:
- Reportes creados
- Jugadores añadidos/removidos de seguimiento
- Perfiles visualizados
- Actualizaciones de perfil

## Configuración de la Base de Datos

### 1. Ejecutar SQL en Supabase

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. Ve a la sección **SQL Editor**
3. Abre el archivo `database/create-activity-log.sql`
4. Copia todo el contenido y pégalo en el editor SQL
5. Haz clic en **Run** para ejecutar

Esto creará:
- ✅ Tabla `scout_activity` con todos los campos necesarios
- ✅ Índices para mejor rendimiento
- ✅ Políticas RLS (Row Level Security)
- ✅ Función `log_scout_activity()` para registrar actividades

### 2. Verificar la Creación

Ejecuta esta consulta para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'scout_activity';
```

## Funcionalidades Implementadas

### En `perfil-scout.html`

**Actividad Reciente (Vista Overview)**
- Muestra las últimas 3 actividades
- Se actualiza automáticamente
- Muestra "No hay actividad reciente" si no hay datos

**Timeline de Actividad (Pestaña Actividad Reciente)**
- Muestra hasta 20 actividades agrupadas por fecha
- Formato cronológico con fecha y hora
- Vista completa de toda la actividad del scout

### Registro Automático de Actividad

El sistema registra automáticamente:

1. **Actualización de Perfil** (`profile_updated`)
   - Se registra cuando el scout guarda cambios en "Información Personal"
   - Título: "Perfil actualizado"
   - Descripción: "Información personal y profesional actualizada"

2. **Creación de Reporte** (`report_created`)
   - Se registra cuando se crea un nuevo reporte
   - Incluye: nombre del jugador, posición, rating

3. **Añadir a Seguimiento** (`player_added_watchlist`)
   - Se registra al añadir jugador a la watchlist
   - Incluye: ID del jugador, nombre, posición

4. **Quitar de Seguimiento** (`player_removed_watchlist`)
   - Se registra al remover jugador de la watchlist
   - Incluye: ID del jugador, nombre, posición

5. **Visualización de Perfil** (`profile_viewed`)
   - Se registra al ver el perfil de un jugador
   - Incluye: ID del jugador, nombre, posición

## Funciones Disponibles

### JavaScript - `activity-logger.js`

```javascript
// Registrar actividad genérica
await logScoutActivity(activityType, title, options);

// Registrar reporte creado
await logReportCreated(playerName, playerPosition, rating);

// Registrar jugador añadido
await logPlayerAddedToWatchlist(playerId, playerName, playerPosition);

// Registrar jugador removido
await logPlayerRemovedFromWatchlist(playerId, playerName, playerPosition);

// Registrar perfil visualizado
await logPlayerProfileViewed(playerId, playerName, playerPosition);

// Registrar actualización de perfil
await logProfileUpdated();
```

## Integración en Otros Archivos

### Para registrar actividad en `lista-seguimiento.js`

Al añadir un jugador:
```javascript
async addToWatchlist(playerId) {
  // ... código existente ...
  
  // Registrar actividad
  if (window.logPlayerAddedToWatchlist) {
    await window.logPlayerAddedToWatchlist(
      playerId, 
      playerData.name, 
      playerData.position
    );
  }
}
```

Al remover un jugador:
```javascript
async removeFromWatchlist(playerId) {
  // ... código existente ...
  
  // Registrar actividad
  if (window.logPlayerRemovedFromWatchlist) {
    await window.logPlayerRemovedFromWatchlist(
      playerId,
      playerData.name,
      playerData.position
    );
  }
}
```

### Para registrar actividad en `nuevo-reporte.js`

Al crear un reporte:
```javascript
async submitReport(reportData) {
  // ... código existente ...
  
  // Registrar actividad
  if (window.logReportCreated) {
    await window.logReportCreated(
      reportData.playerName,
      reportData.position,
      reportData.overallRating
    );
  }
}
```

### Para registrar actividad en `perfil-jugador.js`

Al visualizar un perfil:
```javascript
async loadPlayerProfile(playerId) {
  // ... código existente para cargar el perfil ...
  
  // Registrar actividad
  if (window.logPlayerProfileViewed) {
    await window.logPlayerProfileViewed(
      playerId,
      playerData.name,
      playerData.position
    );
  }
}
```

## Archivos Modificados

1. ✅ `database/create-activity-log.sql` - Nueva tabla y funciones
2. ✅ `src/JS/activity-logger.js` - Utilidades para registrar actividad
3. ✅ `src/JS/perfil-scout.js` - Carga de actividad real desde Supabase
4. ✅ `public/CSS/perfil-scout.css` - Estilos para timeline agrupado
5. ✅ `public/perfil-scout.html` - Inclusión del script activity-logger

## Próximos Pasos

1. **Ejecutar el SQL** en Supabase (archivo: `database/create-activity-log.sql`)
2. **Incluir `activity-logger.js`** en las páginas donde se necesite:
   - `lista-seguimiento.html`
   - `nuevo-reporte.html`
   - `perfil-jugador.html`
   - `dashboard-scout.html`

3. **Agregar llamadas** a las funciones de registro en los eventos correspondientes

## Ejemplo de Uso Completo

```javascript
// En lista-seguimiento.js
async addToWatchlist(playerId) {
  try {
    // Obtener datos del jugador
    const { data: player } = await supabase
      .from('players')
      .select('name, position')
      .eq('id', playerId)
      .single();

    // Añadir a watchlist
    const { error } = await supabase
      .from('watchlist')
      .insert([{ 
        scout_id: userId, 
        player_id: playerId 
      }]);

    if (error) throw error;

    // Registrar actividad
    await window.logPlayerAddedToWatchlist(
      playerId,
      player.name,
      player.position
    );

    console.log('Jugador añadido y actividad registrada');
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Formato de Tiempo

El sistema muestra automáticamente:
- "Hace X minutos" (< 60 minutos)
- "Hace X horas" (< 24 horas)
- "Hace X días" (< 7 días)
- Fecha completa (> 7 días): "7 nov"

## Estructura de Datos

### Tabla `scout_activity`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| scout_id | UUID | ID del scout (FK a auth.users) |
| activity_type | VARCHAR(50) | Tipo de actividad |
| title | TEXT | Título visible |
| description | TEXT | Descripción detallada |
| related_player_id | UUID | ID del jugador relacionado (opcional) |
| related_player_name | TEXT | Nombre del jugador (opcional) |
| related_report_id | UUID | ID del reporte (opcional) |
| metadata | JSONB | Datos adicionales JSON (opcional) |
| created_at | TIMESTAMPTZ | Fecha y hora de creación |

## Soporte

Si tienes problemas:
1. Verifica que el SQL se ejecutó correctamente
2. Revisa la consola del navegador para errores
3. Verifica que RLS está habilitado en la tabla
4. Confirma que el usuario está autenticado
