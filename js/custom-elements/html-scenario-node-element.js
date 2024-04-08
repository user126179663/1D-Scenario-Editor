import HTMLAppCommonBaseElement from './html-app-common-base-element.js';

export default class HTMLScenarioNodeElement extends HTMLAppCommonBaseElement {
	
	static tagName = 'scenario-node';
	
	static [HTMLAppCommonBaseElement.$attribute] = {
		
		editing: {
			
			observed(name, last, current) {
				
				this.editor?.setAttribute(name, typeof current === 'string');
				
			}
			
		},
		
		mutated(event) {
		}
		
	};
	
	static [HTMLAppCommonBaseElement.$createTab](target, index, length, tabButton, callee, targets, option) {
		
		const	content = document.createElement('span'),
				contentEditor = document.createElement('editable-element');
		
		target ?? (target = document.createElement('scenario-controller')).add(null),
		
		content.textContent = '段落',
		content.slot = 'editor',
		
		contentEditor.appendChild(content);
		hi(target);
		return { group: 'scenario', tabContent: contentEditor, target };
		
	}
	
	static [HTMLAppCommonBaseElement.$bind] = {
		
		generateTabTarget(target, index, length, tabButton, callee, targets) {
			
			const	content = document.createElement('span'),
					contentEditor = document.createElement('editable-element');
			
			target ?? (target = document.createElement('scenario-controller')),
			
			content.textContent = '段落',
			content.slot = 'editor',
			
			contentEditor.appendChild(content);
			
			return { group: 'scenario', tabContent: contentEditor, target };
			
		}
		
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
	
	static [HTMLAppCommonBaseElement.$init]() {
		
		
		
	}
	
	constructor() {
		
		super();
		
	}
	
	add() {
		
		const { container, generateTabTarget, tabContainer } = this;
		
		this.addTabs({ callback: generateTabTarget, container: tabContainer, viewer: container }, ...arguments);
		
		//return;
		//
		//const { isArray } = Array, { container, tabContainer } = this, { length } = contents, tabs = [];
		//let i, content,controller, tab;
		//
		//i = -1;
		//while (++i < length) {
		//	
		//	controller = document.createElement('scenario-controller'),
		//	isArray(content = contents[i]) ? controller.add(...content) : controller.add(content);
		//	
		//	const	span = document.createElement('span'),
		//			contentEditor = document.createElement('editable-element');
		//	
		//	span.textContent = '段落',
		//	span.slot = 'editor',
		//	
		//	contentEditor.appendChild(span);
		//	
		//	const { tab, view } = document.createElement('tab-button').impliment('scenario', controller, contentEditor);
		//	
		//	tabs[i] = tab, contents[i] = view;
		//	
		//}
		//
		//tabContainer.append(...tabs),
		//container.append(...contents),
		//
		//tabs[tabs.length - 1].select();
		
	}
	
	_add(...contents) {
		
		const { isArray } = Array, { container, tabContainer } = this, { length } = contents, tabs = [];
		let i, content,controller, tab;
		
		i = -1;
		while (++i < length) {
			
			controller = document.createElement('scenario-controller'),
			isArray(content = contents[i]) ? controller.add(...content) : controller.add(content);
			
			const { tab, view } = document.createElement('tab-button').impliment('scenario', controller, '段落');
			
			tabs[i] = tab, contents[i] = view;
			
		}
		
		tabContainer.append(...tabs),
		container.append(...contents),
		
		tabs[tabs.length - 1].select();
		
	}
	
	get container() {
		
		return this.shadowRoot?.getElementById?.('tab-views');
		
	}
	get editor() {
		
		return this.shadowRoot?.getElementById?.('editor');
		
	}
	get tabContainer() {
		
		return this.shadowRoot?.getElementById?.('tabs');
		
	}
	
}
HTMLScenarioNodeElement.define();