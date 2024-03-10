import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLDocsManagerElement extends HTMLCustomShadowElement {
	
	static DEFAULT_STORAGE_KEY = '_';
	static STORAGE_KEY_PREFIX = 'odd-docs@'
	static tagName = 'docs-man';
	
	static [HTMLCustomShadowElement.$attribute] = {
	};
	
	static [HTMLCustomShadowElement.$bind] = {
		
		interactedCreateButton(event) {
			
			this.container.appendChild(document.createElement('scenarios-node'));
			
		},
		
		interactedSaveButton(event) {
			
			const { docNameInput: { value: docName } } = this;
			
			if (docName) {
				
				const	{ getStorage, setStorage, take } = HTMLDocsManagerElement,
						{ id } = this,
						data = getStorage(id),
						{ docs = [] } = data,
						index = take(docs, name, docName, true),
						{ length } = docs;
				
				(data.docs = docs)[index < length ? index : length] =
					JSON.stringify(HTMLCustomShadowElement.jsonalize(this.container.childNodes)),
				//hi(this.container.replaceChildren(...HTMLCustomShadowElement.nodify(docs)[index < length ? index : length]));
				//return;
				setStorage(id, data);
				
			}
			
		},
		
		interactedSelectorButton(event) {
			
			const	{ getStorage } = HTMLDocsManagerElement,
					data = getStorage(this.id),
					{ docs } = data,
					{ docSelector } = this;
			
			this.container.replaceChildren(...HTMLCustomShadowElement.nodify(JSON.parse(docs[docSelector.selectedIndex])));
			
		}
		
	};
	
	static take(targets, key, value, asIndex) {
		
		if (Array.isArray(targets)) {
			
			const { length } = targets;
			let i;
			
			i = -1;
			while (++i < length && targets?.[i]?.[key] !== value);
			
			return i === length ? null : asIndex ? i : targets[i];
			
		}
		
		return null;
		
	}
	
	static getStorage(key) {
		
		const { DEFAULT_STORAGE_KEY, STORAGE_KEY_PREFIX, storageAvailable } = HTMLDocsManagerElement;
		
		return	(
						storageAvailable() &&
							JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + location.href) || 'null')?.
								[key || DEFAULT_STORAGE_KEY]
					) || {};
		
	}
	static setStorage(key, data) {
		
		if (HTMLDocsManagerElement.storageAvailable()) {
			
			try {
				
				const	{ DEFAULT_STORAGE_KEY, STORAGE_KEY_PREFIX } = HTMLDocsManagerElement,
						primaryKey = STORAGE_KEY_PREFIX + location.href,
						loader = JSON.parse(localStorage.getItem(primaryKey) || 'null') || {};
				
				loader[key || DEFAULT_STORAGE_KEY] = data,
				localStorage.setItem(primaryKey, JSON.stringify(loader));
				
			} catch (error) {
				
				return false;
				
			}
			
		} else return false;
		
	}
	
	// https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#%E5%88%A9%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%8B%E3%81%A9%E3%81%86%E3%81%8B%E3%81%AE%E6%A4%9C%E8%A8%BC
	static storageAvailable(storageType = 'localStorage') {
		
		const storage = window[storageType], sample = '__storage_test__';
		
		try {
			
			storage.setItem(sample, sample),
			storage.removeItem(sample);
			
			return true;
			
		} catch (error) {
			
			return	error instanceof DOMException &&
							(
								// everything except Firefox
								error.code === 22 ||
								// Firefox
								error.code === 1014 ||
								// test name field too, because code might not be present
								// everything except Firefox
								error.name === 'QuotaExceededError' ||
								// Firefox
								error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
							) &&
							// acknowledge QuotaExceededError only if there's something already stored
							storage &&
							storage.length;
			
		}
		
	}
	
	constructor() {
		
		super();
		
		const { id } = this;
		
		this.load?.(HTMLDocsManagerElement.getStorage(id));
		
	}
	
	[HTMLCustomShadowElement.$init]() {
		
		const	{
					createButton,
					interactedCreateButton,
					interactedSaveButton,
					interactedSelectorButton,
					docSaveButton,
					docSelectorButton
				} = this;
		
		this.addListener(createButton, 'click', interactedCreateButton),
		this.addListener(docSaveButton, 'click', interactedSaveButton),
		this.addListener(docSelectorButton, 'click', interactedSelectorButton);
		
	}
	
	[Symbol.iterator]() {
		
		return this.container.querySelectorAll(':scope > scenarios-node');
		
	}
	
	load(data) {
		
		const { docs } = data;
		
		if (Array.isArray(docs)) {
			
			const { docSelector } = this, { length } = docs, options = [];
			let i, option;
			
			i = -1;
			while (++i < length) {
				
				(options[i] = option = document.createElement('option')).text = option.value = i;
				
			}
			
			docSelector.replaceChildren(...options);
			
		}
		
	}
	
	getDocFromStorage(name) {
		
		const { getStorage, take } = HTMLDocsManagerElement;
		
		return take(getStorage(this.id).docs, 'name', name);
		
	}
	
	toJSON() {
		
		const docs = [];
		let i;
		
		i = -1;
		for (const doc of this) docs[++i] = doc.toJSON();
		
		return docs;
		
	}
	
	getStorage() {
		
		return HTMLDocsManagerElement.getStorage(this.getAttribute('id') || undefined);
		
	}
	setStorage(data) {
		
		return !!HTMLDocsManagerElement.setStorage(this.getAttribute('id') || undefined);
		
	}
	
	get container() {
		
		return this.shadowRoot?.getElementById?.('container');
		
	}
	get createButton() {
		
		return this.shadowRoot?.getElementById?.('create');
		
	}
	get docCloseButton() {
		
		return this.shadowRoot?.getElementById?.('doc-close');
		
	}
	get docNameInput() {
		
		return this.shadowRoot?.getElementById?.('doc-name');
		
	}
	get docSaveButton() {
		
		return this.shadowRoot?.getElementById?.('doc-save');
		
	}
	get docSelector() {
		
		return this.shadowRoot?.getElementById?.('doc-selector');
		
	}
	get docSelectorButton() {
		
		return this.shadowRoot?.getElementById?.('doc-selector-button');
		
	}
	
}
HTMLDocsManagerElement.define();