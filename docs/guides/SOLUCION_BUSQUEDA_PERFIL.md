# 🔍 Solución: Perfil no aparece en Búsqueda Avanzada

## Problema
El perfil de futbolista no aparece cuando un scout busca en la búsqueda avanzada.

## Causa
La tabla `profiles` en Supabase no tenía todas las columnas necesarias para la búsqueda avanzada. Los datos de los jugadores solo estaban en la tabla separada `players`, pero la búsqueda avanzada consulta directamente `profiles`.

## Solución Implementada

### 1. ✅ Actualización de `busqueda-avanzada.js`
- Ahora carga jugadores reales desde Supabase en lugar de solo datos hardcodeados
- Convierte los perfiles de Supabase al formato esperado
- Calcula la edad automáticamente desde `birth_date`
- Extrae tags/características de los atributos del perfil
- Combina jugadores reales con jugadores demo para testing

### 2. ✅ Actualización de `registro.js`
- Guarda todos los datos del jugador directamente en `profiles` durante el registro
- Incluye: posición, pie hábil, altura, peso, club, país, estado
- Asegura que los datos estén disponibles inmediatamente para búsqueda

### 3. 📄 Script SQL: `agregar-campos-busqueda.sql`
**Este script DEBE ejecutarse en Supabase para resolver el problema**

## 📋 Pasos para Completar la Solución

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** en el panel izquierdo
3. Haz clic en **New Query**
4. Copia y pega el contenido del archivo:
   ```
   database/agregar-campos-busqueda.sql
   ```
5. Haz clic en **Run** (o presiona Ctrl+Enter)
6. Espera a que se complete (debe decir "Success")

### Paso 2: Actualizar tu Perfil Existente

Si ya tenías un perfil registrado antes de estos cambios, necesitas actualizar tus datos:

**Opción A: Desde el Dashboard**
1. Ve a tu dashboard de futbolista
2. Edita tu perfil y guarda los cambios
3. Asegúrate de completar: posición, nacionalidad, país, estado

**Opción B: Desde Supabase (si tienes acceso)**
1. Ve a **Table Editor** → `profiles`
2. Busca tu registro (por email)
3. Completa manualmente los campos vacíos

### Paso 3: Verificar la Solución

1. Cierra sesión de tu cuenta de futbolista
2. Inicia sesión como scout (o regístrate como scout si no tienes cuenta)
3. Ve a "Búsqueda Avanzada"
4. Busca por tu nombre o filtra por tu posición/nacionalidad
5. Tu perfil debería aparecer en los resultados

## 🎯 Campos Necesarios para Aparecer en Búsqueda

Para que un perfil de futbolista aparezca correctamente en la búsqueda, debe tener:

### Campos Obligatorios:
- ✅ `first_name` - Nombre
- ✅ `last_name` - Apellido  
- ✅ `email` - Correo electrónico
- ✅ `user_type` = 'jugador'

### Campos Recomendados (para búsqueda efectiva):
- ⭐ `position` - Posición primaria
- ⭐ `nationality` - Nacionalidad
- ⭐ `birth_date` - Fecha de nacimiento (para calcular edad)
- 📍 `country` - País de residencia
- 📍 `state` - Estado/Departamento
- 📍 `city` - Ciudad
- ⚽ `current_club` - Club actual
- ⚽ `league` - Liga en la que juega
- 📏 `height` - Altura (cm)
- ⚖️ `weight` - Peso (kg)
- 🦶 `preferred_foot` - Pie hábil (Derecho/Izquierdo/Ambidiestro)

### Campos Opcionales:
- `secondary_position` - Posición secundaria
- `second_nationality` - Segunda nacionalidad
- `contract_status` - Estado contractual
- `contract_expiry` - Vencimiento de contrato
- `market_value` - Valor de mercado
- `bio` - Biografía

## 🔍 Cómo Funciona la Búsqueda Ahora

1. **Carga de Datos**: Al abrir la búsqueda avanzada, se ejecuta:
   ```javascript
   await supabase
     .from('profiles')
     .select('*')
     .eq('user_type', 'jugador')
   ```

2. **Conversión de Datos**: Los perfiles se convierten al formato esperado:
   - Se calcula la edad desde `birth_date`
   - Se extraen tags de las características
   - Se parsea el valor de mercado

3. **Filtrado**: Los scouts pueden filtrar por:
   - Nombre
   - Posición (primaria y secundaria)
   - Edad (rango)
   - Nacionalidad
   - País/Estado de residencia
   - Características físicas (altura, peso)
   - Pie hábil
   - Club/Liga
   - Estado contractual

4. **Resultados**: Se muestran todos los jugadores que coincidan con los filtros

## ⚠️ Notas Importantes

1. **Permisos RLS**: Asegúrate de que las políticas de Row Level Security permitan:
   - Scouts puedan leer perfiles de jugadores
   - Jugadores puedan actualizar su propio perfil

2. **Datos Demo**: La búsqueda incluye algunos jugadores demo para testing. Estos tienen IDs como `'demo-1'`, `'demo-2'`, etc.

3. **Caché**: Si no ves cambios inmediatos:
   - Recarga la página con Ctrl+Shift+R (hard refresh)
   - Limpia la caché del navegador
   - Cierra y vuelve a abrir la sesión

## 🐛 Troubleshooting

### Mi perfil no aparece aún después de seguir los pasos

1. **Verifica en Supabase**:
   - Ve a Table Editor → `profiles`
   - Busca tu email
   - Confirma que `user_type` = 'jugador'
   - Confirma que los campos importantes no estén vacíos

2. **Verifica la consola del navegador**:
   - Abre DevTools (F12)
   - Ve a la pestaña Console
   - Busca mensajes de error o advertencias
   - Debería aparecer: "✅ X jugadores cargados desde Supabase"

3. **Verifica permisos RLS**:
   ```sql
   -- Ejecuta en SQL Editor para verificar políticas
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

### Error: "column does not exist"

Si ves errores como "column 'position' does not exist":
- El script SQL no se ejecutó correctamente
- Vuelve a ejecutar `agregar-campos-busqueda.sql`
- Verifica que no haya errores en la ejecución

### Los filtros no funcionan correctamente

- Asegúrate de que los datos en tu perfil estén en el formato correcto
- `preferred_foot` debe ser exactamente: 'Derecho', 'Izquierdo' o 'Ambidiestro'
- `position` debe coincidir con las opciones del formulario
- Las fechas deben estar en formato ISO: 'YYYY-MM-DD'

## 📊 Siguiente Paso

Una vez que completes estos pasos, tu perfil estará completamente disponible para que los scouts te encuentren y te puedan agregar a su lista de seguimiento o crear reportes sobre ti.

Si encuentras algún problema, verifica los mensajes en la consola del navegador (F12) para más detalles sobre el error.
