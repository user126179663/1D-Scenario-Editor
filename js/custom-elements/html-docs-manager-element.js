import HTMLAppCommonBaseElement from './html-app-common-base-element.js';

export default class HTMLDocsManagerElement extends HTMLAppCommonBaseElement {
	
	static DEFAULT_STORAGE_KEY = '_';
	static STORAGE_KEY_PREFIX = '1dse@';
	static tagName = 'docs-man';
	
	static [HTMLAppCommonBaseElement.$attribute] = {
	};
	
	// このプロパティは、プロトタイプを辿った統合をされない。
	// 一方、自身のプロパティとしてこのプロパティを上書きしなければ、プロトタイプ上の直近の同名プロパティが使われる。
	static [HTMLAppCommonBaseElement.$tabCreator] = {
		
		['#tabs'](target, index, length, tabButton, callee, targets) {
			
			const doc = document.createElement('doc-man'),
					scenariosNode = document.createElement('scenarios-node'),
					scenarioNode = document.createElement('scenario-node'),
					content = document.createElement('span'),
					contentEditor = document.createElement('editable-element'),
					scenarioController = document.createElement('scenario-controller');
			
			scenarioController.add(null),
			scenarioNode.add(scenarioController),
			scenariosNode.appendScenarioNodes(scenarioNode),
			
			doc.appendScenariosNodes(scenariosNode),
			
			content.textContent = doc.name,
			content.slot = 'editor',
			
			contentEditor.appendChild(content);
			
			return { tabContent: contentEditor, group: 'doc', target: doc };
			
		}
		
	};
	
	static [HTMLAppCommonBaseElement.$bind] = {
		
		emittedSaving(event) {
			
			const doc = event.composedPath()[0];
			
			if (doc?.tagName === 'DOC-MAN') {
				
				const	{ getStorage, setStorage, take } = HTMLDocsManagerElement,
						{ id } = this,
						{ uid } = doc,
						data = getStorage(id),
						{ docs = [] } = data,
						index = take(docs, 'uid', uid, true),
						{ length } = docs;
				
				(data.docs = docs)[index < length ? index : length] =
					{ uid, doc: JSON.stringify(HTMLAppCommonBaseElement.jsonalize(doc)) },
				
				/*setStorage(id, data)*/true && doc.bubble('saved', this, true);
				
			}
			
		},
		
		interactedCreateButton(event) {
			
			const { docTabsContainer, docTabViewsContainer, generateTabTarget } = this;
			
			this.appendTabs(docTabsContainer, docTabViewsContainer, generateTabTarget, 1),
			
			docTabsContainer.lastElementChild?.select?.();
			
		},
		
		interactedSelectorButton(event) {
			
			const	{ getStorage } = HTMLDocsManagerElement,
					data = getStorage(this.id),
					{ docs } = data,
					{ docSelector } = this;
			
			this.container.replaceChildren(...HTMLAppCommonBaseElement.nodify(JSON.parse(docs[docSelector.selectedIndex])));
			
		},
		
		mutated(event) {
			
			/^❣️\s*/.test(document.title) || (document.title = '❣️ ' + document.title);
			
		},
		
		onAppendTab(event) {
			
			const { docTabsContainer, docTabViewsContainer, generateTabTarget } = this;
			
			docTabsContainer.appendTabs(docTabViewsContainer, generateTabTarget, 1),
			
			docTabsContainer.lastElementChild?.select?.();
			
		},
		
		onPrependTab(event) {
			
			const { docTabsContainer, docTabViewsContainer, generateTabTarget } = this;
			
			docTabsContainer.prependTabs(docTabViewsContainer, generateTabTarget, 1),
			
			docTabsContainer.firstElementChild?.select?.();
			
		},
		
		saved(event) {
			
			this.container.querySelectorAll(':scope > doc-man.mutated').length ||
				(document.title = document.title.replace(/^❣️\s*/, ''))
			
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
				
				return true;
				
			} catch (error) {
				
				console.warn(error);
				
			}
			
		}
		
		return false;
		
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
	
	static [HTMLAppCommonBaseElement.$init]() {
		
		const	{
					createButton,
					docSaveButton,
					docSelectorButton,
					emittedSaving,
					interactedCreateButton,
					interactedSaveButton,
					interactedSelectorButton,
					mutated,
					saved
				} = this;
		
		//docTabsContainer.appendChild(document.getElementById('tab-container-parts').content.cloneNode(true)),
		
		this.addListener(createButton, 'click', interactedCreateButton),
		this.addListener(docSelectorButton, 'click', interactedSelectorButton),
		this.addListener(this, 'save', emittedSaving),
		this.addListener(this, 'mutated', mutated),
		this.addListener(this, 'saved', saved);
		
	}
	
	constructor() {
		
		super();
		
		const { id } = this;
		
		this.load?.(HTMLDocsManagerElement.getStorage(id));
		
	}
	
	[Symbol.iterator]() {
		
		return this.container?.querySelectorAll?.(':scope > scenarios-node') ?? [][Symbol.iterator]();
		
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
	//get docNameInput() {
	//	
	//	return this.shadowRoot?.getElementById?.('doc-name');
	//	
	//}
	//get docSaveButton() {
	//	
	//	return this.shadowRoot?.getElementById?.('doc-save');
	//	
	//}
	get docSelector() {
		
		return this.shadowRoot?.getElementById?.('doc-selector');
		
	}
	get docSelectorButton() {
		
		return this.shadowRoot?.getElementById?.('doc-selector-button');
		
	}
	get docTabsContainer() {
		
		return this.shadowRoot?.getElementById?.('tabs');
		
	}
	get docTabViewsContainer() {
		
		return this.shadowRoot?.getElementById?.('tab-views');
		
	}
	
}
HTMLDocsManagerElement.define();