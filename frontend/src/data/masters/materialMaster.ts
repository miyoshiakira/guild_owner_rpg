import type { MaterialItem } from "../../types/masters";
import materialsJson from './json/materials.json';

export const MATERIAL_MASTER: MaterialItem[] = materialsJson as MaterialItem[];

/** id → MaterialItem の引きマップ */
export const MATERIAL_MAP: Record<string, MaterialItem> = Object.fromEntries(
  MATERIAL_MASTER.map((m) => [m.id, m])
);