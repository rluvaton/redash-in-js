// removes all the color characters from a string
function stripColors(str) {
  return str.split(/\u001b\[(?:\d*;){0,5}\d*m/g).join("");
}

module.exports = {
  colorEnabled: process.env.COLORS_DISABLED == null,
  stripColors,
};
