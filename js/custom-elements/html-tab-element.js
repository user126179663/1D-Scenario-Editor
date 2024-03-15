import { HTMLCustomElement, default as HTMLCustomShadowElement } from './html-custom-element.js';

export class HTMLTabElement extends HTMLCustomElement {
	
	static $deselected = Symbol('HTMLTabElement.$deselected');
	static $selected = Symbol('HTMLTabElement.$selected');
	static icon = { doc: '🖊️' };
	static tagName = 'tab-node';
	
	static [HTMLCustomElement.$attribute] = {
		
		selected: {
			
			observed(name, last, current) {
				
				last === current || this[HTMLTabElement[`$${current ? '' : 'de'}selected`]]?.();
				
			}
			
		}
		
	};
	
	static [HTMLCustomElement.$bind] = {
		
		interacted() {
			
			if (!this.selected) {
				
				for (const tab of this.tabs) tab === this || (tab.selected = false);
				
				this.selected = true;
				
			}
			
		},
		
		onCloseTab(event) {
			
			const { view } = this;
			
			view.deleteAll(), this.deleteAll(), event.stopPropagation();
			
		}
		
	};
	
	static [HTMLCustomElement.$init]() {
		
		const { interacted, onCloseTab } = this;
		
		this.addListener(this, 'click', interacted),
		this.addListener(this, 'tab-close', onCloseTab);
		
	}
	
	//static create(target, content, group, id = crypto.randomUUID()) {
	//	
	//	const	created = new DocumentFragment(),
	//			tab = document.createElement('tab-node'),
	//			tabButton = document.createElement('tab-button'),
	//			view = document.createElement('tab-view');
	//	let contentNode;
	//	
	//	tab.tabFor = view.id = id,
	//	tab.group = group,
	//	
	//	content instanceof Element ?
	//		(contentNode = content) : ((contentNode = document.createElement('span')).textContent = content),
	//	
	//	tabButton.appendChild(contentNode).slot = 'content',
	//	tab.appendChild(tabButton),
	//	
	//	view.appendChild(target),
	//	
	//	created.append(tab, view);
	//	
	//	return created;
	//	
	//}
	
	constructor() {
		
		super();
		
	}
	
	select(state) {
		
		for (const tab of this.tabs) tab === this || (tab.selected = false);
		
		this.selected = true;
		
	}
	
	set(target, icon, content, group, id) {
		
		const	{ icon: presetIcon } = HTMLTabElement,
				iconNode = icon instanceof Element ? icon : document.createElement('span'),
				tabButton = document.createElement('tab-button'),
				view = document.createElement('tab-view');
		let contentNode;
		
		this.tabFor = view.id = ''+(id ?? '') || 'tab-' + crypto.randomUUID(),
		this.group = group,
		
		iconNode.slot = 'icon',
		typeof icon === 'string' && (iconNode.textContent = presetIcon[Object.hasOwn(presetIcon, icon) ? icon : 'doc']),
		
		content instanceof Element ?
			(contentNode = content) : ((contentNode = document.createElement('span')).textContent = content),
		contentNode.slot = 'content',
		
		tabButton.append(iconNode, contentNode),
		this.replaceChildren(tabButton),
		
		view.appendChild(target);
		
		return view;
		
	}
	
	toggleSelect(value) {
		
		const { view } = this;
		
		if (view instanceof HTMLTabViewElement) {
			
			view.selected = value;
			
		}
		
	}
	
	get tabFor() {
		
		return this.getAttribute('for');
		
	}
	set tabFor(v) {
		
		this.setAttribute('for', v);
		
	}
	get group() {
		
		return this.getAttribute('group');
		
	}
	set group(v) {
		
		this.setAttribute('group', v);
		
	}
	get tabs() {
		
		return this.getRootNode().querySelectorAll(`tab-node[group="${this.group}"]`);
		
	}
	get view() {
		
		return this.getRootNode().querySelector(`tab-view#${this.tabFor}`);
		
	}
	get views() {
		
		const { tabs } = this, rootNode = this.getRootNode(), { length } = tabs, views = [];
		let i,i0, view;
		
		i = i0 = -1;
		while (++i < length) (view = rootNode.querySelector(`tab-view#${tabs[i].tabFor}`)) && (views[++i0] = view);
		
		return views;
		
	}
	
}
HTMLTabElement.prototype[HTMLTabElement.$selected] = function () {
	
	this.toggleSelect(true);
	
},
HTMLTabElement.prototype[HTMLTabElement.$deselected] = function () {
	
	this.toggleSelect(false);
	
};
HTMLTabElement.define();

export class HTMLTabViewElement extends HTMLCustomElement {
	
	static tagName = 'tab-view';
	
	constructor() {
		
		super();
		
	}
	
	get selected() {
		
		return this.hasAttribute('selected');
		
	}
	set selected(v) {
		
		this.toggleAttribute('selected', !!v);
		
	}
	
}
HTMLTabViewElement.define();

export class HTMLTabButtonElement extends HTMLCustomShadowElement {
	
	static tagName = 'tab-button';
	
	static [HTMLCustomElement.$bind] = {
		
		interactedCloseButton(event) {
			
			this.cancelableBubble('tab-close', undefined, true);
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$init]() {
		
		const { closeButton, interactedCloseButton } = this;
		
		this.addListener(closeButton, 'click', interactedCloseButton);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	get closeButton() {
		
		return this.shadowRoot?.getElementById('close');
		
	}
	
}
HTMLTabButtonElement.define();
//export default class HTMLTabsManagerElement extends HTMLCustomShadowElement {
//	
//	static SELECTOR_TABS_SLOT = 'slot[name="tabs"]';
//	static SELECTOR_VIEWS_SLOT = 'slot[name="tab-views"]';
//	static assignedNodesOption = { flatten: true };
//	static tagName = 'tabs-man';
//	
//	[HTMLCustomShadowElement.$bind] = {
//		
//		interactedViewsSlot(event) {
//			
//			const { tabsSlot } = this;
//			let slotted;
//			
//			slotted = event.target;
//			while (slotted?.assignedSlot !== tabsSlot && (slotted = slotted.parentElement));
//			
//			if (slotted) {
//				
//				const { tabViews } = this, { dataset: { tabFor } } = slotted, length = tabViews.length;
//				let i, view;
//				
//				i = -1;
//				while (++i < length && (view = tabViews[i]).dataset.viewId !== tabFor);
//				
//				if (i !== length) {
//					
//					const	{ tabs } = this, tabsLength = tabs.length;
//					
//					i = -1;
//					while (++i < tabsLength) delete tabs[i].dataset.tabSelected;
//					
//					i = -1;
//					while (++i < length) delete tabViews[i].dataset.viewSelected;
//					
//					tab.dataset.tabSelected = view.dataset.viewSelected = '';
//					
//				}
//				
//			}
//			
//		}
//		
//	};
//	
//	static [HTMLCustomShadowElement.$init]() {
//		
//		const { interactedViewsSlot, shadowRoot, tabsSlot, tabViewsSlot } = this;
//		
//		this.addListener(shadowRoot, 'click', interactedViewsSlot);
//		
//	}
//	
//	constructor() {
//		
//		super();
//		
//	}
//	
//	addTab(view, tab) {
//		
//		if (view instanceof Element) {
//			
//			if (!(tab instanceof Element)) {
//				
//				const title = document.createElement('span');
//				
//				title.textContent = 'sample',
//				title.slot = 'title',
//				
//				(tab = document.createElement('node-element')).appendChild(title);
//				
//			}
//			
//			tab.dataset.tabFor = view.dataset.viewId ||= crypto.randomUUID(),
//			
//			tab.slot = 'tabs', view.slot = 'tab-views';
//			
//			this.append(tab, view);
//			
//		}
//		
//	}
//	
//	get tabs() {
//		
//		return this.tabsSlot?.assignedNodes?.(HTMLTabsManagerElement.assignedNodesOption) ?? [];
//		
//	}
//	get tabsSlot() {
//		
//		return this.shadowRoot.querySelector(HTMLTabsManagerElement.SELECTOR_TABS_SLOT);
//		
//	}
//	get tabViews() {
//		
//		return this.tabViewsSlot?.assignedNodes?.(HTMLTabsManagerElement.assignedNodesOption) ?? [];
//		
//	}
//	get tabViewsSlot() {
//		
//		return this.shadowRoot.querySelector(HTMLTabsManagerElement.SELECTOR_VIEWS_SLOT);
//		
//	}
//	
//}
//HTMLTabsManagerElement.define();