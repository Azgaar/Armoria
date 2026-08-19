<script lang="ts">
  // @ts-check
  export let value: number;
  export let oninput: (value: number) => void;
  export let min: number = 0;
  export let max: number = Infinity;
  export let step: number = 1;

  const handleInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    oninput(+value);
  };
</script>

<input type="range" {min} {max} {step} {value} on:input={handleInput} />
<input type="number" {min} {max} {step} {value} on:input={handleInput} />

<style>
  input[type="range"] {
    padding: 0;
    width: 72%;
    margin: 0;
    height: 0.6em;
    cursor: pointer;
  }

  input[type="number"] {
    position: absolute;
    padding: 2px;
    margin: -0.25em 0;
    right: 0.4em;
    width: 3em;
    border: 0;
  }
</style>
