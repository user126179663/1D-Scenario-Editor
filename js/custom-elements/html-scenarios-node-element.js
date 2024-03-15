import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLScenariosNodeElement extends HTMLCustomShadowElement {
	
	static tagName = 'scenarios-node';
	
	static [HTMLCustomShadowElement.$bind] = {
		
		interactedAddButton() {
			
			const	{ scenariosNode, scenariosTabsNode } = this,
					tab = document.createElement('tab-node');
			
			tab.group = 'scenarios',
			
			scenariosNode.appendChild(tab),
			scenariosTabsNode.appendChild(tab.constrain(document.createElement('scenario-node')));
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$init]() {
		
		const { addButton, interactedAddButton } = this;
		
		this.addListener(addButton, 'click', interactedAddButton);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[Symbol.iterator]() {
		
		return this.shadowRoot.getElementById('scenarios')?.querySelectorAll?.('node-element') ?? [][Symbol.iterator]();
		
	}
	
	toJSON() {
		
		const nodes = [];
		let i;
		
		i = -1;
		for (const v of this) nodes[++i] = v.toJSON();
		
		return { nodes };
		
	}
	
	get scenariosNode() {
		
		return this.shadowRoot?.getElementById?.('scenarios');
		
	}
	get scenariosTabsNode() {
		
		return this.shadowRoot?.getElementById?.('scenarios-tabs');
		
	}
	get addButton() {
		
		return this.shadowRoot.getElementById('add');
		
	}
	
}
HTMLScenariosNodeElement.define();