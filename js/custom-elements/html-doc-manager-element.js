//import HTMLCustomShadowElement from './html-custom-element.js';
import HTMLTabsManagerElement from './html-tab-element.js';

export default class HTMLDocManagerElement extends HTMLTabsManagerElement {
	
	static DEFAULT_STORAGE_KEY = '_';
	static STORAGE_KEY_PREFIX = 'od-docs@'
	static tagName = 'doc-man';
	static defaultScenariosTabOption = { group: 'scenarios', tabContent: '題名未定' };
	
	static [HTMLTabsManagerElement.$attribute] = {
	};
	
	static [HTMLTabsManagerElement.$bind] = {
		
		interactedCreateNewEditionButton(event) {
			
			const	scenariosNode = document.createElement('scenarios-node'),
					scenarioNode = document.createElement('scenario-node');
			
			scenarioNode.add(null),
			scenariosNode.appendScenarioNodes(scenarioNode),
			
			this.appendScenariosNodes(scenariosNode);
			
		},
		
		interactedCloseButton(event) {
			
			this.bubble('close', event, true);
			
		},
		
		interactedSaveButton(event) {
			
			this.bubble('save', event, true);
			
		},
		
		mutated(event) {
			
			this.classList.add('mutated');
			
		},
		
		saved() {
			
			this.classList.remove('mutated');
			
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
	
	static [HTMLTabsManagerElement.$init]() {
		
		const	{
					closeButton,
					createNewEditionButton,
					createNextEditionButton,
					interactedCloseButton,
					interactedCreateNewEditionButton,
					interactedCreateNextEditionButton,
					interactedSaveButton,
					mutated,
					saveButton,
					saved,
					shadowRoot
				} = this;
		
		this.addListener(createNewEditionButton, 'click', interactedCreateNewEditionButton),
		this.addListener(createNextEditionButton, 'click', interactedCreateNextEditionButton),
		
		this.addListener(this, 'mutated', mutated),
		this.addListener(this, 'saved', saved),
		this.addListener(closeButton, 'click', interactedCloseButton),
		this.addListener(saveButton, 'click', interactedSaveButton);
		
	}
	
	constructor() {
		
		super();
		
		const { createdTimeInput, uidInput, updatedTimeInput } = this;
		
		createdTimeInput.value = updatedTimeInput.value = Date.now(),
		uidInput.value ??= crypto.randomUUID();
		
	}
	
	[Symbol.iterator]() {
		
		return this.container?.querySelectorAll?.(':scope > scenarios-node') ?? [][Symbol.iterator]();
		
	}
	
	appendScenariosNodes() {
		
		const {
					constructor: { defaultScenariosTabOption },
					scenariosNodeTabsContainer,
					scenariosNodeTabViewsContainer
				} = this;
		
		this.appendTabs
			(scenariosNodeTabsContainer, scenariosNodeTabViewsContainer, defaultScenariosTabOption, ...arguments);
		
	}
	prependScenariosNodes() {
		
		const {
					constructor: { defaultScenariosTabOption },
					scenariosNodeTabsContainer,
					scenariosNodeTabViewsContainer
				} = this;
		
		this.prependTabs
			(scenariosNodeTabsContainer, scenariosNodeTabViewsContainer, defaultScenariosTabOption, ...arguments);
		
	}
	
	//add(...scenarios) {
	//	
	//	const	{ scenariosNodeTabsContainer, scenariosNodeTabViewsContainer } = this,
	//			length = scenarios.length,
	//			tabs = [];
	//	let i;
	//	
	//	i = -1;
	//	while (++i < length) {
	//		
	//		const { tab, view } = document.createElement('tab-button').impliment('scenarios', scenarios[i], '題名未定');
	//		
	//		tabs[i] = tab, scenarios[i] = view;
	//		
	//	}
	//	
	//	scenariosNodeTabsContainer.append(...tabs),
	//	scenariosNodeTabViewsContainer.append(...scenarios),
	//	
	//	tabs[length - 1].select();
	//	
	//}
	
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
	
	get closeButton() {
		
		return this.shadowRoot?.getElementById?.('close');
		
	}
	get container() {
		
		return this.shadowRoot?.getElementById?.('container');
		
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
	get createNewEditionButton() {
		
		return this.shadowRoot?.getElementById?.('create-new-edition');
		
	}
	get createNextEditionButton() {
		
		return this.shadowRoot?.getElementById?.('create-next-edition');
		
	}
	get name() {
		
		return this.nameInput?.value || '文書';
		
	}
	get nameInput() {
		
		return this.shadowRoot?.getElementById?.('name');
		
	}
	get nameWithIcon() {
		
		return '🖊️ ' + this.nameInput.value;
		
	}
	get saveButton() {
		
		return this.shadowRoot?.getElementById?.('save');
		
	}
	get scenariosNodeTabsContainer() {
		
		return this.shadowRoot?.getElementById('scenarios-node-tabs-container');
		
	}
	get scenariosNodeTabViewsContainer() {
		
		return this.shadowRoot?.getElementById('scenarios-node-tab-views-container');
		
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
HTMLDocManagerElement.define();