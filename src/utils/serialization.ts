import type { CubeData, ShapePath, ProjectMeta } from '../types';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export interface SaveData {
  meta: ProjectMeta;
  cubes: CubeData[];
  shapes: ShapePath[];
}

/** Serialize project state to JSON string */
export function serializeProject(data: SaveData): string {
  return JSON.stringify(data);
}

/** Deserialize project state from JSON string */
export function deserializeProject(json: string): SaveData {
  return JSON.parse(json) as SaveData;
}

/** Save project to a downloadable JSON file */
export function saveToFile(data: SaveData): void {
  const json = serializeProject(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.meta.name.replace(/\s+/g, '_')}.tesera.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Load project from a File object */
export async function loadFromFile(file: File): Promise<SaveData> {
  const text = await file.text();
  return deserializeProject(text);
}

/** Compress state into a URL-safe string for sharing */
export function stateToURL(data: SaveData): string {
  const json = serializeProject(data);
  return compressToEncodedURIComponent(json);
}

/** Decompress state from a URL hash */
export function stateFromURL(hash: string): SaveData | null {
  try {
    const json = decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    return deserializeProject(json);
  } catch {
    return null;
  }
}
