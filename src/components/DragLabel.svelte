<script lang="ts">
   export let value 
   let startVal = 0
   let startPos = 0

   const startDragging = (event: MouseEvent) => {
    startVal = value 
    startPos = event.clientX

    document.addEventListener("mousemove", dragging)
    document.addEventListener("mouseup", endDragging)
   }

   const dragging = (event:MouseEvent) => {
    if(startVal){
        value = startVal + (event.clientX - startPos) /100
    }
   }

   const endDragging = () => {
    startVal = 0

    document.removeEventListener("mousemove", dragging)
    document.removeEventListener("mouseup", endDragging)
   }
</script>

<span class="DragLabel" on:mousedown={startDragging}>
    <slot />
</span>

<style>
    .DragLabel {
        cursor:ew-resize
    }
</style>