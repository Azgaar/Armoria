<script>
  import "path-data-polyfill";
  import {ordinaries, shields} from "$lib/data/dataModel";
  import {shield} from "$lib/data/stores";
  import {drag, transform} from "$lib/scripts/drag";
  import {getTemplate} from "$lib/scripts/getters";
  import {highlight, lowlight} from "$lib/scripts/highlight";
  export let coa, ordinary, i, shieldPath, t, type;
  export let t2 = undefined;

  let stroke, width, transf;
  $: {
    stroke = ordinary.stroke || "none";
    if (ordinary.ordinary === "bordure") {
      width = 33.3;
    } else if (ordinary.ordinary === "orle") {
      width = 10;
      transf = "translate(15 15) scale(.85)";
    } else {
      width = ordinary.strokeWidth || 1;
    }
  }

  function addDrag(event) {
    if (type !== "Edit") return;
    drag(event, ordinary, coa);
  }

  const gyronny = Math.round(ordinary.gyronny / 2) * 2;
  const angle = 2 * Math.PI / gyronny;
  let dashes;
  $: {
    dashes = [0];
    if (ordinary.compony > 0) {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", shieldPath);
      const data = p.getPathData();
      // Path is split into several segments in regard to sharp edges
      const merge = shields.data[coa.shield || $shield].segments || Array(data.length - 2).fill(1);
      let counter = 1;
      let start = "M" + data[0].values[0] + "," + data[0].values[1];
      for (let i = 0; i < merge.length; i++) {
        if (merge[i] === 0) continue;
        let path = start;
        for (let j = 0; j < merge[i]; j++) {
          path += data[counter + j].type + data[counter + j].values;
        }
        counter += merge[i];
        const seg = document.createElementNS("http://www.w3.org/2000/svg", "path");
        seg.setAttribute("d", path);
        const segLen = seg.getTotalLength();
        const end = seg.getPointAtLength(segLen);
        start = "M" + end.x + "," + end.y;
        // Make sure the number of dashes in a segment is odd (for symmetry)
        let numDashes = Math.round(0.5 + segLen / ordinary.compony / 2) * 2 - 1;
        if (merge.length === 1) {
          // unless there is only one segment
          numDashes = Math.round(segLen / ordinary.compony / 2) * 2;
        }
        const dashLen = segLen / numDashes;
        dashes.push(dashes.pop() + dashLen);
        while (--numDashes > 0) {
          dashes.push(dashLen);
        }
      }
      // Set the last dash to an arbitrary big value to properly close the shape
      dashes.pop();
      dashes.push(1000);
      // Make sure the number of dashes is even
      if (dashes.length % 2) dashes.push(0);
    }
  }
</script>

<g
  class="ordinary"
  {i}
  transform={transform(ordinary)}
  fill={t}
  {stroke}
  stroke-width={width}
  on:mousedown={addDrag}
  on:mouseenter={type === "Edit" ? highlight("menu", "ordinary", i) : null}
  on:mouseleave={type === "Edit" ? lowlight("menu", "ordinary", i) : null}
>
  {#if ordinary.ordinary === "bordure" || ordinary.ordinary === "orle"}
    {#if ordinary.gyronny}
    <mask id="mask_{i}">
      <path d={shieldPath} fill="none" stroke="white"/>
    </mask>
    <path d={shieldPath} fill="none" stroke={t} transform={transf} />
    <g fill={t2} mask="url(#mask_{i})" transform={transf}>
      {#each Array(gyronny / 2) as _, i}
      <polygon points="100,100 {100 + Math.cos(2*i*angle) * 200},{100 + Math.sin(2*i*angle) * 200} {100 + Math.cos((2*i+1) * angle) * 200},{100 + Math.sin((2*i+1) * angle) * 200}"/>
      {/each}
    </g>
    {:else if ordinary.compony}
    <path d={shieldPath} fill="none" stroke={t} transform={transf} />
    <path d={shieldPath} fill="none" stroke={t2} stroke-dasharray={dashes.join(" ")} transform={transf} />
    {:else}
    <path d={shieldPath} fill="none" stroke={t} transform={transf} />
    {/if}
  {:else}
    <!-- Remove superfluous <g> for Svelte >= 3.48 (see https://github.com/sveltejs/svelte/issues/7450) -->
    <g>{@html getTemplate(ordinaries.data[ordinary.ordinary], ordinary.line)}</g>
  {/if}
</g>
