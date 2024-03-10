import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLScenarioNodeElement extends HTMLCustomShadowElement {
	
	static tagName = 'scenario-node';
	
	static [HTMLCustomShadowElement.$attribute] = {
		
		editing: {
			
			observed(name, last, current) {
				
				this.editor?.setAttribute(name, typeof current === 'string');
				
			}
			
		}
		
	};
	
	constructor() {
		
		super();
		
	}
	
	[HTMLCustomShadowElement.$init]() {
		
		
		
	}
	
	*[Symbol.iterator]() {
		
		const { begin, branch, end } = this;
		
		yield begin;
		
		for (const v of branch) yield v;
		
		yield end;
		
	}
	
	toJSON() {
		
		const	{ begin, branch: branchNodes, end } = this,
				{ length } = branchNodes,
				branch = [],
				json = { begin: begin.toJSON(), branch, end: end.toJSON() };
		let i;
		
		i = -1;
		while (++i < length) branch[i] = branchNodes[i].toJSON();
		
		return json;
		
	}
	
	get begin() {
		
		return this.shadowRoot.getElementById('begin')?.querySelector('scenario-controller');
		
	}
	get branch() {
		
		return this.shadowRoot.getElementById('branch')?.querySelectorAll('scenario-controller');
		
	}
	get editor() {
		
		return this.shadowRoot?.getElementById?.('editor');
		
	}
	get end() {
		
		return this.shadowRoot.getElementById('end')?.querySelector('scenario-controller');
		
	}
	
}
HTMLScenarioNodeElement.define();