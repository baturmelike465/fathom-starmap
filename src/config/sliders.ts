/* Slider metadata — each entry defines a section, key, label, and range.
   Co-located with defaults so adding a new tunable means editing one spot. */

export interface SliderDef {
  sec: string;
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const SLIDERS: SliderDef[] = [
  { sec: 'forces', key: 'center',    label: 'center force',    min: -0.0006, max: 0.001,  step: 0.00005 },
  { sec: 'forces', key: 'repel',     label: 'repel force',     min: 400,     max: 9000,   step: 100 },
  { sec: 'forces', key: 'spring',    label: 'link force',      min: 0.001,   max: 0.08,   step: 0.002 },
  { sec: 'forces', key: 'len',       label: 'link distance',   min: 10,      max: 300,    step: 5 },
  { sec: 'forces', key: 'heat',      label: 'heat (boil the stars)', min: 0, max: 2.5,    step: 0.05 },
  { sec: 'forces', key: 'warp',      label: 'time warp',       min: 0,       max: 3,      step: 0.1 },
  { sec: 'display', key: 'nodeSize', label: 'star size',       min: 0.4,     max: 2.5,    step: 0.05 },
  { sec: 'display', key: 'glow',     label: 'glow',            min: 0,       max: 2.2,    step: 0.05 },
  { sec: 'display', key: 'nebula',   label: 'nebula fog',      min: 0,       max: 2.2,    step: 0.05 },
  { sec: 'display', key: 'linkAlpha', label: 'link brightness', min: 0,      max: 2.5,    step: 0.05 },
  { sec: 'display', key: 'linkW',    label: 'link thickness',  min: 0.3,     max: 3,      step: 0.05 },
  { sec: 'display', key: 'hue',      label: 'universe hue',    min: 0,       max: 360,    step: 5 },
  { sec: 'display', key: 'twinkle',  label: 'twinkle',         min: 0,       max: 2.5,    step: 0.05 },
  { sec: 'display', key: 'dust',     label: 'stardust',        min: 0,       max: 2.5,    step: 0.05 },
  { sec: 'display', key: 'stars',    label: 'backdrop stars',  min: 0,       max: 2.5,    step: 0.05 },
  { sec: 'display', key: 'nameSize', label: 'name size',       min: 0.4,     max: 2.2,    step: 0.05 },
  { sec: 'display', key: 'names',    label: 'star names',      min: 0,       max: 2,      step: 0.05 },
  { sec: 'display', key: 'novas',    label: 'supernovas',      min: 0,       max: 2,      step: 0.05 },
  { sec: 'display', key: 'hole',     label: 'black hole',      min: 0,       max: 2,      step: 0.05 },
  { sec: 'motion',  key: 'spin',     label: 'idle spin',       min: 0,       max: 4,      step: 0.1 },
  { sec: 'motion',  key: 'comets',   label: 'comets',          min: 0,       max: 250,    step: 5 },
  { sec: 'motion',  key: 'meteors',  label: 'meteor shower',   min: 0,       max: 10,     step: 0.5 },
  { sec: 'motion',  key: 'thrust',   label: 'flight thrust',   min: 0.3,     max: 4,      step: 0.1 },
  { sec: 'sound',   key: 'vol',      label: 'volume',          min: 0,       max: 2,      step: 0.05 },
];
