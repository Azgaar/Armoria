<script>
  import {colors, patterns} from "./stores";

  let patternData = [];
  $: {
    patternData = [...new Set($patterns)].map(id => {
      const [element, t1, t2, size] = id.split("-");
      const [type, charge] = element.split("_of_");
      const mod = getSizeModified(size);
      return {id, type, t1, t2, mod, charge};
    });
  }

  function getSizeModified(size) {
    if (size === "small") return .5;
    if (size === "smaller") return .25;
    if (size === "smallest") return .125;
    if (size === "big") return 2;
    return 1;
  }

  const defs = document.getElementById("charges");
  async function getCharge(p) {
    let html = "";
    const internal = defs.querySelector("#"+p.charge);

    if (internal) {
      html = internal.outerHTML;
    } else {
      const extSVG = await fetch("charges/"+p.charge+".svg");
      const text = await extSVG.text();
      const el = document.createElement("html");
      el.innerHTML = text;
      html = el.querySelector("g").outerHTML;
      defs.insertAdjacentHTML("beforeend", html);
    }
    return html;
  }
</script>

{#each patternData as p}
  {#if p.type === "semy"}
  <pattern id={p.id} width={.134 * p.mod} height={.1787 * p.mod} viewBox="0 0 150 200" stroke="#000">
    <rect x=0 y=0 width=150 height=200 fill={$colors[p.t1]} stroke="none"/>
    <g fill={$colors[p.t2]}>
      {#await getCharge(p) then charge}
        <g transform="translate(-60,-50)">{@html charge}</g>
        <g transform="translate(10,50)">{@html charge}</g>
      {/await}
    </g>
  </pattern>
  {:else if p.type === "vair"}
    <pattern id={p.id} width={.125 * p.mod} height={.25 * p.mod} viewBox="0 0 25 50" stroke="#000" stroke-width=.2>
      <rect x=0 y=0 width=25 height=25 fill={$colors[p.t2]} stroke="none"/>
      <path d="m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z" fill={$colors[p.t1]}/>
      <rect x=0 y=25 width=25 height=25 fill={$colors[p.t1]} stroke-width=1 stroke="none"/>
      <path d="m25,25 l-6.25,6.25 v12.5 l-6.25,6.25 l-6.25,-6.25 v-12.5 l-6.25,-6.25 z" fill={$colors[p.t2]}/>
    </pattern>
  {:else if p.type === "vairInPale"}
    <pattern id={p.id} width={.125 * p.mod} height={.125 * p.mod} viewBox="0 0 25 25">
      <rect x=0 y=0 width=200 height=200 fill={$colors[p.t2]}/>
      <path d="m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z" fill={$colors[p.t1]} stroke="#000" stroke-width=".2"/>
    </pattern>
  {:else if p.type === "vairEnPointe"}
    <pattern id={p.id} width={.125 * p.mod} height={.25 * p.mod} viewBox="0 0 25 50">
      <rect x=0 y=0 width=25 height=25 fill={$colors[p.t2]}/>
      <path d="m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z" fill={$colors[p.t1]}/>
      <rect x=0 y=25 width=25 height=25 fill={$colors[p.t1]} stroke-width=1 stroke={$colors[p.t1]}/>
      <path d="m12.5,25 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z" fill={$colors[p.t2]}/>
    </pattern>
  {:else if p.type === "ermine"}
    <pattern id={p.id} width={.125 * p.mod} height={.125 * p.mod} viewBox="0 0 25 25" fill={$colors[p.t2]}>
      <rect x=0 y=0 width=25 height=25 fill={$colors[p.t1]}/>
      <path d="m19.1,14.8 c-0.7,2.9 -2.1,5 -3.5,6.5 0.6,-0.1 1.3,-0.6 2,-0.9 -0.4,0.8 -0.8,1.4 -1.2,2.1 0.2,-0.1 1,-0.8 2,-1.8 0.2,1.4 0.4,2.9 0.7,3.9 0.3,-0.9 0.5,-2.5 0.7,-3.9 0.6,0.6 1.2,1.3 2.1,1.8 l -1.2,-2.2 c 0.6,0.3 1.3,0.8 1.9,1 -1.5,-1.6 -2.8,-3.6 -3.5,-6.5z"/>
      <path d="m16.1,14.9 c-0.1,-0.2 -1,0.4 -1.5,-0.8 1.2,1.1 2.5,-1.2 3.5,0.4 0.3,0.7 -1.1,1.8 -2,0.4z"/>
      <path d="m21.9,14.9 c.1,-.2 1,0.4 1.5,-0.8 -1.2,1.1 -2.5,-1.2 -3.5,0.4 -0.3,0.7 1.1,1.8 2,0.4z"/>
      <path d="m19.4,12.4 c-0.2,-0.1 0.7,-0.7 -0.6,-1.4 1.1,1.2 -2,1.7 -0.3,2.9 0.7,0.4 2.4,-0.5 0.9,-1.5z"/>
      <path d="M5.8,4.6 C5.1,7.5 3.7,9.5 2.3,11 2.9,10.9 3.6,10.5 4.2,10.1 3.8,10.9 3.4,11.5 3,12.2 3.3,12.1 4,11.4 5.1,10.4 c 0.2,1.4 0.4,2.9 0.7,3.9 0.3,-0.9 0.5,-2.5 0.7,-3.9 0.6,0.6 1.2,1.3 2.1,1.8 L 7.3,10 c 0.6,0.3 1.3,0.8 1.9,1 C7.7,9.5 6.4,7.5 5.8,4.6Z"/>
      <path d="M2.9,4.7 C2.8,4.6 1.9,5.1 1.3,4 2.6,5.1 3.8,2.8 4.9,4.3 5.2,5 3.8,6.1 2.9,4.7Z"/>
      <path d="M8.6,4.7 C8.7,4.5 9.6,5.1 10.1,3.9 8.9,5.1 7.6,2.7 6.6,4.3 6.3,5 7.7,6.1 8.6,4.7Z"/>
      <path d="M6.1,2.2 C 5.9,2.1 6.8,1.5 5.5,0.8 6.6,2.1 3.5,2.6 5.2,3.7 5.9,4.1 7.6,3.3 6.1,2.2Z"/>
    </pattern>
  {:else if p.type === "chequy"}
    <pattern id={p.id} width={.25 * p.mod} height={.25 * p.mod} viewBox="0 0 50 50" fill={$colors[p.t2]}>
      <rect x=0 y=0 width=50 height=50 />
      <rect x=0 y=0 width=25 height=25 fill={$colors[p.t1]}/>
      <rect x=25 y=25 width=25 height=25 fill={$colors[p.t1]}/>
    </pattern>
  {:else if p.type === "lozengy"}
    <pattern id={p.id} width={.125 * p.mod} height={.125 * p.mod} viewBox="0 0 50 50">
      <rect x=0 y=0 width=50 height=50 fill={$colors[p.t1]}/>
      <polygon points="25,0 50,25 25,50 0,25" fill={$colors[p.t2]}/>
    </pattern>
  {:else if p.type === "fusily"}
    <pattern id={p.id} width={.125 * p.mod} height={.25 * p.mod} viewBox="0 0 50 100">
      <rect x=0 y=0 width=50 height=100 fill={$colors[p.t1]}/>
      <polygon points="25,0 50,50 25,100 0,50" fill={$colors[p.t2]}/>
    </pattern>
  {:else if p.type === "pally"}
    <pattern id={p.id} width={.5 * p.mod} height={.125 * p.mod} viewBox="0 0 100 25">
      <rect x=0 y=0 width=100 height=25 fill={$colors[p.t1]}/>
      <rect x=25 y=0 width=25 height=25 fill={$colors[p.t2]}/>
      <rect x=75 y=0 width=25 height=25 fill={$colors[p.t2]}/>
    </pattern>
  {:else if p.type === "barry"}
    <pattern id={p.id} width={.125 * p.mod} height={.5 * p.mod} viewBox="0 0 25 100">
      <rect x=0 y=0 width=25 height=100 fill={$colors[p.t2]}/>
      <rect x=0 y=25 width=25 height=25 fill={$colors[p.t1]}/>
      <rect x=0 y=75 width=25 height=25 fill={$colors[p.t1]}/>
    </pattern>
  {:else if p.type === "gemelles"}
    <pattern id={p.id} width={.125 * p.mod} height={.5 * p.mod} viewBox="0 0 25 100">
      <rect x=0 y=0 width=25 height=100 fill={$colors[p.t2]}/>
      <rect x=0 y=35 width=25 height=10 fill={$colors[p.t1]}/>
      <rect x=0 y=55 width=25 height=10 fill={$colors[p.t1]}/>
    </pattern>
  {:else if p.type === "bendy"}
    <pattern id={p.id} width={.36 * p.mod} height={.36 * p.mod} viewBox="0 0 50 50" patternTransform="rotate(45)">
      <rect x=0 y=0 width=50 height=50 fill={$colors[p.t2]}/>
      <line x1=0 y1=37.5 x2=50 y2=37.5 stroke={$colors[p.t1]} stroke-width=25 />
    </pattern>
  {:else if p.type === "bendySinister"}
    <pattern id={p.id} width={.36 * p.mod} height={.36 * p.mod} viewBox="0 0 50 50" patternTransform="rotate(-45)">
      <rect x=0 y=0 width=50 height=50 fill={$colors[p.t2]}/>
      <line x1=0 y1=37.5 x2=50 y2=37.5 stroke={$colors[p.t1]} stroke-width=25 />
    </pattern>
  {:else if p.type === "palyBendy"}
    <pattern id={p.id} width={.125 * p.mod} height={.25 * p.mod} viewBox="0 0 50 100" patternTransform="translate(22,44) rotate(-26.5)">
      <rect x=0 y=0 width=50 height=100 fill={$colors[p.t1]}/>
      <polygon points="25,0 50,50 25,100 0,50" fill={$colors[p.t2]}/>
    </pattern>
  {:else if p.type === "pappellony"}
    <pattern id={p.id} width={.125 * p.mod} height={.125 * p.mod} viewBox="0 0 100 100">
      <rect x=0 y=0 width=100 height=100 fill={$colors[p.t1]}/>
      <circle cx=0 cy=51 r=45 stroke={$colors[p.t2]} fill={$colors[p.t1]} stroke-width=10></circle>
      <circle cx=100 cy=51 r=45 stroke={$colors[p.t2]} fill={$colors[p.t1]} stroke-width=10></circle>
      <circle cx=50 cy=1 r=45 stroke={$colors[p.t2]} fill={$colors[p.t1]} stroke-width=10></circle>
    </pattern>
  {:else if p.type === "masoned"}
    <pattern id={p.id} width={.125 * p.mod} height={.125 * p.mod} viewBox="0 0 100 100" fill="none">
      <rect x=0 y=0 width=100 height=100 fill={$colors[p.t1]}/>
      <rect x=0 y=0 width=100 height=50 stroke={$colors[p.t2]} stroke-width=4 />
      <line x1=50 y1=50 x2=50 y2=100 stroke={$colors[p.t2]} stroke-width=5 />
    </pattern>
  {:else if p.type === "fretty"}
    <pattern id={p.id} width={.28 * p.mod} height={.28 * p.mod} viewBox="0 0 200 200" patternTransform="translate(-19,21) rotate(45)" stroke="#000" stroke-width=2>
      <rect x=0 y=0 width=200 height=200 stroke="none" fill={$colors[p.t1]}/>
      <rect x=0 y=35 width=200 height=30 stroke="none" fill={$colors[p.t2]}/>
      <rect x=0 y=135 width=200 height=30 stroke="none" fill={$colors[p.t2]}/>
      <rect x=35 y=0 width=30 height=200 stroke="none" fill={$colors[p.t2]}/>
      <rect x=135 y=0 width=30 height=200 stroke="none" fill={$colors[p.t2]}/>
      <line x1=0 y1=35 x2=35 y2=35 /><line x1=0 y1=65 x2=35 y2=65 />
      <line x1=35 y1=165 x2=35 y2=200 /><line x1=65 y1=165 x2=65 y2=200 />
      <line x1=135 y1=0 x2=135 y2=35 /><line x1=165 y1=0 x2=165 y2=35 />
      <line x1=135 y1=65 x2=135 y2=200 /><line x1=165 y1=65 x2=165 y2=200 />
      <line x1=35 y1=0 x2=35 y2=135 /><line x1=65 y1=0 x2=65 y2=135 />
      <line x1=65 y1=35 x2=200 y2=35 /><line x1=65 y1=65 x2=200 y2=65 />
      <line x1=0 y1=135 x2=135 y2=135 /><line x1=0 y1=165 x2=135 y2=165 />
      <line x1=165 y1=135 x2=200 y2=135 /><line x1=165 y1=165 x2=200 y2=165 />
    </pattern>
  {/if}
{/each}