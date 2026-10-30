import type { Place } from '@/shared/contract';

/** Preset places: the flow stays one click, and their data can be cached ahead of the demo. */
export const PLACES: Place[] = [
  { id: 'oran', name: 'Orán', region: 'Yungas', lat: -23.13, lon: -64.33 },
  { id: 'rivadavia', name: 'Rivadavia', region: 'Chaco salteño', lat: -24.19, lon: -62.89 },
  { id: 'salta', name: 'Salta capital', region: 'Valle de Lerma', lat: -24.79, lon: -65.41 },
  { id: 'anta', name: 'Joaquín V. González', region: 'Anta', lat: -25.11, lon: -64.13 },
  { id: 'cachi', name: 'Cachi', region: 'Valles Calchaquíes', lat: -25.12, lon: -66.16 },
  { id: 'cafayate', name: 'Cafayate', region: 'Valles Calchaquíes', lat: -26.07, lon: -65.98 },
];
