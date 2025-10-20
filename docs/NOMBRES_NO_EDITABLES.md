# ACTUALIZACIÓN: Campos First Name y Last Name

## 📋 Objetivo
Agregar campos separados `first_name` y `last_name` a la tabla `profiles` para que los usuarios no puedan modificar su nombre y apellido después del registro.

## 🗄️ Cambios en Base de Datos

### 1. Ejecutar script SQL en Supabase

Ve a **SQL Editor** en tu proyecto de Supabase y ejecuta el archivo:
```
database/supabase-add-names.sql
```

Este script:
- ✅ Agrega columnas `first_name` y `last_name` a la tabla `profiles`
- ✅ Migra datos existentes de `full_name` a los nuevos campos
- ✅ Actualiza el trigger `handle_new_user()` para incluir los nuevos campos
- ✅ Crea índices para mejorar el rendimiento

### 2. Verificar los cambios

Después de ejecutar el script, verifica en **Table Editor → profiles**:

```sql
SELECT id, email, first_name, last_name, full_name 
FROM profiles 
LIMIT 5;
```

Deberías ver que los nombres se separaron correctamente.

## 💻 Cambios en el Código

### Archivos modificados:

1. **JS/registro.js**
   - Ahora envía `first_name` y `last_name` al registrarse
   - Mantiene `full_name` para compatibilidad

2. **JS/login.js**
   - Incluye `first_name` y `last_name` al crear perfil de fallback

3. **perfil-scout.html**
   - Campos separados: "Nombre" y "Apellido"
   - Ambos campos son `readonly` (no editables)
   - Email también es `readonly`

4. **perfil-jugador.html** (Solo visualización)
   - Muestra "Nombre" y "Apellido" por separado
   - Obtiene datos de `first_name` y `last_name`

5. **CSS/perfil-scout.css**
   - Estilos para campos `readonly` (fondo gris claro)
   - Textos de ayuda `.text-muted`

6. **CSS/perfil-jugador.css**
   - Estilos para campos `readonly` (mismo patrón)

7. **JS/perfil-scout.js**
   - Carga `first_name` y `last_name` desde el perfil
   - NO permite editar estos campos

8. **JS/perfil-jugador.js**
   - Renderiza `first_name` y `last_name` por separado
   - Fallback a dividir `full_name` si no existen los campos

## ✅ Comportamiento Esperado

### Al Registrarse:
1. Usuario ingresa "Juan" como nombre y "Pérez" como apellido
2. Se guarda en BD:
   - `first_name`: "Juan"
   - `last_name`: "Pérez"  
   - `full_name`: "Juan Pérez"

### En el Perfil:
1. Campos "Nombre" y "Apellido" aparecen con fondo gris claro (scouts)
2. Tienen texto: "El nombre/apellido no puede ser modificado" (scouts)
3. No se pueden editar (readonly) en perfil de scouts
4. Al guardar cambios, estos campos NO se envían
5. En perfil de jugadores, se muestra en modo solo lectura por separado

### En el Dashboard:
1. Se muestra el nombre completo: "Juan Pérez"
2. Obtenido de `first_name + last_name` o `full_name` (fallback)

## 🧪 Cómo Probar

1. **Registra un nuevo usuario:**
   - Ve a `registro.html`
   - Completa el formulario con nombre y apellido
   - Registra la cuenta

2. **Verifica en Supabase:**
   ```sql
   SELECT first_name, last_name, full_name 
   FROM profiles 
   WHERE email = 'email_del_usuario@test.com';
   ```

3. **Ve al perfil:**
   - Inicia sesión
   - Ve a `perfil-scout.html`
   - Verifica que nombre y apellido no se puedan editar

4. **Intenta editar otros campos:**
   - Edita teléfono, ciudad, etc.
   - Guarda cambios
   - Verifica que nombre y apellido permanezcan igual

## 📝 Notas Importantes

### Campos readonly:
- `first_name` - No editable
- `last_name` - No editable  
- `email` - No editable (por seguridad)

### Campos editables:
- Teléfono
- Fecha de nacimiento
- Nacionalidad
- Ciudad
- Organización (scouts)
- Posición (scouts)
- Experiencia (scouts)
- Biografía

## 🔄 Usuarios Existentes

Los usuarios que ya existen en la base de datos:
1. Se les separará automáticamente el nombre al ejecutar el script
2. El primer espacio divide `first_name` del resto (`last_name`)
3. Pueden tener nombres incorrectamente separados si tienen nombres compuestos
4. Considerar migración manual para casos especiales

## ⚠️ Consideraciones

1. **Nombres compuestos:** "Juan Carlos López García"
   - `first_name`: "Juan"
   - `last_name`: "Carlos López García"
   - Esto es correcto en la mayoría de culturas latinas

2. **Si necesitas cambiar un nombre:**
   - Debe hacerse manualmente en Supabase
   - Ir a Table Editor → profiles
   - Editar el registro específico
   - Cambiar `first_name` y/o `last_name`
   - Actualizar `full_name` manualmente también

3. **Perfil de jugador:**
   - ✅ Ya implementado en modo visualización
   - Los jugadores ven su nombre y apellido por separado
   - No tienen formulario de edición en esta versión
   - Si se agrega edición, usar el mismo patrón de readonly

4. **Compatibilidad:**
   - El código tiene fallback a `full_name` si no existen los campos nuevos
   - Usuarios antiguos seguirán funcionando
   - Nuevos usuarios tendrán los 3 campos (first_name, last_name, full_name)
