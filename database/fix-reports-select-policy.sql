-- =============================================
-- FIX: Permitir a scouts ver todos los reportes
-- (pero jugadores no pueden ver reportes sobre ellos)
-- =============================================

-- Eliminar la política restrictiva que solo permite ver reportes propios
DROP POLICY IF EXISTS "scouts_can_view_own_reports" ON public.reports;

-- Crear nueva política: usuarios tipo 'scout' pueden ver TODOS los reportes
-- Solo los scouts (no jugadores) tienen acceso a los reportes
CREATE POLICY "scouts_can_view_all_reports"
ON public.reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'scout'
  )
);

-- Confirmación
SELECT 'Política actualizada - scouts pueden ver todos los reportes' AS status;
