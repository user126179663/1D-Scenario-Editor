import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLScenarioNodeElement extends HTMLCustomShadowElement {
	
	static tagName = 'scenario-node';
	
	static [HTMLCustomShadowElement.$attribute] = {
		
		editing: {
			
			observed(name, last, current) {
				
				this.editor?.setAttribute(name, typeof current === 'string');
				
			}
			
		},
		
		mutated(event) {
		}
		
	};
	
	static [HTMLCustomShadowElement.$bind] = {
		
		
		
	};
	
	static [HTMLCustomShadowElement.$init]() {
		
		
		
	}
	
	constructor() {
		
		super();
		
	}
	
	add(...contents) {
		
		const { isArray } = Array, { container, tabContainer } = this, { length } = contents, tabs = [];
		let i, content,controller, tab;
		
		i = -1;
		while (++i < length) {
			
			controller = document.createElement('scenario-controller'),
			isArray(content = contents[i]) ? controller.add(...content) : controller.add(content);
			
			const { tab, view } = document.createElement('tab-button').impliment('scenario', controller, '節');
			
			tabs[i] = tab, contents[i] = view;
			
		}
		
		tabContainer.append(...tabs),
		container.append(...contents),
		
		tabs[tabs.length - 1].select();
		
	}
	
	//*[Symbol.iterator]() {
	//	
	//	const { begin, branch, end } = this;
	//	
	//	begin && (yield begin);
	//	
	//	if (branch) for (const v of branch) yield v;
	//	
	//	end && (yield end);
	//	
	//}
	
	//toJSON() {
	//	
	//	const	{ begin, branch: branchNodes, end } = this,
	//			{ length } = branchNodes,
	//			branch = [],
	//			json = { begin: begin.toJSON(), branch, end: end.toJSON() };
	//	let i;
	//	
	//	i = -1;
	//	while (++i < length) branch[i] = branchNodes[i].toJSON();
	//	
	//	return json;
	//	
	//}
	
	//get begin() {
	//	
	//	return this.shadowRoot.getElementById('begin')?.querySelector('scenario-controller');
	//	
	//}
	//get branch() {
	//	
	//	return this.shadowRoot.getElementById('branch')?.querySelectorAll('scenario-controller');
	//	
	//}
	get container() {
		
		return this.shadowRoot?.getElementById?.('scenario');
		
	}
	get editor() {
		
		return this.shadowRoot?.getElementById?.('editor');
		
	}
	get tabContainer() {
		
		return this.shadowRoot?.getElementById?.('scenario-tabs');
		
	}
	//get end() {
	//	
	//	return this.shadowRoot.getElementById('end')?.querySelector('scenario-controller');
	//	
	//}
	
}
HTMLScenarioNodeElement.define();