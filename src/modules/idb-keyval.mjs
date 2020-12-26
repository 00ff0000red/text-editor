// re-update, debug, optimize
// still too scared to touch this...

// Forked from https://github.com/jakearchibald/idb-keyval

export class Store {
	constructor(dbName = "keyval-store", storeName = "keyval") {
		this.storeName = storeName;
		this._dbp = new Promise(
			(resolve, reject) => {
				const openreq = indexedDB.open(dbName, 1);
				openreq.onerror = () => reject(openreq.error);
				openreq.onsuccess = () => resolve(openreq.result);
				// First time setup: create an empty object store
				openreq.onupgradeneeded = () => {
					openreq.result.createObjectStore(storeName);
				};
			}
		);
	}

	_withIDBStore(type, callback) {
		return this._dbp.then(
			db => new Promise(
				(resolve, reject) => {
					const transaction = db.transaction(this.storeName, type);
					transaction.oncomplete = () => resolve();
					transaction.onabort = transaction.onerror = () => reject(transaction.error);
					callback(transaction.objectStore(this.storeName));
				}
			)
		);
	}
};

let store = undefined;

const getDefaultStore = () => store ??= new Store;

export const get = (key, store = getDefaultStore()) => {
	let req = undefined;
	return store._withIDBStore(
		"readonly", store => {
			req = store.get(key);
		}
	).then(() => req.result);
};

export const set = (key, value, store = getDefaultStore()) =>
	store._withIDBStore(
		"readwrite", store => {
			store.put(value, key);
		}
	);

export const del = (key, store = getDefaultStore()) =>
	store._withIDBStore(
		"readwrite", store => {
			store.delete(key);
		}
	);

export const clear = (store = getDefaultStore()) =>
	store._withIDBStore(
		"readwrite", store => {
			store.clear();
		}
	);

export const keys = (store = getDefaultStore()) => {
	const keys = [];
	return store._withIDBStore(
		"readonly",
		store => {
			// This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
			// And openKeyCursor isn't supported by Safari.
			(store.openKeyCursor || store.openCursor).call(store).onsuccess = function () { // [&keys]
				if (!this.result) {
					return;
				}
				keys.push(this.result.key);
				this.result.continue();
			};
		}
	).then(() => keys);
};