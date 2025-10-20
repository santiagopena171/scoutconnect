# SEGUNDA NACIONALIDAD Y NACIONALIDAD NO EDITABLE

## 📋 Objetivo
- Hacer que la **nacionalidad principal** no pueda ser modificada después del registro
- Agregar campo **segunda nacionalidad** (opcional y editable)

## 🗄️ Cambios en Base de Datos

### 1. Ejecutar script SQL en Supabase

Ve a **SQL Editor** en tu proyecto de Supabase y ejecuta el archivo:
```
database/supabase-add-second-nationality.sql
```

Este script:
- ✅ Agrega columna `second_nationality` a la tabla `profiles`
- ✅ Actualiza el trigger `handle_new_user()` para incluir segunda nacionalidad
- ✅ Agrega comentarios descriptivos

### 2. Verificar los cambios

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('nationality', 'second_nationality')
ORDER BY column_name;
```

Deberías ver:
```
column_name         | data_type         | is_nullable
--------------------|-------------------|-------------
nationality         | character varying | YES
second_nationality  | character varying | YES
```

## 💻 Cambios en el Código

### Archivos modificados:

1. **perfil-scout.html**
   - Campo "Nacionalidad Principal" ahora es `readonly`
   - Nuevo campo "Segunda Nacionalidad (Opcional)" editable
   - Texto de ayuda: "La nacionalidad principal no puede ser modificada"

2. **JS/perfil-scout.js**
   - Carga `second_nationality` desde el perfil
   - NO envía `nationality` al guardar (readonly)
   - SÍ envía `second_nationality` (editable)

3. **JS/perfil-jugador.js**
   - Renderiza "Nacionalidad principal"
   - Muestra "Segunda nacionalidad" solo si existe

4. **database/supabase-add-second-nationality.sql**
   - Script SQL para agregar la columna
   - Actualización del trigger

## ✅ Comportamiento Esperado

### Al Registrarse:
1. Usuario ingresa nacionalidad: "Colombia"
2. Se guarda en BD:
   - `nationality`: "Colombia" (no modificable)
   - `second_nationality`: NULL (editable después)

### En el Perfil de Scout:
1. Campo "Nacionalidad Principal" con fondo gris (readonly)
2. Campo "Segunda Nacionalidad" editable
3. Usuario puede agregar segunda nacionalidad después

### En el Perfil de Jugador:
1. Muestra "Nacionalidad principal: Colombia"
2. Si existe segunda nacionalidad: "Segunda nacionalidad: Argentina"
3. Solo visualización (no hay formulario de edición)

## 🧪 Cómo Probar

1. **Ejecuta el script SQL:**
   - Ve a Supabase SQL Editor
   - Ejecuta `database/supabase-add-second-nationality.sql`

2. **Inicia sesión con un usuario existente:**
   - Ve a `perfil-scout.html`
   - Verifica que "Nacionalidad Principal" sea readonly
   - Agrega una segunda nacionalidad
   - Guarda cambios

3. **Registra un nuevo usuario:**
   - Ingresa nacionalidad en el registro
   - Ve al perfil
   - Verifica que no puedas cambiar la nacionalidad principal
   - Agrega segunda nacionalidad

4. **Verifica en Supabase:**
   ```sql
   SELECT email, nationality, second_nationality 
   FROM profiles 
   WHERE email = 'tu_email@test.com';
   ```

## 📝 Notas Importantes

### Campos readonly en perfiles:
- ✅ `first_name` - Nombre
- ✅ `last_name` - Apellido
- ✅ `email` - Email
- ✅ `nationality` - Nacionalidad principal (NUEVO)

### Campos editables:
- ✏️ `second_nationality` - Segunda nacionalidad (NUEVO)
- ✏️ `phone` - Teléfono
- ✏️ `birth_date` - Fecha de nacimiento
- ✏️ `city` - Ciudad
- ✏️ Otros campos específicos de scout/jugador

### Casos de uso:
1. **Doble nacionalidad:** Usuario con nacionalidad colombiana y argentina
2. **Nacionalidad por residencia:** Usuario nacido en un país, naturalizado en otro
3. **Actualización:** Usuario puede agregar segunda nacionalidad después del registro

## ⚠️ Consideraciones

1. **Nacionalidad principal permanente:**
   - Solo editable manualmente en Supabase
   - Debe ser la nacionalidad con la que se registró

2. **Segunda nacionalidad opcional:**
   - Puede dejarse vacía
   - Se puede cambiar libremente
   - No requiere validación especial

3. **Compatibilidad:**
   - Usuarios antiguos: `nationality` ya existe
   - `second_nationality` será NULL hasta que la agreguen
   - El código maneja ambos casos

4. **Visualización:**
   - En listados y búsquedas: mostrar nacionalidad principal
   - En perfil completo: mostrar ambas si existen
   - En reportes: considerar ambas nacionalidades
