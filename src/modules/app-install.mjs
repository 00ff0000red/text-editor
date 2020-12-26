import { $, passive } from "./misc.mjs";

import { addKeyboardShortcut } from "./menus.mjs";

const butInstall = $("butInstall");

/**
 * Listen for "beforeinstallprompt" event, and update the UI to indicate
 * text-editor can be installed.
**/

/* Which listeners occur first!? */

let deferred = null;

self.addEventListener(
	"beforeinstallprompt",
	e => {
		// Don"t show the mini-info bar
		e.preventDefault();

		// Save the deferred prompt
		deferred = e;

		// Show the install button
		butInstall.removeAttribute("disabled");
		butInstall.classList.remove("hidden");
	}
	// once?
);

// Handle the install button click
butInstall.addEventListener(
	"click",
	() => {
		butInstall.setAttribute("disabled", "true");
		deferred.prompt();
	},
	passive
);

addKeyboardShortcut(butInstall);

/*
const e = await new Promise(
	resolve => {
		self.addEventListener(
			"beforeinstallprompt",
			resolve
		);
	}
);

// Don"t show the mini-info bar
e.preventDefault();

// Show the install button
butInstall.removeAttribute("disabled");
butInstall.classList.remove("hidden");

// Handle the install button click
await new Promise (
	resolve => {
		butInstall.addEventListener(
			"click",
			resolve,
			passive
		);
	}
);

butInstall.setAttribute("disabled", "true");
e.prompt();

addKeyboardShortcut(butInstall);
*/