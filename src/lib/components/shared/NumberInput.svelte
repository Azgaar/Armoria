<script lang="ts">
  // @ts-check
  let {
    value,
    oninput,
    min = 0,
    max = Infinity,
    step = 1
  }: {
    value: number;
    oninput: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
  } = $props();

  const handleInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    oninput(+value);
  };
</script>

<input type="number" {min} {max} {step} {value} oninput={handleInput} />

<style>
  input[type="number"] {
    position: absolute;
    padding: 2px;
    margin: -0.25em 0;
    right: 0.4em;
    width: 3em;
    border: 0;
  }
</style>
