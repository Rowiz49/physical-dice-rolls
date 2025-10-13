import { MODULE_ID } from "./main.js";
import { _evaluate } from "./evaluateRoll.js";
import { getSetting, setSetting } from "./settings.js";

const REAL_ROLL_MODE_ICONS = {
  0: "fas fa-square-xmark",
  1: "fas fa-dice",
};

export function initConfig() {
  registerKeyBindings();

  libWrapper.register(
    MODULE_ID,
    "Roll.prototype._evaluate",
    _evaluate,
    "WRAPPER"
  );



  Hooks.on("renderModuleManagement", (app, html, data) => {
    if (getSetting("gmOnly") && !game.user.isGM) {
      html[0]
        .querySelectorAll(`[data-module-id="physical-dice-rolls"]`)
        .forEach((el) => {
          el.style.display = "none";
        });
    }
  });
}

function registerKeyBindings() {
  game.keybindings.register(MODULE_ID, "toggleRollMode", {
    name: `${MODULE_ID}.keybindings.toggleRollMode.name`,
    editable: [
      {
        key: "KeyR",
        modifiers: [
          foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS.SHIFT,
        ],
      },
    ],
    restricted: false,
    onDown: () => {},
    onUp: () => {
      const currentRollMode = getSetting("manualRollMode");
      const realRollMode = (currentRollMode + 1) % 2;
      setSetting("manualRollMode", realRollMode);
    },
  });
}

export function updateRealRollMode(el) {
  if (!el) {
    const buttons = document.querySelectorAll(".real-roll-mode-toggle");
    buttons.forEach((button) => updateRealRollMode(button));
    return;
  }
  const realRollMode = getSetting("manualRollMode");
  const tooltipText = game.i18n.localize(
    `${MODULE_ID}.buttons.realRollToggle.tooltips.${realRollMode}`
  );
  el.setAttribute("data-tooltip", tooltipText);
  el.setAttribute("aria-label", tooltipText);

  el.innerHTML = `<div class="${REAL_ROLL_MODE_ICONS[realRollMode]}"></div>`;
}

export function renderToggle(){
  const gmOnly = getSetting("gmOnly");
  if (gmOnly && !game.user.isGM) return;

  const exportButton = document.querySelector('button[data-action="export"]');
  if (!exportButton) return;

  const rollModeToggleEl = document.createElement("button");
  rollModeToggleEl.type = "button";
  rollModeToggleEl.classList.add("real-roll-mode-toggle", "ui-control");
  rollModeToggleEl.style.display = "flex";
  rollModeToggleEl.style.alignItems = "center";
  rollModeToggleEl.style.justifyContent = "center";

  updateRealRollMode(rollModeToggleEl);

  rollModeToggleEl.addEventListener("click", () => {
    const currentRollMode = getSetting("manualRollMode");
    const realRollMode = (currentRollMode + 1) % 2;
    setSetting("manualRollMode", realRollMode);
    updateRealRollMode(rollModeToggleEl);
  });

  exportButton.parentNode.insertBefore(rollModeToggleEl, exportButton);
}