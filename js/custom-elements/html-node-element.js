import HTMLAssignableElement from './html-assignable-element.js';

export default class HTMLNodeElement extends HTMLAssignableElement {
	
	static EVENT_TYPE_NODE_SLOTTED = 'node-slotted';
	static bodyAssignedNodesOption = { flatten: true };
	static tagName = 'node-element';
	
	static [HTMLAssignableElement.$bind] = {
		
		//changedSlot(event) {
		//	
		//	const	{ assignment } = this,
		//			{ target } = event,
		//			assigned = (assignment.has(target) ? assignment : assignment.set(target, [])).get(target),
		//			slotted = [],
		//			nodes = target.assignedNodes();
		//	let i,l,i0, node;
		//	
		//	i = i0 = -1, l = nodes.length;
		//	while (++i < l) assigned.indexOf(node = nodes[i]) === -1 && (slotted[++i0] = node);
		//	
		//	i = i0 = -1, l = assigned.length;
		//	while (++i < l) nodes.indexOf(node = assigned[i]) === -1 && (assigned.splice(i--, 1), --l);
		//	
		//	assigned.push(...slotted),
		//	
		//	this.bubble('node-slotted', slotted);
		//	
		//},
		
		interactedDeleteButton(event) {
			
			this.deleteAll();
			
		}
		
	};
	
	static [HTMLAssignableElement.$slot] = {
		
		slot(event, target, isDischarged, changed) {
			
			this.bubble(HTMLNodeElement.EVENT_TYPE_NODE_SLOTTED, { isDischarged, node: this, target });
			
		}
		
	}
	
	static [HTMLAssignableElement.$init]() {
		
		const	{ deleteButton, interactedDeleteButton } = this;
		
		this.addListener(deleteButton, 'click', interactedDeleteButton);
		
	}
	
	//static [HTMLAssignableElement.$init]() {
	//	
	//	const	{ changedSlot, deleteButton, interactedDeleteButton } = this,
	//			slots = this.shadowRoot.querySelectorAll('slot'),
	//			{ length } = slots;
	//	let i;
	//	
	//	i = -1;
	//	while (++i < length) this.addListener(slots[i], 'slotchange', changedSlot);
	//	
	//	this.addListener(deleteButton, 'click', interactedDeleteButton);
	//	
	//}
	
	constructor() {
		
		super();
		
		this.assignment = new WeakMap();
		
	}
	
	get addAfterButton() {
		
		return this.shadowRoot?.getElementById?.('add-after');
		
	}
	get addBeforeButton() {
		
		return this.shadowRoot?.getElementById?.('add-before');
		
	}
	get body() {
		
		return this.shadowRoot.getElementById('body')?.assignedNodes?.(HTMLNodeElement.bodyAssignedNodesOption)?.[0];
		
	}
	get deleteButton() {
		
		return this.shadowRoot.getElementById('delete');
		
	}
	
}
HTMLNodeElement.define();