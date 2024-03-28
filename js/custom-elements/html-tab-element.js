import { HTMLCustomElement, default as HTMLCustomShadowElement } from './html-custom-element.js';
import HTMLShadowListenerElement from './html-shadow-listener-element.js';

export class HTMLTabElement extends HTMLCustomElement {
	
	static $deselected = Symbol('HTMLTabElement.$deselected');
	static $selected = Symbol('HTMLTabElement.$selected');
	static icon = { doc: '🖊️' };
	static tagName = 'tab-node';
	
	static [HTMLCustomElement.$attribute] = {
		
		selected: {
			
			get: true,
			
			observed(name, last, current) {
				
				last === current ||
					(
						this[HTMLTabElement[`$${typeof current === 'string' ? '' : 'de'}selected`]]?.(),
						this.bubble('changed-selection', this)
					);
				
			},
			
			set: true
			
		}
		
	};
	
	static [HTMLCustomElement.$bind] = {
		
		interacted() {
			
			this.selected || this.select();
			
		},
		
		onCloseTab(event) {
			
			const { view } = this;
			
			view.deleteAll(), this.deleteAll(),
			
			event.stopPropagation(),
			
			this.bubble('tab-close', this, true);
			
		}
		
	};
	
	static [HTMLCustomElement.$init]() {
		
		const { interacted, onCloseTab } = this;
		
		this.addListener(this, 'click', interacted),
		this.addListener(this, 'closed-tab', onCloseTab);
		
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
	
	//set(target, icon, content, group, id) {
	//	
	//	const	{ icon: presetIcon } = HTMLTabElement,
	//			iconNode = icon instanceof Element ? icon : document.createElement('span'),
	//			tabButton = document.createElement('tab-button'),
	//			view = document.createElement('tab-view');
	//	let contentNode;
	//	
	//	this.tabFor = view.id = ''+(id ?? '') || 'tab-' + crypto.randomUUID(),
	//	this.group = group,
	//	
	//	iconNode.slot = 'icon',
	//	typeof icon === 'string' && (iconNode.textContent = presetIcon[Object.hasOwn(presetIcon, icon) ? icon : 'doc']),
	//	
	//	content instanceof Element ?
	//		(contentNode = content) : ((contentNode = document.createElement('span')).textContent = content),
	//	contentNode.slot = 'content',
	//	
	//	tabButton.append(iconNode, contentNode),
	//	this.replaceChildren(tabButton),
	//	
	//	view.appendChild(target);
	//	
	//	return view;
	//	
	//}
	
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
	
	static DEFAULT_ICON = 'doc';
	static icon = { doc: '🖊️' };
	static rxEmoji = /^(?:<a?:.+?:\d{18}>|\p{Extended_Pictographic})$/gu;
	static tagName = 'tab-button';
	
	static [HTMLCustomElement.$bind] = {
		
		changedParentSelection(event) {
			
			this.selected = this.parentElement.selected;
			
		},
		
		interactedCloseButton(event) {
			
			this.cancelableBubble('tab-close', this, true);
			
		}
		
	};
	
	static [HTMLCustomElement.$init]() {
		
		const { closeButton, interactedCloseButton } = this;
		
		this.addListener(closeButton, 'click', interactedCloseButton);
		
	}
	
	constructor() {
		
		super();
		
	}
	connectedCallback() {
		
		const { changedParentSelection, parentElement } = this;
		
		this.parentElement instanceof HTMLTabElement &&
			(
				this.selected = parentElement.selected,
				this.addListener(parentElement, 'changed-selection', changedParentSelection)
			);
		
	}
	disconnectedCallback() {
		
		const { changedParentSelection, parentElement } = this;
		
		this.selected = false,
		
		this.parentElement instanceof HTMLTabElement &&
			this.removeListener(parentElement, 'changed-selection', changedParentSelection);
		
	}
	
	impliment(group, viewTarget, content, icon, id) {
		
		const	{ DEFAULT_ICON, icon: presetIcon, rxEmoji } = HTMLTabButtonElement,
				iconNode = icon instanceof Element ? icon : document.createElement('span'),
				tab = document.createElement('tab-node'),
				view = document.createElement('tab-view');
		let contentNode;
		
		tab.tabFor = view.id = ''+(id ?? '') || 'tab-' + crypto.randomUUID(),
		tab.group = group,
		
		iconNode.slot = 'icon',
		icon instanceof Element ||
			(
				iconNode.textContent = rxEmoji.test(icon) ?
					icon : presetIcon[Object.hasOwn(presetIcon, icon) ? icon : DEFAULT_ICON]
			),
		
		content instanceof Element ?
			(contentNode = content) : ((contentNode = document.createElement('span')).textContent = content),
		contentNode.slot = 'content',
		
		this.append(iconNode, contentNode),
		
		tab.appendChild(this), view.append(viewTarget);
		
		return { tab, view };
		
	}
	
	get closeButton() {
		
		return this.shadowRoot?.getElementById('close');
		
	}
	get selected() {
		
		return this.hasAttribute('selected');
		
	}
	set selected(v) {
		
		this.toggleAttribute('selected', !!v);
		
	}
	
}
HTMLTabButtonElement.define();

export default class HTMLTabsManagerElement extends HTMLShadowListenerElement {
	
	static $selectionHistory = Symbol('HTMLTabsManagerElement.$selectionHistory');
	static tagName = 'tabs-man';
	
	static addTabs(prepends, tabsContainer, viewsContainer, tabOption, ...targets) {
		
		const	{ selectedIndex, tabs, views } = HTMLTabsManagerElement.implimentTabs(tabOption, ...targets),
				method = prepends ? 'prepend' : 'append';
		
		tabsContainer[method](...tabs), viewsContainer[method](...views),
		
		selectedIndex === false || tabs.at(selectedIndex ?? 0).select();;
		
	}
	
	static implimentTabs(option, ...targets) {
		
		typeof option === 'string' && (option = { group: option }),
		(option && (typeof option === 'object' || typeof option === 'function')) || (option = {});
		
		const length = typeof targets[0] === 'number' ? targets.splice(0,1)[0] : targets.length,
				tabs = [],
				views = [],
				isObjectOption = typeof option === 'object';
		let i, tabButton;
		
		if (isObjectOption) {
			
			var { group, icon, id, selectedIndex, tabContent } = option, target;
			
		}
		
		i = -1;
		while (++i < length) {
			
			tabButton = document.createElement('tab-button');
			
			if (isObjectOption) {
				
				target = targets[i];
				
			} else {
				
				var	{ group, icon, id, selectedIndex, tabContent, target = targets[i] } =
							option?.(targets[i], i, length, tabButton, ...arguments);
				
			}
			
			const	{ tab, view } = tabButton.impliment(group, target, tabContent, id, icon);
			
			tabs[i] = tab, views[i] = view;
			
		}
		
		return { selectedIndex, tabs, views };
		
	}
	
	static insertTabs(insertsBefore, referenceNode, tabOption, ...targets) {
		
		const	isTab = referenceNode instanceof HTMLTabElement,
				id = isTab ? referenceNode.tabFor : referenceNode instanceof HTMLTabViewElement && referenceNode.id;
		
		if (id) {
			
			const rootNode = referenceNode.getRootNode(),
					referencePeerNode = isTab ?	rootNode.getElementById(id) :
															rootNode.querySelector(`tab-node[for="${id}"]`),
					method = insertsBefore ? 'before' : 'after',
					{ tabs, views } = HTMLTabsManagerElement.implimentTabs(tabOption, ...targets);
			
			isTab ?	(referenceNode[method](...tabs), referencePeerNode[method](...views)) :
						(referencePeerNode[method](...tabs), referenceNode[method](...views)),
			
			tabOption?.selectedIndex === false || tabs.at(tabOption?.selectedIndex ?? 0).select();
			
		}
		
	}
	
	static [HTMLCustomElement.$bind] = {
		
		changedTabSelection(event) {
			
			const { detail: tab } = event;
			
			if (tab.selected) {
				
				const	history = this[HTMLTabsManagerElement.$selectionHistory][tab.group] ??= [];
				
				history[history.length] = tab;
				
			}
			
		},
		
		tabClosed(event) {
			
			const	{ detail: { group } } = event,
					history = this[HTMLTabsManagerElement.$selectionHistory][group] ??= [];
			let i, tab;
			
			i = history.length;
			while (--i > -1 && ((tab = history[i]).isConnected && tab.group === group) ? tab.select() : history.pop());
			
		}
		
	};
	
	constructor() {
		
		super();
		
		const { changedTabSelection, shadowRoot, tabClosed } = this;
		
		this[HTMLTabsManagerElement.$selectionHistory] = {},
		
		this.addListener(shadowRoot, 'changed-selection', changedTabSelection),
		this.addListener(this, 'closed-tab', tabClosed);
		
	}
	
	addTabs(prepends, tabsContainer, viewsContainer) {
		
		this.isOwnNodes(tabsContainer, viewsContainer) && HTMLTabsManagerElement.addTabs(...arguments);
		
	}
	
	appendTabs() {
		
		this.addTabs(undefined, ...arguments);
		
	}
	
	insertTabs(insertsBefore, referenceNode) {
		
		this.isOwnNodes(referenceNode) && HTMLTabsManagerElement.insertTabs(...arguments);
		
	}
	
	insertTabsAfter() {
		
		this.insertTabs(undefined, ...arguments);
		
	}
	
	insertTabsBefore() {
		
		this.insertTabs(true, ...arguments);
		
	}
	
	prependTabs() {
		
		this.addTabs(true, ...arguments);
		
	}
	
}

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