/* Wallpaper export — snapshot the live starmap into a self-contained HTML file
   that any desktop-wallpaper app (Plash, Wallpaper Engine, etc.) can display. */

import { wallpaperHTML } from './template';
import { FAMS } from '../config/constants';

interface ExportNode {
  id: string;
  g: string;
  w: number;
  fam: string;
  x: number; y: number; z: number;
  r: number;
  tw: number;
  nova?: boolean;
  nbrArr: number[];
}

/** Snapshot the current graph state into a standalone HTML string. */
export function exportWallpaper(
  nodes: any[],
  links: any[],
  settings: Record<string, any>,
): string {
  // serialise nodes: only the fields the wallpaper renderer needs
  const exportNodes: ExportNode[] = nodes.map((n, i) => ({
    id: n.id,
    g: n.g,
    w: n.w,
    fam: n.fam,
    x: n.x, y: n.y, z: n.z,
    r: n.r,
    tw: n.tw,
    nova: n.nova || false,
    nbrArr: Array.from(n.nbr || []),
  }));

  // serialise links
  const exportLinks = links.map(l => ({ s: l.s, t: l.t }));

  // serialise families (only what the renderer needs)
  const exportFams: Record<string, { color: string; rgb: string }> = {};
  for (const k of Object.keys(FAMS)) {
    exportFams[k] = { color: FAMS[k].color, rgb: FAMS[k].rgb };
  }

  // display settings — strip exclude (private) and sound (not needed)
  const wpSettings = { ...settings };
  wpSettings.exclude = undefined;
  wpSettings.vol = undefined;
  // wallpaper runs idle, so force sound off and keep spin gentle
  wpSettings.warp = 0;
  wpSettings.heat = 0;

  const dataJSON = JSON.stringify({ nodes: exportNodes, links: exportLinks });
  const settingsJSON = JSON.stringify(wpSettings);
  const familiesJSON = JSON.stringify(exportFams);

  return wallpaperHTML(dataJSON, settingsJSON, familiesJSON);
}
