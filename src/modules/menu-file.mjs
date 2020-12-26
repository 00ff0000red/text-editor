import app from "./app.mjs";
import { $, passive } from "./misc.mjs";

import { setup, hide } from "./menus.mjs";

const menuFile = $("menuFile");

setup(menuFile);

const map = new WeakMap([
	[ $("butNew"), app.newFile ],
	[ $("butOpen"), app.openFile ],
	[ $("butSave"), app.saveFile ],
	[ $("butSaveAs"), app.saveFileAs ],
	[ $("butClose"), app.quitApp ]
]);

// `.has` *should* always be true
menuFile
.querySelector(".menuItemContainer")
.addEventListener(
	"click",
	({ isTrusted, target }) => {
		if (isTrusted === true && map.has(target) === true) {
			hide(menuFile);
			map.get(target)();
		}
	},
	passive
);