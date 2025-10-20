# Instrucciones: Agregar Segunda Nacionalidad

## Pasos para ejecutar en Supabase

### 1. Accede a tu proyecto Supabase
- Ve a https://supabase.com/dashboard
- Selecciona tu proyecto ScoutConnect

### 2. Abre el Editor SQL
- En el menú lateral izquierdo, haz clic en "SQL Editor"
- Haz clic en "New query" (Nueva consulta)

### 3. Ejecuta el script
- Abre el archivo `supabase-add-second-nationality.sql`
- Copia TODO el contenido del archivo
- Pégalo en el editor SQL de Supabase
- Haz clic en "Run" (Ejecutar)

### 4. Verifica que se ejecutó correctamente
Deberías ver en los resultados:

```
ALTER TABLE
CREATE FUNCTION
```

Y al final una tabla mostrando:

```
column_name          | data_type         | is_nullable
---------------------|-------------------|-------------
nationality          | character varying | YES
second_nationality   | character varying | YES
```

## ¿Qué hace este script?

1. **Agrega la columna `second_nationality`** a la tabla `profiles`
2. **Actualiza el trigger `handle_new_user`** para que capture ambas nacionalidades del registro
3. **Añade comentarios** explicando que ambas nacionalidades son readonly después del registro

## Cambios en el frontend

✅ **Ya implementados:**
- `registro.html`: Dos campos para capturar nacionalidad principal y secundaria
- `registro.js`: Envía ambas nacionalidades a Supabase durante el registro
- `perfil-scout.html`: Ambos campos readonly (no modificables)
- `perfil-scout.js`: No envía nacionalidades al guardar (son readonly)
- `perfil-jugador.js`: Muestra ambas nacionalidades en la vista del jugador

## Flujo completo

1. **Usuario se registra** → Ingresa nacionalidad principal (obligatoria) y secundaria (opcional)
2. **Se crea el perfil** → Trigger guarda ambas nacionalidades en la base de datos
3. **Usuario ve su perfil** → Ambas nacionalidades aparecen como campos readonly (grisados)
4. **Usuario intenta editar** → Los campos están bloqueados y no se pueden modificar

## Validación

Después de ejecutar el script, registra un nuevo usuario de prueba:
- Con ambas nacionalidades
- Solo con nacionalidad principal
- Verifica que aparezcan correctamente en el perfil
- Intenta editarlas (no debería permitirlo)
