import { $, f, passive } from "./misc.mjs";

if ("chrome" in self) {
	console.clear();

	console.info("Modules scripts in XML documents are currently supported. See https://crbug.com/717643#c13");
}

document.head.querySelector("script").remove();

const textarea = $("textEditor");

// temporary, for development only!
const errorCatcher = error => {
	let name, message, stack;

	console.error(
		{ name, message, stack } = error
	);

	textarea.append(`Error {\n\tname: "${name}",\n\tmessage: "${message}",\n\tstack: "${stack}"\n}`);
};

// temp
self.addEventListener(
	"error",
	errorCatcher,
	passive
);

// "Promse.allSettled" later
Promise.all(
	[
		"text-area",
		"menu-file",
		"menu-edit",
		"menu-view",
		"menu-recent",
		"ui",
		"keyboard-events",
		"app-install",
		"fallback"
	].map(
		// mimic Promise.allSettled
		url => import(`./${url}.mjs`)
		.catch(errorCatcher)
	)
)
.finally(
	async () => {
		const {
			default: app
		} = await import("./app.mjs");

		f(app);
	}
);