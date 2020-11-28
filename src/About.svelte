<script>
  import {state} from './stores';
</script>

<div id="about">
    <div class="overlay-content">
    <span on:click={() => $state.about = 0} class="close">&times;</span>
    <span>About</span>
    <span>Services</span>
    <span>Clients</span>
    <span>Contact</span>
  </div>
</div>

<style>
  #about {
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    background-color: rgba(0,0,0, 0.9);
    transition: .5s;
  }

  .overlay-content {
    position: relative;
    top: 100%;
    margin-top: -35%;
    text-align: center;
    user-select: none;
  }

  #about span {
    display: block;
    cursor: pointer;
    padding: .4em;
    font-size: 2.2em;
    color: #818181;
  }

  #about span:hover {
    color: #f1f1f1;
  }

  #about span.close {
    position: fixed;
    top: 0em;
    right: .5em;
    font-size: 4em;
  }

  @media screen and (max-height: 450px) {
    #about span {font-size: 1em}
    #about .close {
      font-size: 2em;
      top: 1ex;
      right: 2em;
    }
  }
</style>
