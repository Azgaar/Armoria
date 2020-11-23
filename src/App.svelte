<script>
	export let size, grad, diaper, shield, colors, background, scale, border, borderWidth;

	import Navbar from './Navbar.svelte';
	import About from './About.svelte';
	import Editor from './Editor.svelte';
	import Gallery from './Gallery.svelte';
	import Patterns from './Patterns.svelte';

	let n, w, h, showAbout = 0, edit = {on: 0};
	let matrix = 0, matrices = [[]], coas = [];
	let patterns = window.patterns;

	$: {
		[n, w, h] = defineGallerySize(size);

		const l = Armoria.history.length;
		if (!matrices[matrix]) {
			if (edit.on) {
				// generate new coa
				matrices[matrix] = matrices[matrix-1].slice();
				matrices[matrix][edit.i] = l;
			} else {
				// reroll gallery
				matrices[matrix] = Array.from({length: n}, (_, i) => l+i++);
			}
		}

		// update coa being edited
		if (edit.on) edit.c = matrices[matrix][edit.i];

		if (matrices[matrix].length < n) {
			// add additional coas to matrix if size is smaller
			const m = matrices[matrix];
			matrices[matrix] = [...Array(n).keys()].map(i => m[i] || l+i);
		}

		coas = matrices[matrix].slice(0, n);
		console.log(`matrix update ${matrix}: ${matrices[matrix]}`);
		patterns = window.patterns;
	};

  // define number and size of coas to display
  function defineGallerySize(desiredSize) {
    const width = window.innerWidth;
    const height = window.innerHeight - 60;
    const numberX = Math.ceil(width / desiredSize);
    const w = Math.floor(width / numberX);
    const numberY = Math.floor(height / w);
    const h = Math.floor(height / numberY);
    return [numberX * numberY, w, h];
	}
</script>

<main style="background-color: {background}">
	<Navbar bind:matrix bind:size bind:grad bind:diaper bind:shield bind:colors bind:background bind:scale bind:border bind:borderWidth bind:showAbout/>
	<About bind:showAbout/>
	{#if edit.on}
		{#key edit.c}
			<Editor c={edit.c} {edit} {grad} {diaper} {shield} {colors} {border} {borderWidth}/>
			{/key}
	{:else}
		<Gallery bind:matrices bind:matrix bind:edit {coas} {w} {h} {grad} {diaper} {shield} {colors} {scale} {border} {borderWidth}/>
	{/if}
	<div id="patterns" style="position: absolute">
		<svg width=0 height=0 xmlns="http://www.w3.org/2000/svg">
			<defs>
				<Patterns {patterns} {colors}/>
			</defs>
		</svg>
	</div>
</main>

<style>
	main {
		background-image: url("data:image/svg+xml,%3Csvg width='84' height='84' viewBox='0 0 84 84' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23222' fill-opacity='.2'%3E%3Cpath d='M84 23c-4.417 0-8-3.584-8-7.998V8h-7.002C64.58 8 61 4.42 61 0H23c0 4.417-3.584 8-7.998 8H8v7.002C8 19.42 4.42 23 0 23v38c4.417 0 8 3.584 8 7.998V76h7.002C19.42 76 23 79.58 23 84h38c0-4.417 3.584-8 7.998-8H76v-7.002C76 64.58 79.58 61 84 61V23zM59.05 83H43V66.95c5.054-.5 9-4.764 9-9.948V52h5.002c5.18 0 9.446-3.947 9.95-9H83v16.05c-5.054.5-9 4.764-9 9.948V74h-5.002c-5.18 0-9.446 3.947-9.95 9zm-34.1 0H41V66.95c-5.053-.502-9-4.768-9-9.948V52h-5.002c-5.184 0-9.447-3.946-9.95-9H1v16.05c5.053.502 9 4.768 9 9.948V74h5.002c5.184 0 9.447 3.946 9.95 9zm0-82H41v16.05c-5.054.5-9 4.764-9 9.948V32h-5.002c-5.18 0-9.446 3.947-9.95 9H1V24.95c5.054-.5 9-4.764 9-9.948V10h5.002c5.18 0 9.446-3.947 9.95-9zm34.1 0H43v16.05c5.053.502 9 4.768 9 9.948V32h5.002c5.184 0 9.447 3.946 9.95 9H83V24.95c-5.053-.502-9-4.768-9-9.948V10h-5.002c-5.184 0-9.447-3.946-9.95-9zM50 50v7.002C50 61.42 46.42 65 42 65c-4.417 0-8-3.584-8-7.998V50h-7.002C22.58 50 19 46.42 19 42c0-4.417 3.584-8 7.998-8H34v-7.002C34 22.58 37.58 19 42 19c4.417 0 8 3.584 8 7.998V34h7.002C61.42 34 65 37.58 65 42c0 4.417-3.584 8-7.998 8H50z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
	}
</style>
