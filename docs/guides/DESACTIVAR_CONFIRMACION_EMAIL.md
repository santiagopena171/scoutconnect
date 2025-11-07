# DESACTIVAR CONFIRMACIÓN DE EMAIL EN SUPABASE

## Problema
Al registrar nuevos usuarios, Supabase requiere confirmar el email antes de iniciar sesión, lo cual no es ideal para desarrollo.

## Solución: Desactivar confirmación de email

### Pasos en Supabase Dashboard:

1. **Ve a tu proyecto en Supabase**
   - URL: https://app.supabase.com/project/lcujogyjgncfsxeptrlz

2. **Ve a Authentication → Providers**
   - En el menú lateral: Authentication → Providers
   - O ve directamente a: https://app.supabase.com/project/lcujogyjgncfsxeptrlz/auth/providers

3. **Configura Email Provider**
   - Busca "Email" en la lista de providers
   - Haz clic en "Email" para expandir las opciones

4. **Desactiva la confirmación de email**
   - Busca la opción: **"Confirm email"**
   - **DESACTÍVALA** (toggle a OFF/gris)
   - Esto permite que los usuarios inicien sesión inmediatamente sin confirmar email

5. **Guarda los cambios**
   - Haz clic en "Save" en la parte inferior

## Alternativa: Configurar URL de confirmación

Si prefieres mantener la confirmación pero evitar el error:

1. Ve a Authentication → URL Configuration
2. En "Site URL" pon: `http://127.0.0.1:5500`
3. En "Redirect URLs" agrega:
   - `http://127.0.0.1:5500/**`
   - `http://localhost:5500/**`

## Verificación

Después de desactivar la confirmación:
1. Crea una nueva cuenta de prueba
2. Deberías poder iniciar sesión inmediatamente
3. No debería aparecer el mensaje de "confirma tu email"

## Nota Importante

Para **PRODUCCIÓN**, deberías activar la confirmación de email para seguridad.
Para **DESARROLLO**, es más cómodo tenerla desactivada.
