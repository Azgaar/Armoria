<script>
  export let checked = false;
  const id = "switch" + Math.floor(1e6 * Math.random());
</script>

<div class=switch>
  <input id={id} class=switch-input type=checkbox bind:checked/>
  <label for={id} class=switch-label>Switch</label>
</div>

<style>
  .switch {
    position: relative;
    display: inline-block;
    top: -5px;
  }

  .switch-input {
    display: none;
  }

  .switch-label {
    display: block;
    width: 48px;
    height: 24px;
    color: transparent;
  }

  .switch-label::before, .switch-label::after {
    content: "";
    display: block;
    position: absolute;
    cursor: pointer;
  }

  .switch-label::before {
    width: 100%;
    height: 100%;
    background-color: #dedede;
    border-radius: 9999em;
    -webkit-transition: background-color 0.25s ease;
    transition: background-color 0.25s ease;
  }

  .switch-label::after {
    top: 0;
    left: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.45);
    -webkit-transition: left 0.25s ease;
    transition: left 0.25s ease;
  }

  .switch-input:checked + .switch-label::before {
    background-color: #89c12d;
  }

  .switch-input:checked + .switch-label::after {
    left: 24px;
  }
</style>