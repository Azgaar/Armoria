<script>
  import {state, shield} from './../../data/stores';
  import {fade} from 'svelte/transition';

  const wetaShield = shield => ["noldor", "gondor", "easterling", "ironHills", "urukHai", "moriaOrc"].includes(shield);

  const coas = Array.from(document.querySelectorAll("svg.coa"));
  const charges = coas.map(coa => Array.from(coa.querySelectorAll(".charge[charge]")).map(el => el.getAttribute("charge"))).flat();
  const chargeData = [...new Set(charges)].map(charge => {
    const el = document.getElementById(charge);
    const license = el.getAttribute("license");
    const licenseName = license ? getLicenseName(license) : null;
    const source = el.getAttribute("source");
    let author = el.getAttribute("author");
    if (source && !author) author = new URL(source).host;

    return {charge: cap(charge), license, licenseName, author, source}
  }).sort((a, b) => a.licenseName < b.licenseName ? -1 : 1);
  const sameChargeLicense = [...new Set(chargeData.map(d => [d.license, d.author].join(",")))].length === 1;

  // get mainly Creative Commons short names from license link
  function getLicenseName(license) {
    if (license.includes("publicdomain")) return "public domain";
    if (license.includes("by-nc-sa")) return "CC BY-NC-SA";
    if (license.includes("by-nc-nd")) return "CC BY-NC-ND";
    if (license.includes("by-nc")) return "CC BY-NC";
    if (license.includes("by-nd")) return "CC BY-ND";
    if (license.includes("by-sa")) return "CC BY-SA";
    if (license.includes("by")) return "CC BY";
    if (license.includes("Fair")) return "fair use";
    return license;
  }

  function cap(string) {
    return string
      .replace(/_/g, " ")
      .replace(/(?<!_)(?=[A-Z])/g, " ")
      .replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());
  }

  function link(url, text) {
    return `<a target=_blank href="${url}">${text}</a>`;
  }
</script>

<div id="license" transition:fade>
  <span on:click={() => $state.license = 0} class="close">&times;</span>
  <div id="licenseCont">
    <h1>Armoria License</h1>
    <hr>

    <h2>Currently displayed Coat of Arms</h2>
      {#if sameChargeLicense}
        <h3>
          {#if chargeData.length > 1}Charges: 
          {:else}{chargeData[0].charge}: {/if}
          {#if chargeData[0].license}<a href="{chargeData[0].license}">{chargeData[0].licenseName}</a>{:else}no license data{/if},
          {#if chargeData[0].source}<a href="{chargeData[0].source}">{chargeData[0].author}</a>
          {:else if chargeData[0].author}{chargeData[0].author}
          {:else}no source data{/if}
        </h3>
      {:else}
        <div class="chargesList">
        {#each chargeData as charge}
          <div>{charge.charge}: 
            {#if charge.license}<a href="{charge.license}">{charge.licenseName}</a>{:else}no license data{/if},
            {#if charge.source}<a href="{charge.source}">{charge.author}</a>{:else if charge.author}{charge.author}{:else}no source data{/if}
          </div>
        {/each}
        </div>
    {/if}

    {#if wetaShield($shield)}
    <p>
      As per my information, shield shape close to <i>{cap($shield)}</i> is designed for the Lord of the Rings film series by <a target=_blank href="www.wetanz.com">Weta Workshop</a>.
      The shape itself is drawn by Azgaar, but as design itself may be protected and owned by {@html link("https://www.middleearth.com", "Middle-earth Enterprises")} or {@html link("https://www.warnerbros.com/company/divisions/motion-pictures", "New Line Productions")}, it is recommended to not use this shape for any purposes outside of the {@html link("https://en.wikipedia.org/wiki/Fair_use", "fair use")} concept.
    </p>
    {/if}

    <hr>
    <h2>Code: MIT License, {@html link("https://github.com/Azgaar/Armoria", "Azgaar")}</h2>
    <p>
      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    </p>
    <p>
      The software is provided "As is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
    </p>

    <hr>
    <h2>Icons: {@html link("https://creativecommons.org/licenses/by/4.0", "CC BY 4.0")}, {@html link("https://fontawesome.com/license/free", "Font Awesome")}</h2>
    <br>
  </div>
</div>

<style>
  #license {
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    background-color: #000000e6;
    transition: .5s;
    color: #ddd;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
    scrollbar-width: thin;
  }

  #license::-webkit-scrollbar {
    width: 6px;
    background-color: #cccccc80;
  }

  #license::-webkit-scrollbar-thumb {
    background-color: #111;
  }

  #licenseCont {
    width: 90%;
    max-width: 800px;
    max-height: 100%;
  }

  hr {
    border: none;
    border-top: 3px double #333;
    color: #333;
    overflow: visible;
    text-align: center;
    height: 5px;
  }

  hr:after {
    content: '§';
    position: relative;
    top: -12px;
  }

  span.close {
    position: fixed;
    top: 0em;
    right: .5em;
    font-size: 4em;
    padding: .2em 0;
    z-index: 2;
    cursor: pointer;
  }

  .chargesList {
    column-count: 2;
    column-gap: 7em;
    text-align: left;
    margin: 0 2em;
  }

  @media only screen and (orientation: portrait) {
    .chargesList {
      column-gap: normal;
      text-align: center;
    }
  }
</style>