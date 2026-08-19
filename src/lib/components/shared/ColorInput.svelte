<script lang="ts">
  // @ts-check
  export let value: string;
  export let oninput: (value: string) => void;

  const handleInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    oninput(value);
  };
</script>

<input type="color" {value} on:input={handleInput} />

<style>
  input[type="color"] {
    position: absolute;
    padding: 0;
    margin: -0.3em 0;
    right: 0.4em;
    border: 0;
    width: 3em;
    cursor: pointer;
  }
</style>
