import HTMLCustomShadowElement from './html-custom-element.js';
import HTMLNodeElement from './html-node-element.js';

export default class HTMLScenariosNodeElement extends HTMLCustomShadowElement {
	
	static tagName = 'scenarios-node';
	
	static [HTMLCustomShadowElement.$bind] = {
		
		interactedAddButton() {
			
			const node = document.createElement('node-element'), scenario = document.createElement('scenario-node');
			
			scenario.slot = 'node'
			
			node.appendChild(scenario),
			
			this.scenariosNode.appendChild(node);
			
		}
		
	};
	
	constructor() {
		
		super();
		
	}
	
	[HTMLCustomShadowElement.$init]() {
		
		const { addButton, interactedAddButton } = this;
		
		this.addListener(addButton, 'click', interactedAddButton);
		
	}
	
	[Symbol.iterator]() {
		
		return this.shadowRoot.getElementById('scenarios')?.querySelectorAll?.('node-element');
		
	}
	
	toJSON() {
		
		const nodes = [];
		let i;
		
		i = -1;
		for (const v of this) nodes[++i] = v.toJSON();
		
		return { nodes };
		
	}
	
	get scenariosNode() {
		
		return this.shadowRoot.getElementById('scenarios');
		
	}
	get addButton() {
		
		return this.shadowRoot.getElementById('add');
		
	}
	
}
HTMLScenariosNodeElement.define();