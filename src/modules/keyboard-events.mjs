import app from "./app.mjs";

import {
	f
} from "./misc.mjs";

const keys = f({
	__proto__: null,
	// Save
	's': app.saveFile,
	// Open
	'o': app.openFile,
	// Close
	'n': app.newFile,
	// Quit
	'q': app.quitApp,
	'w': app.quitApp
});

/**
 * Setup keyboard shortcuts
**/
self.addEventListener(
	"keydown",
	e => {
		const { ctrlKey, metaKey, shiftKey, key } = e;

		if (ctrlKey === true || metaKey === true) {
			if (shiftKey === true) {
				if (ctrlKey === true && key === 'M') { // not a duplicate condition, specificially targets ctrlKey, but metaKey may have been pressed instead
					// Capture Tabs
					e.preventDefault();
					app.toggleCaptureTabs();
				} else if (key === 'S') {
					// Save As
					e.preventDefault();
					app.saveFileAs();
				}
			} else if (key in keys) {
				e.preventDefault();
				keys[key]();
			}
		}

		// I wish this could sort of fall-through to a "preventDefault" call, to avoid duplicate code, but not even labels can help here
	}
);