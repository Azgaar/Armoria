import type {ChancesObject, Tinctures} from "types/tinctures";

export const validateTinctures = (tinctures: Tinctures) => {
  const mandatoryElements = ["field", "division", "charge"];
  const mandatoryTypes = ["metals", "colours"];

  try {
    for (const element of mandatoryElements) {
      if (!tinctures[element]) throw new Error(`Missing ${element}`);

      for (const type of mandatoryTypes) {
        if (!tinctures[element][type]) throw new Error(`Missing ${type} in ${element}`);
      }
    }

    for (const type of mandatoryTypes) {
      if (!tinctures[type]) throw new Error(`Missing ${type}`);

      const keys = Object.keys(tinctures[type]);
      if (keys.length < 2) throw new Error(`Type ${type} must have more than 2 tinctures`);

      const totalChance = Object.values(tinctures[type] as ChancesObject).reduce((a, b) => a + b, 0);
      if (totalChance < 1) throw new Error(`Total chance for type ${type} must be more that zero`);
    }

    return true;
  } catch (err) {
    console.error("Invalid stored tinctures data, switching to defaults.", err.message, tinctures);
    return false;
  }
};
