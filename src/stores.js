import {writable} from 'svelte/store';

const initialOptions = defineInitialOptions();
function defineInitialOptions() {
	// apply stored options
	const storedLocally = localStorage.getItem("Armoria");
	if (storedLocally) return JSON.parse(storedLocally);

	// set default options
	const options = {size: 200, diaper: "nourse"};
	if (!options.grad) options.grad = ra(["luster", "spotlight", "backlight"]);
	if (!options.shield) options.shield = rw({heater:60, oldFrench:20, spanish:30, french:5, swiss:2, wedged:2, italian:1, renaissance:1, baroque:1, polish:1, round:1, square:1, vesicaPiscis:1});
	if (!options.colors) options.colors = getDefaultColors();
	if (!options.border) options.border = "#333333";
	if (!options.borderWidth) options.borderWidth = 1;
	if (!options.background) options.background = "#333333";
	if (!options.scale) options.scale = 1;
	return options;
}

export const options = writable(initialOptions);