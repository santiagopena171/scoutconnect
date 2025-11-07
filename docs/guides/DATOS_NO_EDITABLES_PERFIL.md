# Datos No Editables del Perfil de Futbolista

## 📋 Resumen de Cambios

Se han implementado restricciones para que ciertos datos personales del futbolista **NO puedan ser modificados** después del registro. Estos datos se cargan automáticamente desde la información proporcionada durante el registro y se mantienen inmutables.

## 🔒 Campos No Editables

Los siguientes campos están protegidos y no pueden ser modificados desde el dashboard del futbolista:

### 1. **Nombre** (firstName)
- ✅ Se carga desde el registro
- 🔒 Campo readonly en el modal de edición
- 📝 Muestra mensaje: "El nombre no puede ser modificado"

### 2. **Apellido** (lastName)
- ✅ Se carga desde el registro
- 🔒 Campo readonly en el modal de edición
- 📝 Muestra mensaje: "El apellido no puede ser modificado"

### 3. **Fecha de Nacimiento** (birthDate)
- ✅ Se carga desde el registro
- 🔒 Campo readonly en el modal de edición
- 📝 Muestra mensaje: "La fecha de nacimiento no puede ser modificada"

### 4. **Edad** (age)
- ✅ Se calcula automáticamente desde la fecha de nacimiento
- 🔒 Campo readonly en el modal de edición
- 🔄 Se recalcula cada vez que se carga el perfil
- 📝 Muestra mensaje: "Se calcula automáticamente desde la fecha de nacimiento"

### 5. **Nacionalidad** (nationality)
- ✅ Se carga desde el registro
- 🔒 Campo readonly (ya estaba protegido anteriormente)
- 📝 Muestra mensaje: "La nacionalidad no puede ser modificada"

### 6. **Segunda Nacionalidad** (second_nationality)
- ✅ Se carga desde el registro
- 🔒 Campo readonly (ya estaba protegido anteriormente)
- 📝 Muestra mensaje: "La segunda nacionalidad no puede ser modificada"

## 🔧 Implementación Técnica

### Flujo de Datos

```
REGISTRO
  ├─ Usuario completa formulario (nombre, apellido, fecha de nacimiento, etc.)
  ├─ Datos se guardan en Supabase
  └─ Datos se guardan en localStorage (scoutConnectUser)
      {
        first_name: "Juan",
        last_name: "Pérez",
        birth_date: "2003-05-15",
        nationality: "Argentina",
        second_nationality: null
      }

LOGIN
  ├─ Usuario se autentica
  ├─ Se cargan datos desde Supabase
  └─ Se guardan en localStorage (scoutConnectUser)

DASHBOARD
  ├─ Se carga scoutConnectUser desde localStorage
  ├─ Se actualiza playerData con datos del registro
  ├─ Se calcula edad automáticamente
  └─ Se muestra perfil con datos precargados
```

### Funciones Modificadas

#### 1. `updatePlayerDataFromSession(userData)`
**Archivo:** `JS/dashboard-futbolista.js`

```javascript
// Cargar datos del registro
if (userData.birth_date) {
  playerData.birthDate = userData.birth_date;
  // Calcular edad automáticamente
  playerData.age = calculateAge(userData.birth_date);
}
```

#### 2. `calculateAge(birthDate)`
**Archivo:** `JS/dashboard-futbolista.js`

```javascript
function calculateAge(birthDate) {
  if (!birthDate) return playerData.age || 22;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Ajustar si aún no ha cumplido años este año
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
```

#### 3. `loadPlayerData()`
**Archivo:** `JS/dashboard-futbolista.js`

```javascript
function loadPlayerData() {
  // Recalcular edad desde la fecha de nacimiento antes de cargar
  if (playerData.birthDate) {
    playerData.age = calculateAge(playerData.birthDate);
  }
  // ... resto del código
}
```

#### 4. `saveProfileChanges()`
**Archivo:** `JS/dashboard-futbolista.js`

```javascript
function saveProfileChanges() {
  // NOTA: firstName, lastName, birthDate y age NO se modifican (son readonly)
  // Estos datos vienen del registro y no se pueden cambiar
  
  // Solo se leen y guardan los campos editables
  const position = document.getElementById('editPosition').value;
  const location = document.getElementById('editLocation').value;
  // ... etc
  
  // NO se actualizan:
  // - playerData.firstName
  // - playerData.lastName
  // - playerData.name
  // - playerData.birthDate
  // - playerData.age
}
```

#### 5. Modal de Edición - Campos Readonly
**Archivo:** `JS/dashboard-futbolista.js`

```html
<!-- Nombre -->
<input type="text" 
       id="editFirstName" 
       value="${playerData.firstName}" 
       readonly 
       style="background-color: #f5f5f5; cursor: not-allowed;">
<small class="text-muted">El nombre no puede ser modificado</small>

<!-- Apellido -->
<input type="text" 
       id="editLastName" 
       value="${playerData.lastName}" 
       readonly 
       style="background-color: #f5f5f5; cursor: not-allowed;">
<small class="text-muted">El apellido no puede ser modificado</small>

<!-- Edad (calculada automáticamente) -->
<input type="number" 
       id="editAge" 
       value="${playerData.age}" 
       readonly 
       style="background-color: #f5f5f5; cursor: not-allowed;">
<small class="text-muted">Se calcula automáticamente desde la fecha de nacimiento</small>

<!-- Fecha de Nacimiento -->
<input type="date" 
       id="editBirthDate" 
       value="${playerData.birthDate}" 
       readonly 
       style="background-color: #f5f5f5; cursor: not-allowed;">
<small class="text-muted">La fecha de nacimiento no puede ser modificada</small>
```

### Actualización en Registro
**Archivo:** `JS/registro.js`

```javascript
// Guardar datos completos en localStorage
const userData = {
  id: registrationResult.userId,
  email: formData.email,
  userType: formData.userType,
  name: `${formData.firstName} ${formData.lastName}`,
  first_name: formData.firstName,
  last_name: formData.lastName,
  birth_date: formData.birthDate,  // ← NUEVO
  nationality: formData.nationality,
  second_nationality: formData.secondNationality,
  registrationTime: new Date().toISOString()
};

localStorage.setItem('scoutConnectUser', JSON.stringify(userData));
```

## ✅ Beneficios

1. **Integridad de Datos:** Los datos personales sensibles no pueden ser alterados accidentalmente
2. **Consistencia:** Los datos coinciden siempre con los del registro oficial
3. **Edad Actualizada:** La edad se recalcula automáticamente, siempre está correcta
4. **UX Clara:** Mensajes visuales indican por qué ciertos campos no son editables
5. **Seguridad:** Previene modificaciones no autorizadas de información crítica

## 🔄 Sincronización

### Al Registrarse
1. Usuario completa formulario de registro
2. Datos se guardan en Supabase (tabla `profiles`)
3. Datos se copian a localStorage (`scoutConnectUser`)

### Al Iniciar Sesión
1. Usuario se autentica con email/password
2. Se obtiene perfil desde Supabase
3. Datos se actualizan en localStorage (`scoutConnectUser`)
4. Dashboard carga datos desde localStorage

### Al Cargar Dashboard
1. Se lee `scoutConnectUser` desde localStorage
2. Se actualiza `playerData` con datos del registro
3. Se calcula edad actual desde `birth_date`
4. Se muestra perfil con datos actualizados

### Al Editar Perfil
1. Modal muestra campos readonly con datos del registro
2. Usuario solo puede editar campos permitidos
3. Al guardar, campos readonly no se modifican
4. Edad se recalcula automáticamente en cada carga

## 🐛 Solución al Problema Original

### Problema Reportado
> "le cambie el nombre al perfil de futbolista, luego cerre sesion y al inicar devuelta tenia el nombre anteriro al cambio"

### Causa
El nombre se podía modificar desde el dashboard, pero estos cambios solo se guardaban en localStorage (`scoutConnectPlayerData`). Al cerrar sesión e iniciar nuevamente, el sistema cargaba los datos originales desde `scoutConnectUser` (que proviene del registro/login de Supabase), sobrescribiendo los cambios locales.

### Solución Implementada
1. Los campos de nombre, apellido y fecha de nacimiento ahora son **readonly**
2. No se pueden modificar desde el modal de edición
3. Siempre mantienen los valores del registro original
4. La edad se calcula automáticamente y siempre está actualizada
5. Mensajes visuales explican por qué no son editables

## 📝 Notas para Futuro Desarrollo

Si en el futuro se necesita permitir cambios en estos datos:

1. **Crear proceso de verificación:** Requerir documentación oficial
2. **Implementar sistema de aprobación:** Cambios deben ser aprobados por administrador
3. **Mantener historial:** Guardar registro de todos los cambios
4. **Notificar cambios:** Alertar a scouts/clubes interesados de modificaciones en el perfil

---

**Fecha de Implementación:** 20 de octubre de 2025  
**Archivos Modificados:**
- `JS/dashboard-futbolista.js`
- `JS/registro.js`
- `JS/login.js` (ya tenía la estructura correcta)
