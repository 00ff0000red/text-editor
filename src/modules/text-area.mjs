import app from "./app.mjs";

import { $, passive, passive_once } from "./misc.mjs";

import { hideAll } from "./menus.mjs";

const textArea = $("textEditor");

/* Setup the main textarea */
textArea.addEventListener(
	"input",
	() => {
		// .bind?
		app.setModified(true);
	},
	passive
);

/* Hide menus any time we start typing */
textArea.addEventListener(
	"focusin",
	hideAll,
	passive
);

const { options } = app; // used more than once
/* Listen for tab key */
textArea.addEventListener(
	"keydown",
	e => {
		if (options.captureTabs === true && e.key === "Tab") {
			e.preventDefault();
			app.insertIntoDoc("\t");
		}
	}
);

// deferred scripts fire before load event
/* Initialize the textarea, set focus & font size */
self.addEventListener(
	"load",
	() => {
		textArea.style.fontSize = `${app.options.fontSize}px`;
	},
	passive_once
);

/**
 * Sets the text of the editor to the specified value
 *
 * @param {string} val
**/
app.setText = (val = "") => {
	textArea.value = val;
};

/**
 * Gets the text from the editor
 *
 * @return {string}
**/
app.getText = () => textArea.value;

/**
 * Inserts a string into the editor.
 *
 * @param {string} contents Contents to insert into the document.
**/
app.insertIntoDoc = contents => {
	// Find the current cursor position
	const {
		selectionStart: startPos,
		selectionEnd: endPos,
		// Get the current contents of the editor
		value: before
	} = textArea;

	// Get everything to the left of the start of the selection
	const left = before.substring(0, startPos);

	// Get everything to the right of the start of the selection
	const right = before.substring(endPos);

	// Concatenate the new contents.
	textArea.value = left + contents + right;

	// Move the cursor to the end of the inserted content.
	textArea.selectionEnd = textArea.selectionStart = startPos + contents.length;

	app.setModified(true);
};

/**
 * Adjust the font size of the textarea up or down by the specified amount.
 *
 * @param {Number} val Number of pixels to adjust font size by (eg: +2, -2).
**/
app.adjustFontSize = val => {
	const newFontSize = options.fontSize + val;
	if (newFontSize >= 2) {
		textArea.style.fontSize = `${options.fontSize = newFontSize}px`;
	}
};

/**
 * Moves focus to the text area, and potentially cursor to position zero.
 *
 * @param {boolean} startAtTop
**/
app.setFocus = startAtTop => {
	if (startAtTop === true) {
		textArea.selectionEnd = textArea.selectionStart = 0;
		textArea.scrollTo(0, 0);
	}
	textArea.focus();
};