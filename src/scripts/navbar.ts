import {get} from "svelte/store";
import {iconedNav} from "data/stores";

const MIN_WIDTH = 1072;

export const checkForIconedNav = () => {
  const isIconed = get(iconedNav);
  const makeIconed = window.innerWidth < MIN_WIDTH;
  if (isIconed !== makeIconed) iconedNav.set(makeIconed);
};

checkForIconedNav();
