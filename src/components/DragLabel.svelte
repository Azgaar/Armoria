<script lang="ts">
    import { drag } from "scripts/drag";

   export let coaEl
   export let coa
   export let value 
   let startVal = 0
   let startPos = 0

   const startDragging = (event: Event) => {
    // no need to check for edit?
    drag(event, coaEl, coa,  {move: false, resize: true, rotate: false}, coaEl.element);

   }

</script>

<span class="DragLabel" on:mousedown={startDragging}>
    <slot />
</span>

<style>
    .DragLabel {
        cursor:ns-resize
    }
</style>