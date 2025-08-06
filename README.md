# Physical Dice Rolls

This module allows you to roll manually roll dice. Works with any system and should be compatible with automation modules.\

## Acknowledgments

This module is a fork of the now deprecated [Physical Dice Rolls module from theripper93](https://github.com/theripper93/physical-dice-rolls)

## How to use

1. Enable manual rolling with the Shift + R keybinding or by clicking the Physical Dice Rolls toggle button. You can find the button above the chat text area to the right of the Roll Mode dropdown.
2. Trigger a dice roll in any way you like.
3. You will be shown the Real Roll window. If you wish to ignore it and roll automatically, simpy press Enter\Escape or click the ✓ button without inputing any roll.
4. Click on the dice faces to manually write the result of the rolls. Then click the confirm button.
5. Any dice left empty will be rolled automatically.

### Roll Mode

If your Roll Mode is set to Blind GM Roll, the manual rolling will be skipped.

### API

If your module overrides the roll function, you can manually call the Physical Dice Rolls API to roll dice manually.

```js
await CONFIG.Dice.RealRoll.prompt(this.terms);
```

Where `this.terms` is your Array of RollTerm
