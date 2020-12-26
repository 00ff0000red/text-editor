import app from "./app.mjs";
import { $ } from "./misc.mjs";

const spanFileName = $("headerFileName");
const spanAppName_classList = $("headerAppName").classList;
const modifiedHeader_classList = $("modifiedHeader").classList;
const modifiedFooter_classList = $("modifiedFooter").classList;

// Setup the before unload listener to prevent accidental loss on navigation.
self.addEventListener(
	"beforeunload",
	e => {
		if (app.options.warn === true && app.file.isModified === true) {
			e.preventDefault();
			e.returnValue = "There are unsaved changes. Are you sure you want to leave?";
		}
	}
);

/**
 * Confirms user does not want to save before closing the current doc.
 * @return {boolean} True if it's OK to discard.
**/
app.confirmDiscard = () =>
	app.options.warn === false
	|| app.file.isModified === false
	|| confirm("Discard changes? All changes will be lost.");

/**
 * Updates the UI with the current file name.
 * @param {FileHandle|string} fileHandle Filename to display in header.
**/
app.setFile = fileHandle => {
	const { file } = app;

	// typeof checks failed
	// fileHandle && name
	if (fileHandle === undefined) {
		file.handle = null;
		file.name = fileHandle;

		spanFileName.textContent =
		document.title =
		app.appName;

		spanAppName_classList.toggle("hidden", true);
	} else { // FileHandle
		file.handle = fileHandle;

		document.title = `${spanFileName.textContent = file.name = fileHandle.name} - ${app.appName}`;

		spanAppName_classList.toggle("hidden", false);
		app.addRecent(fileHandle);
	}
};

const body_classList = document.body.classList;
/**
 * Updates the UI if the file has been modified.
 * @param {boolean} val True if the file has been modified.
**/
app.setModified = app.hasFSAccess
	? val => {
		body_classList.toggle(
			"modified",
			app.file.isModified =
			val
		);
		const hidden = !val;
		modifiedHeader_classList.toggle("hidden", hidden);
		modifiedFooter_classList.toggle("hidden", hidden);
	}
	: () => { };