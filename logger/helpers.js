// removes all the color characters from a string
export function stripColors(str) {
  return str.split(/\u001b\[(?:\d*;){0,5}\d*m/g).join("");
}

export const colorEnabled = process.env.COLORS_DISABLED == null;
export const disableValueTrunk = process.env.VALUE_TRUNK_DISABLED == 'true';
