<script lang="ts">
  // @ts-check
  export let value: number;
  export let oninput: (newValue: number) => void;
  export let right: boolean = false;
  export let min: number = 0;
  export let max: number = Infinity;
  export let step: number = 1;

  const handleInput = ({target}: Event) => {
    const value = (target as HTMLInputElement).value;
    oninput(+value);
  };
</script>

<input class:right type="number" {min} {max} {step} {value} on:input={handleInput} />

<style>
  input[type="number"] {
    padding: 0 0 0 3px;
    width: 25%;
    margin: 0;
    border: 0;
  }

  input[type="number"].right {
    position: absolute;
    padding: 2px;
    margin: -0.25em 0;
    right: 0.4em;
    width: 3em;
  }
</style>
