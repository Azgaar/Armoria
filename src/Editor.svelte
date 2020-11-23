<script>
  import COA from './COA.svelte';
  export let c, edit, grad, diaper, shield, colors, border, borderWidth;

  let s = Math.min(window.innerWidth, window.innerHeight * .9);
</script>

<div id="editContainer">
  <COA edit={true} {c} i={edit.i} w={s} h={s} {grad} {diaper} {shield} {colors} {border} {borderWidth}/>
</div>

<style>
  #editContainer {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }
</style>