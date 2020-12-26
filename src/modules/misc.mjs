// shared resources for all files
// this file should not throw an error!

export const {
  freeze: f,
  seal: s
} = Object;

export const passive = f({
	__proto__: null,
	passive: true
});

export const passive_once = f({
	__proto__: null,
  passive: true,
  once: true
});

export const $ = XMLDocument
	.prototype
	.getElementById
	.bind(document);