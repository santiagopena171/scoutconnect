// ============================================
// FACET TAGS UTILITY
// ============================================

import type { FacetTag } from '../types';

export interface FacetTagOption {
  value: FacetTag;
  label: string;
  description: string;
}

export const FACET_TAGS_BY_POSITION: Record<string, FacetTagOption[]> = {
  // Delanteros / Atacantes
  delantero: [
    {
      value: 'definicion',
      label: 'Definición',
      description: 'Capacidad de finalizar jugadas',
    },
    {
      value: 'desmarque',
      label: 'Desmarque',
      description: 'Movimientos sin balón para recibir',
    },
    {
      value: 'presion',
      label: 'Presión',
      description: 'Presión alta a defensas rivales',
    },
  ],
  
  // Mediocampistas
  mediocampista: [
    {
      value: 'control_pase',
      label: 'Control y Pase',
      description: 'Dominio del balón y distribución',
    },
    {
      value: 'recuperacion',
      label: 'Recuperación',
      description: 'Capacidad de recuperar balones',
    },
    {
      value: 'transicion',
      label: 'Transición',
      description: 'Velocidad en cambio de fase',
    },
  ],
  
  // Defensas
  defensa: [
    {
      value: 'anticipos',
      label: 'Anticipos',
      description: 'Lectura y anticipación defensiva',
    },
    {
      value: 'duelo_aereo',
      label: 'Duelo Aéreo',
      description: 'Efectividad en disputas aéreas',
    },
    {
      value: 'salida',
      label: 'Salida',
      description: 'Inicio de juego desde atrás',
    },
  ],
  
  // Arqueros
  arquero: [
    {
      value: 'reflejos',
      label: 'Reflejos',
      description: 'Reacciones rápidas bajo palos',
    },
    {
      value: 'juego_pies',
      label: 'Juego con Pies',
      description: 'Habilidad con balón controlado',
    },
    {
      value: 'centros_1v1',
      label: 'Centros y 1v1',
      description: 'Salidas y situaciones mano a mano',
    },
  ],
};

export function getFacetTagsByPosition(position: string): FacetTagOption[] {
  const normalizedPosition = position.toLowerCase();
  
  if (normalizedPosition.includes('delantero') || normalizedPosition.includes('atacante')) {
    return FACET_TAGS_BY_POSITION.delantero;
  }
  
  if (normalizedPosition.includes('medio')) {
    return FACET_TAGS_BY_POSITION.mediocampista;
  }
  
  if (normalizedPosition.includes('defensa') || normalizedPosition.includes('lateral')) {
    return FACET_TAGS_BY_POSITION.defensa;
  }
  
  if (normalizedPosition.includes('arquero') || normalizedPosition.includes('portero')) {
    return FACET_TAGS_BY_POSITION.arquero;
  }
  
  // Default: return all
  return Object.values(FACET_TAGS_BY_POSITION).flat();
}
