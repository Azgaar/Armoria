<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";

  export let license;
</script>

<select bind:value={license} style="width: 10em">
  <option value="Unknown" selected>{$t(`license.unknown`)}</option>
  <option value="Proprietary">{$t(`license.proprietary`)}</option>
  <option value="Copyright Free">{$t(`license.copyleft`)}</option>
  <option value="https://creativecommons.org/publicdomain/zero/1.0">{$t(`license.publicDomain`)}</option>
  <option value="https://creativecommons.org/licenses/by/4.0">CC BY</option>
  <option value="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA</option>
  <option value="https://creativecommons.org/licenses/by-nc/4.0">CC BY-NC</option>
  <option value="https://creativecommons.org/licenses/by-nd/4.0">CC BY-ND</option>
  <option value="https://creativecommons.org/licenses/by-nc-sa/4.0">CC BY-NC-SA</option>
  <option value="https://creativecommons.org/licenses/by-nc-nd/4.0">CC BY-NC-ND</option>
</select>
