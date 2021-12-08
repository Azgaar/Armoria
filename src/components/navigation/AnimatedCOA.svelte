<script lang="ts">
  // @ts-check
  import {colors} from "data//stores";
  import {shieldPaths} from "data//shields";
  import {fade, draw} from "svelte/transition";
  import {rw} from "scripts/utils";

  export let duration: number;

  const delay = duration * 2.6;

  const tinctures = {metals: {argent: 3, or: 2}, colors: {gules: 5, sable: 3, azure: 4, vert: 2, purpure: 3}};
  const metal = Math.random() > 0.5;
  const t1 = metal ? rw(tinctures.metals) : rw(tinctures.colors);
  const t2 = metal ? rw(tinctures.colors) : rw(tinctures.metals);

  const divisionVariants = {
    perPale: 2,
    perFess: 2,
    perBend: 2,
    perBendSinister: 1,
    perCross: 6,
    perChevron: 1,
    perChevronReversed: 1,
    perPile: 2,
    perSaltire: 5,
    gyronny: 1,
    chevronny: 1
  };
  const division = rw(divisionVariants);

  const paths = {
    perPale: ["M100,25 v175", "M100,0 v200 h100 v-200 Z"],
    perFess: ["M27.5,100 h145", "M0,100 h200 v100 h-200 Z"],
    perBend: ["M0,0 l200,200", "M0,0 l200,200 h-200 Z"],
    perBendSinister: ["M200,0 L0,200", "M200,0 L0,200 h200 Z"],
    perCross: ["M100,25 v175 M27.5,100 h145", "M100,0 v200 h-100 v-100 h200 v-100 Z"],
    perChevron: ["M0,0 l100,100 l100,-100", "M0,0 l100,100 l100,-100 Z"],
    perChevronReversed: ["M0,200 l100,-100 l100,100", "M0,200 l100,-100 l100,100 Z"],
    perPile: ["M15,0 l85,200 l85,-200", "M15,0 l85,200 l85,-200 Z"],
    perSaltire: ["M0,0 L200,200 M200,0 l-200,200", "M0,0 L200,200 v-200 l-200,200 Z"],
    gyronny: ["M0,0 l200,200 M200,100 h-200 M100,0 v200 M0,200 l200,-200", "M0,0 l200,200 v-100 h-200 h-100 M100,0 v200, h-100 l200,-200 h-100"],
    chevronny: ["", "M0,80 100,-15 200,80 200,120 100,25 0,120z M0,160 100,65 200,160 200,200 100,105 0,200z M0,240 100,145 200,240 0,240z"]
  };

  let size = window.innerWidth < 600 ? window.innerWidth * 0.9 : 500;
  if (window.innerHeight < 600) size *= 0.5;
</script>

<svg width={size} height={size} viewBox="0 0 200 200">
  <clipPath id="shieldAbout">
    <path d={shieldPaths.heater} />
  </clipPath>

  <g clip-path="url(#shieldAbout)" stroke="#fff" stroke-width=".5">
    <path stroke-width="1" d="M25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" in:draw={{duration}} />
    <path d={paths[division][0]} in:draw={{delay: duration}} />

    <g in:fade={{delay, duration}} stroke="none">
      <rect x="0" y="0" width="200" height="200" fill={$colors[t1]} />
      <path d={paths[division][1]} fill={$colors[t2]} />
      <rect x="0" y="0" width="200" height="200" fill="url(#nourse)" />
    </g>
  </g>

  <g stroke="#000" fill="url(#backlight)">
    <path d={shieldPaths.heater} in:draw={{delay, duration}} />
  </g>
</svg>
