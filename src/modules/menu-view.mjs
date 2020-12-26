import app from "./app.mjs";

import { $, passive } from "./misc.mjs";

import { setup, hide } from "./menus.mjs";

import * as idbKeyval from "./idb-keyval.mjs";

const menuView = $("menuView");
setup(menuView);

const butWordWrap = $("butWordWrap");
const butMonospace = $("butMonospace");
const butCaptureTabs = $("butCaptureTabs");

const { options } = app;

// toggleWordWrap 0, toggleMonospace 0, toggleCaptureTabs 1

const body_classList = document.body.classList;
/**
* Toggle word wrap
**/
const toggleWordWrap = () => {
	butWordWrap.setAttribute(
		"aria-checked",
		(options.wordWrap =
		body_classList.toggle("wordwrap")).toString()
	);
};

/**
* Toggle Monospace
**/
const toggleMonospace = () => {
	butMonospace.setAttribute(
		"aria-checked",
		(options.monoSpace =
		body_classList.toggle("monospace")).toString()
	);
};

const lblTabMovesFocus_classList = $("lblTabMovesFocus").classList;

/**
 * Toggles the capture tab functionality
**/
const toggleCaptureTabs = () => {
	const newVal =
		options.captureTabs =
		!options.captureTabs;

	butCaptureTabs.setAttribute("aria-checked", newVal.toString());

	lblTabMovesFocus_classList.toggle("hidden", newVal);
};

app.toggleCaptureTabs = toggleCaptureTabs;

const warn = $("warn");

const { adjustFontSize } = app;

const toggleWarning = () => {
	warn.setAttribute(
		"aria-checked",
		(options.warn = !options.warn).toString()
	);
};

// TODO: give better variables names; add more comments; show types; explain stuff
// WeakMap for event delegation
const buttonListeners = new WeakMap([
	[ butWordWrap, toggleWordWrap ],
	[ butMonospace, toggleMonospace ],
	[ butCaptureTabs, toggleCaptureTabs ],
	[ $("butFontBigger"), () => { adjustFontSize(+2); } ],
	[ $("butFontSmaller"), () => { adjustFontSize(-2); } ],
	[ warn, toggleWarning ]
]);

// JavaScript is already scary enough, make sure a human clicks the button
// `.has` *should* always be true
menuView
	.querySelector(".menuItemContainer")
	.addEventListener(
		"click",
		({ isTrusted, target }) => {
			if (isTrusted === true && buttonListeners.has(target) === true) {
				hide(menuView);
				buttonListeners.get(target)();
			}
		},
		passive
	);

/**
 * Initializes the options menu.
**/
(async () => {
	const notUndefined = x => typeof x !== "undefined";

	const [
		wordWrap,
		monoSpace,
		captureTabs,
		fontSize,
		warn
	] = await Promise.all(
		[ // need explicit ordering; no {Reflect.ownKeys(options)}
			"wordWrap",
			"monoSpace",
			"captureTabs",
			"fontSize",
			"warn"
		].map(key => idbKeyval.get(key))
	);

	if (notUndefined(wordWrap) && wordWrap !== options.wordWrap) {
		toggleWordWrap();
	}
	if (notUndefined(monoSpace) && monoSpace !== options.monoSpace) {
		toggleMonospace();
	}
	if (notUndefined(captureTabs) && captureTabs !== options.captureTabs) {
		toggleCaptureTabs();
	}
	if (notUndefined(fontSize) && fontSize !== options.fontSize) {
		// this math had better be correct!
		adjustFontSize(fontSize - options.fontSize);
	}
	if (notUndefined(warn) && warn !== options.warn) {
		toggleWarning();
	}
})();

// only save on exit
self.addEventListener(
	"beforeunload",
	() => {
		for (const option in options) {
			idbKeyval.set(option, options[option]);
		}
	},
	passive
);