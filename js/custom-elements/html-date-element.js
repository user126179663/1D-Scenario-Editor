import { HTMLRootElement } from './html-root-element.js'
import { HTMLClockWorkElement, HTMLSuperClockElement } from './html-super-clock-element.js';

export class HTMLInheritedSCElement extends HTMLSuperClockElement {
	
	static shadowOption = { mode: 'open' };
	static tagName = 'inherited-sc';
	static templateId = this.tagName;
	
	constructor() {
		
		super(...arguments);
		
		const { constructor: { shadowOption, templateId } } = this;
		
		this.attachShadow(shadowOption).appendChild(document.getElementById(templateId).content.cloneNode(true));
		
	}
	
}
HTMLInheritedSCElement[HTMLClockWorkElement.$inheritance] = HTMLInheritedSCElement.tagName,
HTMLInheritedSCElement.cdp = 'isc';

export default class HTMLDateElement extends HTMLInheritedSCElement {
	
	static tagName = 'date-element';
	static templateId = this.tagName;
	
	constructor() {
		
		super(...arguments);
		
	}
	
}
HTMLDateElement[HTMLClockWorkElement.$inheritance] = HTMLDateElement.tagName,
HTMLDateElement[HTMLRootElement.$iterator] = `[data-${HTMLDateElement.cdp = 'date'}]`;

customElements.define(HTMLDateElement.tagName, HTMLDateElement);