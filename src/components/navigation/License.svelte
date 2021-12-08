<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {fade} from "svelte/transition";
  import {shield, state} from "data/stores";
  import {capitalize, link} from "scripts/utils";

  const wetaShield = (shield: string) => ["noldor", "gondor", "easterling", "ironHills", "urukHai", "moriaOrc"].includes(shield);

  const coas = Array.from(document.querySelectorAll("svg.coa"));
  const charges = coas.map(coa => Array.from(coa.querySelectorAll(".charge[charge]")).map(el => el.getAttribute("charge"))).flat();

  // translation-related constants
  const noLicenseData = $t("license.noLicenseData");
  const noSourceData = $t("license.noSourceData");
  const publicDomain = $t("license.publicDomain");
  const fairUse = $t("license.fairUse");

  // links
  const armoriaGitHub = link("https://github.com/Azgaar/Armoria", "Azgaar");
  const ccBy = link("https://creativecommons.org/licenses/by/4.0/", "CC BY 4.0");
  const fontAwesome = link("https://fontawesome.com/license/free", "Font Awesome");

  const chargeData = [...new Set(charges)]
    .map(charge => {
      const el = document.getElementById(charge);
      const licenseURL = el.getAttribute("license");
      const licenseName = getLicenseName(licenseURL);
      const sourceURL = el.getAttribute("source");
      const author = el.getAttribute("author") || (sourceURL ? new URL(sourceURL).host : null);

      const license = licenseURL && licenseName ? link(licenseURL, licenseName) : noLicenseData;
      const source = sourceURL ? link(sourceURL, author) : author || noSourceData;

      return {charge: capitalize(charge), license, source};
    })
    .sort((a, b) => (a.license < b.license ? -1 : 1));

  const isLicenseSame = [...new Set(chargeData.map(d => [d.license, d.source].join(",")))].length === 1;
  const charge = isLicenseSame ? chargeData[0] : null;

  // get mainly Creative Commons short names from license link
  function getLicenseName(license: string) {
    if (!license) return null;
    if (license.includes("publicdomain")) return publicDomain;
    if (license.includes("by-nc-sa")) return "CC BY-NC-SA";
    if (license.includes("by-nc-nd")) return "CC BY-NC-ND";
    if (license.includes("by-nc")) return "CC BY-NC";
    if (license.includes("by-nd")) return "CC BY-ND";
    if (license.includes("by-sa")) return "CC BY-SA";
    if (license.includes("by")) return "CC BY";
    if (license.includes("Fair")) return fairUse;
    return license;
  }
</script>

<div id="license" transition:fade>
  <span on:click={() => ($state.license = 0)} class="close">&times;</span>

  <div id="licenseContainer">
    <h1>{$t("license.armoriaLicense")}</h1>

    {#if chargeData.length}
      <hr />
      <h2>{$t("license.currentCoas")}</h2>
    {/if}

    {#if isLicenseSame}
      <h3>{chargeData.length > 1 ? $t("license.charges") : charge.charge}: {@html charge.license}, {@html charge.source}</h3>
    {:else}
      <div class="chargesList">
        {#each chargeData as {charge, license, source}}
          <div>{charge}: {@html license}, {@html source}</div>
        {/each}
      </div>
    {/if}

    {#if wetaShield($shield)}
      <p>{@html $t("license.wetaShield")}</p>
    {/if}

    <hr />
    <h2>{$t("license.code")}: MIT License, {@html armoriaGitHub}</h2>
    <p>{$t("license.textMain")}</p>
    <p>{$t("license.textRest")}</p>

    <hr />
    <h2>{$t("license.icons")}: {@html ccBy}, {@html fontAwesome}</h2>
    <br />
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
    transition: 0.5s;
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

  #licenseContainer {
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
    content: "§";
    position: relative;
    top: -12px;
  }

  span.close {
    position: fixed;
    top: 0em;
    right: 0.5em;
    font-size: 4em;
    padding: 0.2em 0;
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
