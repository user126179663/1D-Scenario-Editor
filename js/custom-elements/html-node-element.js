import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLNodeElement extends HTMLCustomShadowElement {
	
	static bodyAssignedNodesOption = { flatten: true };
	static tagName = 'node-element';
	
	static [HTMLCustomShadowElement.$bind] = {
		
		interactedDeleteButton(event) {
			
			this.deleteAll();
			
		}
		
	};
	
	constructor() {
		
		super();
		
	}
	
	[HTMLCustomShadowElement.$init]() {
		
		const { deleteButton, interactedDeleteButton } = this;
		
		this.addListener(deleteButton, 'click', interactedDeleteButton);
		
	}
	
	get body() {
		
		return this.shadowRoot.getElementById('body')?.assignedNodes?.(HTMLNodeElement.bodyAssignedNodesOption)?.[0];
		
	}
	get deleteButton() {
		
		return this.shadowRoot.getElementById('delete');
		
	}
	
}
HTMLNodeElement.define();