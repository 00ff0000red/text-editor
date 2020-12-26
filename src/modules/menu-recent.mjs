import app from "./app.mjs";

import { $, passive } from "./misc.mjs";

import * as myMenus from "./menus.mjs";

import * as idbKeyval from "./idb-keyval.mjs";

const menuRecent = $("menuRecent");
myMenus.setup(menuRecent);

// the container around the button elements themselves
const buttonContainer = menuRecent.querySelector(".menuItemContainer");

// HTMLButtonElement => FileSystemFileHandle
const buttons = new WeakMap;

buttonContainer.addEventListener(
	"click",
	({ isTrusted, target }) => {
		if (isTrusted === true && target !== clearButton) {
			myMenus.hide(menuRecent);

			app.openFile(buttons.get(target));
		}
	},
	passive
);

// the live list of buttons
// const buttonList = buttonContainer.children;

// no realloc; reuses stongly referenced button
const clearButton = buttonContainer.querySelector("button");

clearButton.addEventListener(
	"click",
	() => {
		myMenus.clearMenu(menuRecent);
		addClearButton();
		recentFiles.length = 0;
		idbKeyval.set("recentFiles", []);
		app.setFocus();
	},
	passive
);

/**
 * Creates a button and links it to a file handle
 * 
 * @param {FileSystemFileHandle}
 * 
 * @returns {HTMLButtonElement}
*/
const createButton = fileHandle => {
	const button = myMenus.createButton(fileHandle.name);

	buttons.set(button, fileHandle);

	return button;
};

const recentFiles = [];

const savingUnavailable = !("isSameEntry" in FileSystemFileHandle.prototype);

if (savingUnavailable) {
	console.warn("Saving of recents is unavailable.");
}

/**
 * Adds a new item to the list of recent files.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to add.
**/
app.addRecent = savingUnavailable
	// If isSameEntry isn't available, we can't store the file handle
	? () => { }
	: async fileHandle => {
		// Loop through the list of recent files and make sure the file we're
		// adding isn't already there. This is gross.
		const inList = await Promise.all(
			recentFiles.map(
				// [&fileHandle]
				file => fileHandle.isSameEntry(file)
			)
		);

		if (inList.some(Boolean)) {
			return;
		}

		// Add the new file handle to the top of the list, and remove any old ones.
		recentFiles.push(fileHandle);
		if (recentFiles.length > 5) {
			recentFiles.shift();
		}

		// Update the list of menu items.
		refreshRecents();
	};

/**
 * Refresh the list of files in the menu.
**/
const refreshRecents = async () => {
	// Clear the existing menu.
	myMenus.clearMenu(menuRecent);
	addClearButton();

	// If there are no recents, don't draw anything.
	if (recentFiles.length === 0) {
		return;
	}

	// Loop through the list of recent files and add a button for each.
	for (const recent of recentFiles) {
		buttonContainer.prepend(
			createButton(recent)
		);
	}

};

const addClearButton = () => {
	myMenus.addElement(menuRecent, clearButton);
};

/**
 * Initializes the recents menu.
**/
(async () => {
	recentFiles.unshift(...await idbKeyval.get("recentFiles") ?? []);	// ... ?? []
	refreshRecents();
})();

// only save on exit
self.addEventListener(
	"beforeunload",
	() => {
		// Save the list of recent files.
		idbKeyval.set("recentFiles", recentFiles); // only stores file handles
	},
	passive
);