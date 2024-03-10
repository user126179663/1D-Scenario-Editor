import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLDocManagerElement extends HTMLCustomShadowElement {
	
	static DEFAULT_STORAGE_KEY = '_';
	static STORAGE_KEY_PREFIX = 'odd-docs@'
	static tagName = 'doc-man';
	
	static [HTMLCustomShadowElement.$attribute] = {
	};
	
	static [HTMLCustomShadowElement.$bind] = {
		
		interactedCloseButton(event) {
			
			
			
			this.dispatchEvent(new CustomEvent('save'));
			
		},
		
		interactedSaveButton(event) {
			
			this.dispatchEvent(new CustomEvent('close'));
			
		}
		
	};
	
	static getDate(element) {
		
		const { dataset: { type }, value } = element;
		let v;
		
		switch (type) {
			
			case 'number':
			v = Number(value);
			break;
			
			case 'string':
			v = value;
			break;
			
			default:
			v = 0;
			
		}
		
		return new Date(v);
		
	}
	static setDate(element, date) {
		
		const type = typeof date;
		
		switch (type) {
			
			case 'number': case 'string':
			
			element.dataset.type = type,
			element.value = date;
			
			break;
			
			case 'object':
			
			date instanceof Date || (date = Array.isArray(date) ? new Date(...date) : date = new Date()),
			
			element.dataset.type = 'number',
			element.value = date.getTime();
			
			break;
			
		}
		
	}
	
	constructor() {
		
		super();
		
		const { createdTimeInput, uidInput, updatedTimeInput } = this;
		
		createdTimeInput.value = updatedTimeInput.value = Date.now(),
		uidInput.value ??= crypto.randomUUID();
		
	}
	
	[HTMLCustomShadowElement.$init]() {
		
		const { closeButton, interactedCloseButton, interactedSaveButton, saveButton } = this;
		
		this.addListener(closeButton, 'click', interactedCloseButton),
		this.addListener(saveButton, 'click', interactedSaveButton);
		
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
	
	get container() {
		
		return this.shadowRoot?.getElementById?.('container');
		
	}
	get closeButton() {
		
		return this.shadowRoot?.getElementById?.('close');
		
	}
	get createdTime() {
		
		return HTMLDocManager.getDate(this.createdTimeInput);
		
	}
	set createdTime(v) {
		
		HTMLDocManager.setDate(this.createdTimeInput, v);
		
	}
	get createdTimeInput() {
		
		return this.shadowRoot?.getElementById?.('created-time');
		
	}
	get nameInput() {
		
		return this.shadowRoot?.getElementById?.('name');
		
	}
	get saveButton() {
		
		return this.shadowRoot?.getElementById?.('save');
		
	}
	get uid() {
		
		return this.uidInput.value;
		
	}
	get uidInput() {
		
		return this.shadowRoot?.getElementById?.('uid');
		
	}
	get updatedTime() {
		
		return HTMLDocManager.getDate(this.updatedTimeInput);
		
	}
	set updatedTime(v) {
		
		HTMLDocManager.setDate(this.updatedTimeInput, v);
		
	}
	get updatedTimeInput() {
		
		return this.shadowRoot?.getElementById?.('updated-time');
		
	}
	set updatedTime(v) {
		
		const type = typeof v;
		
		if (type === 'number' || type === 'string') {
			
			const { updatedTimeInput } = this;
			
			updatedTime.dataset.type = type,
			updatedTimeInput.value = v;
			
		}
		
	}
	
}
HTMLDocsManagerElement.define();