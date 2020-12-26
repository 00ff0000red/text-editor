import { f, passive_once } from "./misc.mjs";

// should these be allocated in DOM instead?

/**
 * Shortens setting attributes on JavaScript-created DOM Elements
**/
const set = "setAttribute";

const filePicker = document.createElement("input");
filePicker[set]("type", "file");

const aDownloadFile = document.createElement('a');
aDownloadFile[set]("download", "download");
aDownloadFile[set]("target", "_self");
aDownloadFile[set]("type", "text/plain");

// no realloc; does it's stack trace matter?
const AbortError = new Error("AbortError");

const promise = (resolve, reject) => {
	filePicker.addEventListener(
		"input",
		e => {
			// [&resolve, &reject]
			const { files } = filePicker;

			if ('0' in files) {
				resolve(files['0']);
			} else {
				reject(AbortError);
			}

			filePicker.value = "";
		},
		passive_once
	)

	filePicker.click();
};

/**
 * Uses the <input type="file"> to open a new file
 *
 * @return {!Promise<File>} File selected by the user.
**/
export const getFileLegacy = () => new Promise(promise);

const opts = f({
	__proto__: null,
	type: "text/plain"
});
/**
 * Saves a file by creating a downloadable instance, and clicking on the
 * download link.
 *
 * @param {string} filename Filename to save the file as.
 * @param {string} contents Contents of the file to save.
**/
export const saveAsLegacy = (filename = "Untitled.txt", contents) => {
	const file = new Blob(
		[ contents ],
		opts
	);

	const href = URL.createObjectURL(file);

	aDownloadFile[set]("href", href);

	aDownloadFile[set]("download", filename);

	aDownloadFile.click();

	URL.revokeObjectURL(href);
};