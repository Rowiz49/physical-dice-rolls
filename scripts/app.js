import { getSetting } from "./settings.js";
import { RealDiceConfig } from "./realDiceConfig.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const DIE_IMAGES = {
  2: "../modules/physical-dice-rolls/assets/two-coins.svg",
  4: "../icons/svg/d4-grey.svg",
  6: "../icons/svg/d6-grey.svg",
  8: "../icons/svg/d8-grey.svg",
  10: "../icons/svg/d10-grey.svg",
  12: "../icons/svg/d12-grey.svg",
  20: "../icons/svg/d20-grey.svg",
  default: "../icons/svg/d6-grey.svg",
};

export class RealRoll extends HandlebarsApplicationMixin(ApplicationV2) {
  static MODULE_ID = "physical-dice-rolls";

  constructor(dieTerms, roll) {
    super();
    this.dieTerms = dieTerms;
    this.roll = roll;
    this.dieTerms.forEach((term) => {
      term.exploding = (term.modifiers ?? []).includes("x");
      term.inputs = Array.from({ length: term.number }, () => term.faces);
      term._processing = true;
      term._image = DIE_IMAGES[term.faces] ?? DIE_IMAGES.default;
      if (term.number > 1 && getSetting("enableTotalBox")) {
        term.totalInput = {
          min: term.number,
          max: term.number * term.faces,
        };
      }
      term.index = this.dieTerms.indexOf(term);
    });
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  static async prompt(terms, roll) {
    try {
      const rollRollMode =
        roll.options?.rollMode ?? game.settings.get("core", "rollMode");
      if (rollRollMode == CONST.DICE_ROLL_MODES.BLIND) return true;
      if (game.combat?.started && getSetting("disableInCombat")) return true;
      const dieTerms = this.getTermsRecursive(terms);
      if (!dieTerms.length || getSetting("manualRollMode") == 0) return true;
      const realRoll = new RealRoll(dieTerms, roll);
      return realRoll.prompt();
    } catch (e) {
      return true;
    }
  }

  static getTermsRecursive(terms) {
    const dieTerms = [];
    const traverse = (obj) => {
      if (!obj) return;
      for (const o of obj) {
        if (o instanceof foundry.dice.terms.Die && !o._processing)
          dieTerms.push(o);
        if ("dice" in o) traverse(o.dice);
      }
    };
    traverse(terms);
    const diceConfig = getSetting(RealDiceConfig.SETTING_KEY);
    return dieTerms.filter((term) => {
      return diceConfig[`d${term.faces}`] ?? diceConfig.other;
    });
  }

  async prompt() {
    await this.render(true);
    return this.promise;
  }

  static get APP_ID() {
    return "real-roll";
  }

  get id() {
    return RealRoll.APP_ID + foundry.utils.randomID();
  }

  static DEFAULT_OPTIONS = {
    id: this.APP_ID,
    form: {
      handler: RealRoll.onSubmit,
      closeOnSubmit: true,
    },
    tag: "form",
    window: {
      icon: "fas fa-die", // You can now add an icon to the header
      title: "RealRoll.form.title",
      resizable: true,
      minimizable: true,
      contentClasses: ["standard-form"],
    },

    classes: [RealRoll.APP_ID],
  };

  get title() {
    return game.i18n.localize(`${RealRoll.MODULE_ID}.${RealRoll.APP_ID}.title`);
  }

  static PARTS = {
    form: {
      template: `modules/${RealRoll.MODULE_ID}/templates/${RealRoll.APP_ID}.hbs`,
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  async _prepareContext(options) {
    const context = {
      rollFormula: getSetting("showFormula") ? this.roll.formula : null,
      dieTerms: this.dieTerms,
      multiRow: this.dieTerms.length > 1,
      buttons: [{ type: "submit", icon: "fa-solid fa-check", label: "" }],
    };
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const defaultPosition = getSetting("position");

    if (defaultPosition === "chat") {
      const chat = document.getElementById("chat-log");
      if (chat) {
        const chatRect = chat.getBoundingClientRect();
        const element = this.element;

        // Use offsetWidth/Height directly from DOM element
        const left = chatRect.left - Math.max(200, element.offsetWidth) - 10;
        const top = chatRect.top + chatRect.height - element.offsetHeight / 2;

        this.setPosition({ left, top });
      }
    }

    // Focus the first input
    const firstInput = this.element.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  static async onSubmit(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);

    for (const [key, value] of Object.entries(data)) {
      if (!value.total) continue;
      const dieTerm = this.dieTerms[parseInt(key)];
      if (!dieTerm) continue;
      const total = parseInt(value.total);
      const diceCount = dieTerm.number;
      const faceMax = dieTerm.faces;
      //generate N rolls so that the total is correct
      const rolls = [];
      let remaining = total;
      for (let i = 0; i < diceCount; i++) {
        const min = Math.max(1, remaining - (diceCount - i - 1) * faceMax);
        const max = Math.min(faceMax, remaining - (diceCount - i - 1));
        const roll = Math.floor(Math.random() * (max - min + 1)) + min;
        rolls.push(roll);
        remaining -= roll;
      }
      delete value.total;
      for (let i = 0; i < diceCount; i++) {
        value[i] = rolls[i];
      }
    }

    let hasRolledManually = false;
    for (let it = 0; it < this.dieTerms.length; it++) {
      const term = this.dieTerms[it];
      const termData = data[`${it}`];
      if (!termData) continue;
      term.inputs = term.inputs.map((input, index) => {
        return termData[`${index}`] ?? null;
      });
      if (term.inputs.some((input) => input !== null)) hasRolledManually = true;
      const rollOverride = function ({
        minimize = false,
        maximize = false,
      } = {}) {
        const roll = { result: undefined, active: true };
        if (minimize) roll.result = Math.min(1, this.faces);
        else if (maximize) roll.result = this.faces;
        else
          roll.result =
            this.inputs[this.results.length] ??
            Math.ceil(CONFIG.Dice.randomUniform() * this.faces);
        this.results.push(roll);
        return roll;
      };
      term.roll = rollOverride.bind(term);
    }
    if (hasRolledManually) this.displayGmMessage();
  }

  async displayGmMessage() {
    if (
      (game.user.isGM && !getSetting("showMessagePlayers")) ||
      !getSetting("showMessage")
    )
      return;
    ChatMessage.create({
      content: `<div class="real-roll-message">${
        game.user.name
      } ${game.i18n.localize(
        `${RealRoll.MODULE_ID}.${RealRoll.APP_ID}.realRollMessage`
      )}</div>`,
      speaker: { alias: "Physical Dice Rolls" },
      whisper: !getSetting("showMessagePlayers")
        ? ChatMessage.getWhisperRecipients("GM")
        : null,
    });
  }

  async close(...args) {
    this._resolve(true);
    return super.close(...args);
  }
}
