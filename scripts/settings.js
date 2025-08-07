import { MODULE_ID } from "./main.js";
import { updateRealRollMode } from "./config.js";
import { RealDiceConfig } from "./realDiceConfig.js";

export function registerSettings() {
  const settings = {
    gmOnly: {
      name: `${MODULE_ID}.settings.gmOnly.name`,
      hint: `${MODULE_ID}.settings.gmOnly.hint`,
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    },
    manualRollMode: {
      name: `${MODULE_ID}.settings.manualRollMode.name`,
      hint: `${MODULE_ID}.settings.manualRollMode.hint`,
      scope: "client",
      config: true,
      type: Number,
      default: 0,
      choices: {
        0: `${MODULE_ID}.settings.manualRollMode.choices.0`,
        1: `${MODULE_ID}.settings.manualRollMode.choices.1`,
      },
      onChange: () => updateRealRollMode(),
    },
    enableTotalBox: {
      name: `${MODULE_ID}.settings.enableTotalBox.name`,
      hint: `${MODULE_ID}.settings.enableTotalBox.hint`,
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    },
    showFormula: {
      name: `${MODULE_ID}.settings.showFormula.name`,
      hint: `${MODULE_ID}.settings.showFormula.hint`,
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    },
    disableInCombat: {
      name: `${MODULE_ID}.settings.disableInCombat.name`,
      hint: `${MODULE_ID}.settings.disableInCombat.hint`,
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    },
    position: {
      name: `${MODULE_ID}.settings.position.name`,
      hint: `${MODULE_ID}.settings.position.hint`,
      scope: "world",
      config: true,
      type: String,
      default: "default",
      choices: {
        default: `${MODULE_ID}.settings.position.choices.default`,
        chat: `${MODULE_ID}.settings.position.choices.chat`,
      },
    },
    showMessage: {
      name: `${MODULE_ID}.settings.showMessage.name`,
      hint: `${MODULE_ID}.settings.showMessage.hint`,
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    },
    showMessagePlayers: {
      name: `${MODULE_ID}.settings.showMessagePlayers.name`,
      hint: `${MODULE_ID}.settings.showMessagePlayers.hint`,
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    },
  };

  registerSettingsArray(settings);

  RealDiceConfig.register();
}

export function getSetting(key) {
  return game.settings.get(MODULE_ID, key);
}

export async function setSetting(key, value) {
  return await game.settings.set(MODULE_ID, key, value);
}

function registerSettingsArray(settings) {
  for (const [key, value] of Object.entries(settings)) {
    game.settings.register(MODULE_ID, key, value);
  }
}
