import { RealRoll } from "./app.js";
import { getSetting } from "./settings.js";

export async function _evaluate(wrapped, ...args) {
  if (getSetting("manualRollMode") != 0)
    await RealRoll.prompt(this.terms, this);
  return wrapped(...args);
}
