import HTMLCustomElement from './html-custom-element.js';

export default class HTMLLinkCardElement extends HTMLCustomElement {
	
	static tagName = 'link-card';
	static observedAttributeNames = [ 'href' ];
	
	static get observedAttributes() {
		
		return HTMLLinkCardElement.observedAttributeNames;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	attributeChangedCallback(name, last, current) {
		
		switch (name) {
			
			case 'href':
			this.shadowRoot.getElementById('link').href = current;
			break;
			
		}
		
	}
	
	get href() {
		
		return this.getAttribute('href');
		
	}
	set href(v) {
		
		this.setAttribute('href', v);
		
	}
	
}

customElements.define(HTMLLinkCardElement.tagName, HTMLLinkCardElement);