import {
	getFileHandle,
	getNewFileHandle,
	readFile,
	verifyPermission,
	writeFile,
} from "./fs-helpers.mjs";

import {
	getFileLegacy,
	saveAsLegacy
} from "./fallback.mjs";

import { $, s } from "./misc.mjs";

const genericCatcher_0 = exception => {
	const message = `An error occured reading ${app.fileName}`;

	console.error("%s\n%o", message, exception);

	alert(message);
};

const genericCatcher_1 = exception => {
	const message = "Unable to save file.";

	console.error("%s\n%o", message, exception);

	alert(message);
};

const genericCatcher_2 = exception => {
	if (exception.name !== "AbortError") {
		const message = "An error occured trying to open the file.";

		console.error("%s\n%o", message, exception);

		alert(message);
	}
};

const hasFSAccess = "chooseFileSystemEntries" in self || "showOpenFilePicker" in self;

const appName = "Text Editor";

const app = s({
	__proto__: null,

	[Symbol.toStringTag]: appName,

	appName,
	file: s({
		__proto__: null,

		handle: null,
		name: null,
		isModified: false,
	}),
	options: s({
		__proto__: null,

		captureTabs: true,
		fontSize: 14,
		monoSpace: false,
		wordWrap: true,
		warn: true
	}),
	hasFSAccess,
	// may be faulty :/
	isMac: navigator.userAgent.includes("Mac OS X"),

	/**
	 * Creates an empty notepad with no details in it.
	 */
	newFile: () => {
		if (app.confirmDiscard()) {
			app.setText();
			app.setFile();
			app.setModified(false);
			app.setFocus(true);
		}
	},

	/**
	 * Opens a file for reading.
	 *
	 * @param {FileSystemFileHandle} fileHandle File handle to read from.
	**/
	openFile: hasFSAccess
		? async fileHandle => {
			if (app.confirmDiscard()) {

				(fileHandle
					// If a fileHandle is provided, verify we have permission to read/write it, otherwise, show the file open prompt and allow the user to select the file.
					? verifyPermission(fileHandle, true).then(
						permission => { // [&fileHandle]
							if (permission === true) {
								return fileHandle;
							} else {
								console.error(`User did not grant permission to "${fileHandle.name}"`);

								return null; // can be undefined, could be an implicit, missing return, could be a promise reject 
							}
						}
					) : getFileHandle()
				).then(
					// staticially allocate soon; no capture
					// Filehandle? => Promise<void>
					async safeFileHandle => {
						if (safeFileHandle !== null) {
							const file = await safeFileHandle.getFile();

							app.readFile(file, safeFileHandle);
						}
					},
					genericCatcher_2
				);
			}
		}
		// If the File System Access API is not supported, use the legacy file apis.
		: async () => {
			if (app.confirmDiscard()) {

				const file = await app.getFileLegacy();

				if (file) {
					app.readFile(file);
				}
			}
		},

	/**
	 * Read the file from disk.
	 *
	 *	@param {File} file File to read from.
	 * @param {FileSystemFileHandle} fileHandle File handle to read from.
	*/
	readFile: (file, fileHandle) => {
		readFile(file).then(
			text => {
				// [&fileHandle, &file]
				app.setText(text);
				app.setFile(fileHandle ?? file.name);
				app.setModified(false);
				app.setFocus(true);
			},
			genericCatcher_0
		);
	},

	/**
	 * Saves a file to disk.
	 */
	saveFile: async () => {
		try { // what throws the error here? Research and optimize
			// .then(...)
			if (!app.file.handle) {
				// do file writers throw? Does permission requesting throw?
				return await app.saveFileAs();
			}

			await writeFile(app.file.handle, app.getText());
			app.setModified(false);
		} catch (exception) { // .then(..., genericCatcher_1)
			genericCatcher_1(exception);
		}

		// .finally(...)
		app.setFocus();
	},
	/**
	 * Saves a new file to disk.
	 */
	saveFileAs: hasFSAccess
		? async () => {
			await getNewFileHandle().then(
				// no capture
				fileHandle => {
					writeFile(
						fileHandle,
						app.getText()
					).then(
						() => {
							app.setFile(fileHandle);
							app.setModified(false);
						},
						genericCatcher_1
					).finally(
						() => {
							// takes arguments
							app.setFocus();
						}
					);
				},
				genericCatcher_2
			);
		}
		: async () => {
			await app.saveAsLegacy(app.file.name, app.getText());

			app.setFocus();
		},

	/**
	 * Attempts to close the window
	 */
	quitApp: () => {
		if (app.confirmDiscard()) {
			self.close();
		}
	},

	setText: null,
	getText: null,
	insertIntoDoc: null,
	adjustFontSize: null,
	setFocus: null,
	toggleCaptureTabs: null,
	addRecent: null,
	confirmDiscard: null,
	setFile: null,
	setModified: null,
	getFileLegacy,
	saveAsLegacy
});

export default app;

// Verify the APIs we need are supported, show a polite warning if not.
if (app.hasFSAccess) {
	$("not-supported").classList.add("hidden");
} else {
	$("lblLegacyFS").classList.toggle("hidden", false);
	$("butSave").classList.toggle("hidden", true);
}