-- ===================================
-- FIX: Políticas RLS para tabla reports
-- ===================================

-- Eliminar políticas antiguas que usan la tabla scouts
DROP POLICY IF EXISTS "Los scouts pueden ver sus propios reportes" ON public.reports;
DROP POLICY IF EXISTS "Los scouts pueden crear reportes" ON public.reports;
DROP POLICY IF EXISTS "Los scouts pueden actualizar sus reportes" ON public.reports;
DROP POLICY IF EXISTS "Los scouts pueden eliminar sus reportes" ON public.reports;

-- Crear nuevas políticas simplificadas que usan auth.uid() directamente
-- Los scouts pueden ver sus propios reportes
CREATE POLICY "scouts_can_view_own_reports"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = scout_id);

-- Los scouts pueden crear reportes
CREATE POLICY "scouts_can_create_reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = scout_id);

-- Los scouts pueden actualizar sus reportes
CREATE POLICY "scouts_can_update_own_reports"
  ON public.reports
  FOR UPDATE
  USING (auth.uid() = scout_id)
  WITH CHECK (auth.uid() = scout_id);

-- Los scouts pueden eliminar sus reportes
CREATE POLICY "scouts_can_delete_own_reports"
  ON public.reports
  FOR DELETE
  USING (auth.uid() = scout_id);

-- Verificar que RLS esté habilitado
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Comentario
COMMENT ON TABLE public.reports IS 'Reportes de scouting con políticas RLS simplificadas';
