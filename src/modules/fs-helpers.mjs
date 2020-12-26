import {
	f,
	passive_once
} from "./misc.mjs";

/**
 * Open a handle to an existing file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the existing file.
**/
export const getFileHandle = "showOpenFilePicker" in self
	// For Chrome 86 and later...
	? async () => (await self.showOpenFilePicker())[0]
	// For Chrome 85 and earlier...
	: self.chooseFileSystemEntries;

const hasFilePicker = "showSaveFilePicker" in self;

const options = hasFilePicker
	? f({
	types: f([
			f({
				description: "Text file",
				accept: f({
					"text/plain": f([".txt"])
				})
			})
		])
	})
	: f({
		type: "save-file",
		accepts: f([
			f({
				description: "Text file",
				extensions: f([".txt"]),
				mimeTypes: f(["text/plain"]),
			})
		]),
	});

/**
 * Create a handle to a new (text) file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the new file.
**/
export const getNewFileHandle = hasFilePicker
	// For Chrome 86 and later...
	? () => self.showSaveFilePicker(options)
	// For Chrome 85 and earlier...
	: () => self.chooseFileSystemEntries(options);

// assume GC may get this if there is File#text
const reader = new FileReader; // file readers are reusable; no realloc
/**
 * Reads the raw text from a file.
 *
 * @param {File} file
 * @return {!Promise<string>} A promise that resolves to the parsed string.
**/
export const readFile = "text" in File.prototype
	// If the new .text() reader is available, use it.
	? file => file.text()
	// Otherwise use the "traditional" file reading technique.
	: file => {
		const fileBeingRead = new Promise(
			resolve => { // [&file]
				reader.addEventListener(
					"loadend",
					({ target: { result: text } }) => { // [&resolve]
						resolve(text);
					},
					passive_once
				);
			}
		);

		reader.readAsText(file);
		return fileBeingRead;
	};

/**
 * Writes the contents to disk.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to write to.
 * @param {string} contents Contents to write.
**/
export const writeFile =
	"createWriter" in FileSystemFileHandle.prototype
		// Support for Chrome 82 and earlier.
		? async (fileHandle, contents) => {
			// Create a writer (request permission if necessary).
			const writer = await fileHandle.createWriter();
			// Write the full length of the contents
			await writer.write(0, contents);
			// Close the file and write the contents to disk
			await writer.close();
		}
		// For Chrome 83 and later.
		: async (fileHandle, contents) => {
			// Create a FileSystemWritableFileStream to write to.
			const writable = await fileHandle.createWritable();
			// Write the contents of the file to the stream.
			await writable.write(contents);
			// Close the file and write the contents to disk.
			await writable.close();
		};

// no realloc on either
const write_true = f({
	__proto__: null,
	writable: true,
	// For Chrome 86 and later...
	mode: "readwrite"
});

const write_false = f({
	__proto__: null
});
/**
 * Verify the user has granted permission to read or write to the file, if
 * permission hasn't been granted, request permission.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to check.
 * @param {boolean} withWrite True if write permission should be checked.
 * @return {boolean} True if the user has granted read/write permission.
**/
export const verifyPermission = async (fileHandle, withWrite) => {
	const opts = withWrite
		? write_true
		: write_false;

	// Check if we already have permission, if so, return true.
	// Request permission to the file, if the user grants permission, return true.
	// If the user did not grant permission, return false.
	// branching or ||
	return await fileHandle.queryPermission(opts) === "granted" || await fileHandle.requestPermission(opts) === "granted";
};