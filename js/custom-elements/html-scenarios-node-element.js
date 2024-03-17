import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLScenariosNodeElement extends HTMLCustomShadowElement {
	
	static tagName = 'scenarios-node';
	
	static [HTMLCustomShadowElement.$bind] = {
		
		interactedAddButton() {
			
			const	{ scenariosContainer, scenariosTabsContainer } = this,
					tabButton = document.createElement('tab-button'),
					{ tab, view } = tabButton.impliment('scenarios', document.createElement('scenario-node'), 'sample');
			
			scenariosTabsContainer.appendChild(tab),
			scenariosContainer.appendChild(view);
			
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
	
	add(...nodes) {
		
		const { scenariosContainer, scenariosTabsContainer } = this, { length } = nodes, tabs = [];
		let i, node;
		
		i = -1;
		while (++i < length) {
			
			(node = document.createElement('node-element')).appendChild(nodes[i]).slot = 'node';
			
			const { tab, view } = document.createElement('tab-button').impliment('scenarios', node, '章');
			
			tabs[i] = tab, nodes[i] = view;
			
		}
		
		scenariosTabsContainer.append(...tabs),
		scenariosContainer.append(...nodes),
		
		tabs[length - 1].select();
		
	}
	
	toJSON() {
		
		const nodes = [];
		let i;
		
		i = -1;
		for (const v of this) nodes[++i] = v.toJSON();
		
		return { nodes };
		
	}
	
	get scenariosContainer() {
		
		return this.shadowRoot?.getElementById?.('scenarios');
		
	}
	get scenariosTabsContainer() {
		
		return this.shadowRoot?.getElementById?.('scenarios-tabs');
		
	}
	get addButton() {
		
		return this.shadowRoot.getElementById('add');
		
	}
	
}
HTMLScenariosNodeElement.define();