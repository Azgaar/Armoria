<script>
  import {quartInOut} from 'svelte/easing';
  import COA from './COA.svelte';
  export let edit, grad, diaper, shield, colors, border, borderWidth;

  const min = Math.min(window.innerWidth, window.innerHeight);
  const ratio = window.innerHeight / window.innerWidth;
  const s = Math.round(min * .9);
  const width = window.innerWidth < 600 || ratio > 1 ? 100 : Math.round((1.05 - ratio) * 100); // 56.25;
  const height = width === 100 ? null : "100%";

  function rolling(node, {duration = 1000}) {
    return {duration, css: t => `width: ${quartInOut(t) * width}%`}
  }

  function showSection(e) {
    if (e.target.tagName !== "DIV") return;
    e.target.classList.toggle("expanded");
    const panel = e.target.nextElementSibling;
    if (panel.style.maxHeight) panel.style.maxHeight = null;
    else panel.style.maxHeight = panel.scrollHeight + "px";
  }
</script>

<div id="editor">
  <COA {edit} c={edit.c} i={edit.i} w={s} h={s} {grad} {diaper} {shield} {colors} {border} {borderWidth}/>
  <div id="menu" in:rolling style="width:{width}%; height:{height}">
    <ul on:click={showSection}>
      <div class="section" class:expanded={false}>Field</div>
      <div class="panel">
        <svg id="coa8" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#fafafa"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="annulet" stroke="#000"><use href="#annulet" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#d7374a"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa9" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#d7374a"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="sword" stroke="#000"><use href="#sword" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#fafafa"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa16" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#ffe066"></rect><g class="ordinary svelte-16j86ru" transform-origin="center" fill="#d7374a"><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,-25)"></path><rect x="0" y="90" width="200" height="20"></rect><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,25) rotate(180.00001)" transform-origin="center"></path></g><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="raven" stroke="#000"><use href="#raven" transform="translate(-43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, 62.5) scale(0.4)" transform-origin="center" fill="#333333"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa8" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#fafafa"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="annulet" stroke="#000"><use href="#annulet" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#d7374a"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa9" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#d7374a"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="sword" stroke="#000"><use href="#sword" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#fafafa"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa16" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#ffe066"></rect><g class="ordinary svelte-16j86ru" transform-origin="center" fill="#d7374a"><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,-25)"></path><rect x="0" y="90" width="200" height="20"></rect><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,25) rotate(180.00001)" transform-origin="center"></path></g><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="raven" stroke="#000"><use href="#raven" transform="translate(-43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, 62.5) scale(0.4)" transform-origin="center" fill="#333333"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa8" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#fafafa"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="annulet" stroke="#000"><use href="#annulet" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#d7374a"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa9" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#d7374a"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="sword" stroke="#000"><use href="#sword" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#fafafa"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa16" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#ffe066"></rect><g class="ordinary svelte-16j86ru" transform-origin="center" fill="#d7374a"><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,-25)"></path><rect x="0" y="90" width="200" height="20"></rect><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,25) rotate(180.00001)" transform-origin="center"></path></g><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="raven" stroke="#000"><use href="#raven" transform="translate(-43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, 62.5) scale(0.4)" transform-origin="center" fill="#333333"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
      </div>
      <div class="section">Division</div>
      <div class="panel">
        <svg id="coa8" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#fafafa"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="annulet" stroke="#000"><use href="#annulet" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#d7374a"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa9" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#d7374a"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="sword" stroke="#000"><use href="#sword" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#fafafa"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa16" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#ffe066"></rect><g class="ordinary svelte-16j86ru" transform-origin="center" fill="#d7374a"><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,-25)"></path><rect x="0" y="90" width="200" height="20"></rect><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,25) rotate(180.00001)" transform-origin="center"></path></g><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="raven" stroke="#000"><use href="#raven" transform="translate(-43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, 62.5) scale(0.4)" transform-origin="center" fill="#333333"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
      </div>
      <div class="section">Ordinary</div>
      <div class="panel">
        <svg id="coa8" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#fafafa"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="annulet" stroke="#000"><use href="#annulet" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#d7374a"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa9" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#d7374a"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="sword" stroke="#000"><use href="#sword" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#fafafa"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa16" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#ffe066"></rect><g class="ordinary svelte-16j86ru" transform-origin="center" fill="#d7374a"><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,-25)"></path><rect x="0" y="90" width="200" height="20"></rect><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,25) rotate(180.00001)" transform-origin="center"></path></g><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="raven" stroke="#000"><use href="#raven" transform="translate(-43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, 62.5) scale(0.4)" transform-origin="center" fill="#333333"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
      </div>
      <div class="section">Charge</div>
      <div class="panel">
        <svg id="coa8" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#fafafa"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="annulet" stroke="#000"><use href="#annulet" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#d7374a"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa9" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#d7374a"></rect><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="sword" stroke="#000"><use href="#sword" transform="translate(0, 0) scale(1.5)" transform-origin="center" fill="#fafafa"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
        <svg id="coa16" class="coa" xmlns="http://www.w3.org/2000/svg" width="192" height="231" viewBox="0 0 200 200"><defs></defs><g id="shield" clip-path="url(#heater)"><rect id="field" x="0" y="0" width="200" height="200" fill="#ffe066"></rect><g class="ordinary svelte-16j86ru" transform-origin="center" fill="#d7374a"><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,-25)"></path><rect x="0" y="90" width="200" height="20"></rect><path d="m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200" transform="translate(0,25) rotate(180.00001)" transform-origin="center"></path></g><rect class="diaper svelte-1i16020" x="0" y="0" width="200" height="200" fill="url(#nourse)"></rect><g class="charge svelte-16j86ru" i="0" charge="raven" stroke="#000"><use href="#raven" transform="translate(-43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(43.75, -50) scale(0.4)" transform-origin="center" fill="#333333"></use><use href="#raven" transform="translate(0, 62.5) scale(0.4)" transform-origin="center" fill="#333333"></use></g></g><path class="grad svelte-1i16020" d="m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z" fill="url(#luster)" stroke="#333333" stroke-width="2"></path></svg>
      </div>
    </ul>
  </div>
</div>

<style>
  #editor {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    user-select: none;
  }

  #menu {
    position: fixed;
    top: 45px;
    right: 0;
    background-color: #11111180;
    overflow-x: hidden;
    transition: .5s;
  }

  ul {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .section {
    padding: 1em 1.14em;
    color: #fff;
    background-color: #131313;
    cursor: pointer;
    transition: background-color .1s ease;
  }

  .section:hover {
    background-color: #2d2e2f;
  }

  .section:before {
    content: "\276F";
    transition: .2s ease-out;
    margin-top: -.1em;
    position: absolute;
    right: 1em;
  }

  .expanded:before {
    transform: rotate(90deg);
  }

  .panel {
    max-height: 0;
    min-width: 100%;
    max-width: max-content;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    transition: max-height .2s ease-out;
    background-color: #13131320;
    scrollbar-width: thin;
  }

  .panel::-webkit-scrollbar {
    height: 5px;
    background-color: #ccc;
  }

  .panel::-webkit-scrollbar-thumb {
    background-color: #222;
  }
</style>