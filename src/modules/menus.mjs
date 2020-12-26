import app from "./app.mjs";
import { passive } from "./misc.mjs";
/**
 * Toggles a menu open or closed.
 *
 * @param {Element} button Toggle button to show/hide menu.
**/
const toggle = button => {
	const parent = button.parentElement;
	const expanded = button.getAttribute("aria-expanded");

	(expanded === "true"
		? hide
		: show
	)(parent);
};

const setupListener = e => {
	switch (e.key) {
		default: {
			break; // nop
		}
		case "Escape": {
			hideAll();
			app.setFocus();
			break;
		} case "ArrowDown": {
			e.target.nextElementSibling?.focus();
			break;
		} case "ArrowUp": {
			e.target.previousElementSibling?.focus();
			break;
		}
	} // end switch case
};

const toggleableContainers = new WeakSet;

document.body.addEventListener(
	"click",
	({ target }) => {
		if (toggleableContainers.has(target)) {
			toggle(target);
		}
	},
	passive
);

/**
 * Initializes a drop down menu.
 *
 * @param {Element} container Container element with the drop down menu.
**/
export const setup = container => {
	const toggleButton = container.querySelector("button.menuTop");

	toggleableContainers.add(toggleButton);

	addKeyboardShortcut(toggleButton);

	container.addEventListener(
		"keydown",
		setupListener,
		passive
	);
};

/**
 * Initializes a drop down menu.
 *
 * @param {Element} button Toggle button to show/hide menu.
**/
export const addKeyboardShortcut =
	// Keyboard shortcuts aren't available on mac.
	app.isMac
		? () => { }
		: button => {
			const key = button.querySelector(".kbdShortcut")?.textContent.trim().toLowerCase();

			if (key === undefined) {
				// does this happen without an exception being thrown?
				return;
			}

			self.addEventListener(
				"keydown",
				e => { // [&button, &key]
					if (e.altKey === true && e.key === key) {
						e.preventDefault();
						button.click();
					}
				}
			);
		};

const menuContainers = document.querySelectorAll(".menuContainer");
/**
 * Hides all visible menus.
**/
export const hideAll = () => {
	// hideAll = menuContainers.forEach.bind(menuContainers, hide);
	menuContainers.forEach(hide);
};

/**
 * Hides a menu dropdown.
 *
 * @param {Element} menuContainer Container element with the drop down menu.
**/
export const hide = menuContainer => {
	const button = menuContainer.querySelector(".menuTop");

	button.setAttribute("aria-expanded", "false");

	const panel = menuContainer.querySelector(".menuItemContainer");

	panel?.classList.toggle("hidden", true);
};

/**
 * Shows a menu dropdown.
 *
 * @param {Element} menuContainer Container element with the drop down menu.
**/
export const show = menuContainer => {
	hideAll();
	const button = menuContainer.querySelector(".menuTop");
	button.setAttribute("aria-expanded", "true");
	const panel = menuContainer.querySelector(".menuItemContainer");
	panel.classList.toggle("hidden", false);
	const firstButton = panel.querySelector("button");
	if (firstButton === null) {
		hideAll();
		app.setFocus();
	} else {
		firstButton.focus();
	}
};

const buttonTemplate = document.createElement("button");
buttonTemplate.setAttribute("type", "button");
buttonTemplate.setAttribute("role", "menuitem");

/**
 * Creates a new menu item button.
 *
 * @param {string} label Label for button
 * @return {Button} Returns an HTML button.
**/
export const createButton = label => {
	const butt = buttonTemplate.cloneNode(false);
	butt.innerText = label;
	return butt;
};

/**
 * Adds an element to the menu.
 *
 * @param {Element} menuContainer Container element with the drop down menu.
 * @param {Element} elem Element to add to the menu container.
**/
export const addElement = (menuContainer, elem) => {
	menuContainer.querySelector(".menuItemContainer").append(elem);
};

/**
 * Removes all items from the menu.
 *
 * @param {Element} menuContainer Container element with the drop down menu.
**/
export const clearMenu = menuContainer => {
	const container = menuContainer.querySelector(".menuItemContainer");

	// container.innerHTML = "";

	for (
		let { firstChild } = container;
		firstChild !== null;
		({ firstChild } = container)
	) {
		firstChild.remove();
	}
};

/* Show shortcuts on menu items when ALT key is pressed, non-Mac only */
if (!app.isMac) {
	const body_classList = document.body.classList;

	self.addEventListener(
		"keydown",
		e => {
			if (e.altKey === true && e.key === "Alt") {
				body_classList.toggle("altKey", true);
			}
		},
		passive
	);

	self.addEventListener(
		"keyup",
		e => {
			if (e.key === "Alt") {
				body_classList.toggle("altKey", false);
			}
		},
		passive
	);
}