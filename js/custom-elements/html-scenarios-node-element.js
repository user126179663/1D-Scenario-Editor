//import HTMLTabsManagerElement from './html-custom-element.js';
import HTMLTabsManagerElement from './html-tab-element.js';

export default class HTMLScenariosNodeElement extends HTMLTabsManagerElement {
	
	static tagName = 'scenarios-node';
	static defaultScenarioTabOption = { group: 'scenarios', tabContent: '章' };
	
	static [HTMLTabsManagerElement.$event] = {
		
		'node-slotted': [
			{
				targets: true,
				handlers(event) {
					
					const	{ detail: { isDischarged, target } } = event,
							method = isDischarged ? 'remove' : 'add' + 'Listener';
					
					switch (target.id) {
						
						case 'add-after':
						this[method](target, 'click', this.interactedAddAfterButton);
						break;
						
						case 'add-before':
						this[method](target, 'click', this.interactedAddBeforeButton);
						break;
						
						case 'create-new-sec':
						this[method](target, 'click', this.interactedCreateSecButton);
						break;
						
						case 'duplicate-current-sec':
						this[method](target, 'click', this.interactedDuplicateSecButton);
						break;
						
						case 'delete-current-sec':
						this[method](target, 'click', this.interactedDeleteSecButton);
						break;
						
					}
					
				}
			}
		]
		
	};
	
	static wrapScenarioNode(scenarioNode) {
		/*
			<button id="create-new-edition" type="button" data-iop-inactivatable>新しく節を作成</button>
			<button id="create-next-edition" type="button" data-iop-inactivatable>選択中の節を複製</button>
		*/
		const wrapper = document.createElement('node-element');
		
		scenarioNode.slot = 'node',
		
		wrapper.append(scenarioNode, document.getElementById('scenario-node-wrapper-parts').content.cloneNode(true));
		
		return wrapper;
		
	}
	
	static [HTMLTabsManagerElement.$bind] = {
		
		generateTabTarget(target, index, length, tabButton, callee, targets) {
			
			//const node = document.createElement('node-element');
			//
			//target.slot = 'node',
			//
			//node.append(target, document.getElementById('node-element-parts').content.cloneNode(true));
			
			const	content = document.createElement('span'),
					contentEditor = document.createElement('editable-element');
			
			content.textContent = '節',
			content.slot = 'editor',
			
			contentEditor.appendChild(content);
			
			return { group: 'scenarios', tabContent: contentEditor, target: HTMLScenariosNodeElement.wrapScenarioNode(target) };
			
		},
		
		interactedAddAfterButton(event) {
			
			const	scenarioNode = document.createElement('scenario-node'),
					scenarioController = document.createElement('scenario-controller');
			
			scenarioController.add(null),
			scenarioNode.add(scenarioController),
			
			event.composedPath()[0].assignedSlot.getRootNode().host.parentElement.appendChild
				(HTMLScenariosNodeElement.wrapScenarioNode(scenarioNode));
			
		},
		
		interactedAddBeforeButton(event) {
			
			const	scenarioNode = document.createElement('scenario-node'),
					scenarioController = document.createElement('scenario-controller');
			
			scenarioController.add(null),
			scenarioNode.add(scenarioController),
			
			event.composedPath()[0].assignedSlot.getRootNode().host.parentElement.prepend
				(HTMLScenariosNodeElement.wrapScenarioNode(scenarioNode));
			//this.insert(document.createElement('scenario-node'));
			
		},
		
		interactedCreateSecButton(event) {
			
			hi(event);
			// 
			
		},
		
		interactedDuplicateSecButton(event) {
			
			hi(event);
			
		},
		
		interactedDeleteSecButton(event) {
			
			hi(event);
			
		},
		
		interactedAddButton(event) {
			
			const	{ scenariosContainer, scenariosTabsContainer } = this,
					tabButton = document.createElement('tab-button'),
					{ tab, view } = tabButton.impliment('scenarios', document.createElement('scenario-node'), 'sample');
			
			scenariosTabsContainer.appendChild(tab),
			scenariosContainer.appendChild(view);
			
		}
		
	};
	
	static [HTMLTabsManagerElement.$init]() {
		
		const { addButton, interactedAddButton, shadowRoot, nodeSlotted } = this;
		
		this.addListener(addButton, 'click', interactedAddButton);
		
		//this.addListener(shadowRoot, 'node-slotted', nodeSlotted);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	//[Symbol.iterator]() {
	//	
	//	return this.shadowRoot.getElementById('scenarios')?.querySelectorAll?.('node-element') ?? [][Symbol.iterator]();
	//	
	//}
	
	appendScenarioNodes(...scenarioNodes) {
		
		//const { constructor: { defaultScenarioTabOption }, scenariosTabsContainer: { lastChildElement } } = this;
		//
		//this.insertTabsAfter(lastChildElement, defaultScenarioTabOption);
		//
		//const { scenariosContainer, scenariosTabsContainer } = this, { tabs, views } = this.create(...scenarioNodes);
		//
		//scenariosTabsContainer.append(...tabs),
		//scenariosContainer.append(...views),
		//
		//tabs[tabs.length - 1].select();
		
		const { generateTabTarget, scenariosContainer, scenariosTabsContainer } = this;
		
		this.appendTabs(scenariosTabsContainer, scenariosContainer, generateTabTarget, ...arguments);
		
	}
	
	create(...nodes) {
		
		const { scenariosContainer, scenariosTabsContainer } = this, { length } = nodes, tabs = [];
		let i, node;
		
		i = -1;
		while (++i < length) {
			
			(node = document.createElement('node-element')).appendChild(nodes[i]).slot = 'node',
			
			node.appendChild(document.getElementById('node-element-parts').content.cloneNode(true));
			
			const { tab, view } = document.createElement('tab-button').impliment('scenarios', node, '章');
			
			tabs[i] = tab, nodes[i] = view;
			
		}
		
		return { tabs, views: nodes };
		
	}
	
	insertBefore(referenceNode, ...nodes) {
		
		const	isTab = referenceNode instanceof HTMLTabElement,
				id = isTab ? referenceNode.tabFor : referenceNode instanceof HTMLTabViewElement && referenceNode.id;
		
		if (id) {
			
			const rootNode = referenceNode.getRootNode(),
					referencePeerNode = isTab ? rootNode.getElementById(id) : rootNode.querySelector(`tab-node[for="${id}"]`),
					{ tabs, views } = this.create(...nodes);
			
			isTab ?	(referenceNode.prepend(...tabs), referencePeerNode.prepend(...views)) :
						(referencePeerNode.prepend(...tabs), referenceNode.prepend(...views)),
			
			tabs[tabs.length - 1].select();
			
		}
		
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