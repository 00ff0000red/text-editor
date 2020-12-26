import app from "./app.mjs";

import { $, passive } from "./misc.mjs";

import { setup, hide } from "./menus.mjs";

const menuEdit = $("menuEdit");
setup(menuEdit);

// no realloc, then & catch
const _then = contents => {
	app.insertIntoDoc(contents);
	app.setModified(true);
	app.setFocus();
};

const _catch = exception => {
	// .bind?
	console.error("Unable to paste %o", exception);
};

// TODO: update this legacy code!
const map = new WeakMap([
	[ $("butCut"),
	() => {
		document.execCommand("cut");
		// ...?
	} ],
	[ $("butCopy"),
	() => {
		document.execCommand("copy");
		// navigator.clipboard.writeText
	} ],
	[ $("butPaste"),
	() => {
		navigator.clipboard.readText().then(_then).catch(_catch);
	} ]
]);

// .has should always be true
menuEdit
.querySelector(".menuItemContainer")
.addEventListener(
	"click",
	({ isTrusted, target }) => {
		if (isTrusted === true && map.has(target) === true) {
			hide(menuEdit);
			map.get(target)();
		}
	},
	passive
);