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
		this.addListener(this, 'tab-close', onCloseTab);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	select(state) {
		
		for (const tab of this.tabs) tab === this || (tab.selected = false);
		
		this.selected = true;
		
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

export class HTMLTabButtonElement extends HTMLShadowListenerElement {
	
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
		
	}
	
	static [HTMLShadowListenerElement.$slot] = {
		
		['.ctrl slot[name^="ctrl-"]'](event, target, isDischarged, changed) {
			
			this.addListener(target, 'click', this.interactedCloseButton);
			
		}
		
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
	
	static [HTMLCustomElement.$bind] = {
		
		changedTabSelection(event) {
			
			const { detail: tab } = event;
			
			if (tab.selected) {
				
				const	history = this[HTMLTabsManagerElement.$selectionHistory][tab.group] ??= [];
				
				history[history.length] = tab;
				
			}
			
		},
		
		onTabCreate(event, prepends) {
			
			const { tabListeners } = this, { length } = tabListeners;
			
			if (length) {
				
				const	{ isArray } = Array,
						{ asArray } = HTMLShadowListenerElement,
						{ generateTabTarget, shadowRoot } = this,
						{ detail, type } = event;
				let i, tabListener;
				
				i = -1;
				while (++i < length) {
					
					if ((tabListener = tabListeners[i]) && typeof tabListener === 'object') {
						
						const { target, types } = tabListener;
						
						if (asArray(types).indexOf(type) !== -1 && detail.matches(target)) {
							
							const	{ args, container: c = detail, option: rawOption, viewer: v } = tabListener,
									container = typeof c === 'string' ? shadowRoot.querySelector(c) : c,
									viewer = typeof v === 'string' ? shadowRoot.querySelector(v) : v,
									option =	HTMLTabsManagerElement.normalizeTabOption(rawOption, this);
							
							option.container = container,
							option.viewer = viewer,
							option.prepends = prepends,
							option.tabAttr ??= { slot: 'container' },
							option.selectedIndex ??= -!prepends,
							
							isArray(args) ?	this.addTabs(option, ...args) :
													args === undefined ?	this.addTabs(option) : this.addTabs(option, args);
							
							//container.tabs?.at?.(-prepends)?.select?.();
						}
						
					}
					
				}
			
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
	
	static [HTMLShadowListenerElement.$event] = [
		
		{
			handlers(event) {
				
				this.onTabCreate(event, event.type === 'tab-prepend');
				
			},
			id: 'HTMLTabManagerElement.default.tabAppend.tabPrepend',
			targets: true,
			types: [ 'tab-append', 'tab-prepend' ]
		}
		
	];
	
	static addTabs(option, ...targets) {
		
		typeof option === 'boolean' && (option = { prepends: option });
		
		const	implimented = HTMLTabsManagerElement.implimentTabs(option, ...targets),
				{ option: { container, prepends, viewer }, selectedIndex, tabs, views } = implimented,
				method = prepends ? 'prepend' : 'append';
		
		container?.[method]?.apply?.(container, tabs),
		viewer?.[method]?.apply?.(viewer, views),
		
		selectedIndex === false || tabs.at(selectedIndex ?? 0).select();
		
		return implimented;
		
	}
	
	static implimentTabs(option, ...targets) {
		
		var	{
					callback,
					callbackThis,
					ctrlPartsId = 'tab-button-ctrl-parts',
					group,
					icon,
					id,
					selectedIndex: defaultSelectedIndex,
					tabAttr,
					tabContent,
					viewAttr
				} = option = HTMLTabsManagerElement.normalizeTabOption(option),
				target;
		
		const length = typeof targets[0] === 'number' ? targets.splice(0,1)[0] : targets.length,
				tabs = [],
				views = [],
				ctrlParts = document.getElementById(ctrlPartsId)?.content,
				hasCallback = typeof callback === 'function';
		
		let i,k, tabButton, selectedIndex;
		
		i = -1;
		while (++i < length) {
			
			tabButton = document.createElement('tab-button'),
			
			ctrlParts && tabButton.append(ctrlParts.cloneNode(true));
			
			if (hasCallback) {
				
				var	{ group, icon, id, selectedIndex: currentSelectedIndex, tabContent, target = targets[i] } =
							callback.call(callbackThis, targets[i], i, length, tabButton, option, ...arguments);
				
			} else target = targets[i];
			
			const	{ tab, view } = tabButton.impliment(group, target, tabContent, id, icon, option);
			
			if (tabAttr && typeof tabAttr === 'object')
				for (k in tabAttr) tab.hasAttribute(k) || tab.setAttribute(k, tabAttr[k]);
			if (viewAttr && typeof viewAttr === 'object')
				for (k in viewAttr) view.hasAttribute(k) || view.setAttribute(k, viewAttr[k]);
			
			tabs[i] = tab, views[i] = view,
			typeof currentSelectedIndex === 'number' && (selectedIndex = currentSelectedIndex);
			
		}
		
		return { option, selectedIndex: selectedIndex ?? defaultSelectedIndex, tabs, views };
		
	}
	
	static insertTabs(option, ...targets) {
		
		typeof option === 'boolean' && (option = { insertsBefore: option }),
		option instanceof Element && (option = { referenceNode: option });
		
		const	{ referenceNode } = option ??= {},
				isTab = referenceNode instanceof HTMLTabElement,
				id = isTab ? referenceNode.tabFor : referenceNode instanceof HTMLTabViewElement && referenceNode.id;
		
		if (id) {
			
			const rootNode = referenceNode.getRootNode(),
					referencePeerNode = isTab ? rootNode.getElementById(id) : rootNode.querySelector(`tab-node[for="${id}"]`),
					{ option: { insertsBefore }, selectedIndex, tabs, views } =
						HTMLTabsManagerElement.implimentTabs(option, ...targets),
					method = insertsBefore ? 'before' : 'after';
			
			isTab ?	(referenceNode[method](...tabs), referencePeerNode[method](...views)) :
						(referencePeerNode[method](...tabs), referenceNode[method](...views)),
			
			selectedIndex === false || tabs.at(selectedIndex ?? 0).select();
			
		}
		
	}
	
	static normalizeTabOption(option, callbackThis = this) {
		
		switch (typeof option) {
			
			case 'function':
			option = { callback: option };
			break;
			
			case 'number':
			option = { selectedIndex: option };
			break;
			
			case 'object':
			option ||= {};
			break;
			
			case 'string':
			option = { group: option };
			break;
			
			default:
			option = {};
			break;
			
		}
		
		option.callbackThis ??= callbackThis;
		
		return option;
		
	}
	
	constructor() {
		
		super();
		
		const { changedTabSelection, shadowRoot, tabClosed } = this;
		
		this[HTMLTabsManagerElement.$selectionHistory] = {},
		
		this.addListener(shadowRoot, 'changed-selection', changedTabSelection),
		
		this.addListener(this, 'tab-close', tabClosed);
		
	}
	
	addTabs(option) {
		
		option instanceof Element && (option = { container: option, viewer: option });
		
		const { container, viewer } = option;
		
		this.isOwnNodes(container, viewer) &&
			(arguments[0] = option, HTMLTabsManagerElement.addTabs(...arguments));
		
	}
	
	//appendTabs(option) {
	//	
	//	option instanceof Element && (option = { viewer: option }),
	//	option && typeof option === 'object' ? (option.prepends = false) : (option = { prepends: false }),
	//	
	//	arguments[0] = option,
	//	
	//	this.addTabs(option, ...arguments);
	//	
	//}
	
	insertTabs(option) {
		
		option instanceof Element && (option = { referenceNode: option });
		
		this.isOwnNodes(option?.referenceNode) &&
			(arguments[0] = option, HTMLTabsManagerElement.insertTabs(...arguments));
		
	}
	
	//insertTabsAfter(option) {
	//	
	//	(option = HTMLTabsManagerElement.normalizeTabOption(option)) instanceof Element &&
	//		(option = { referenceNode: option }),
	//	option.insertsBefore = false,
	//	
	//	arguments[0] = option,
	//	
	//	this.insertTabs(...arguments);
	//	
	//}
	//
	//insertTabsBefore(option) {
	//	
	//	(option = HTMLTabsManagerElement.normalizeTabOption(option)) instanceof Element &&
	//		(option = { referenceNode: option }),
	//	option.insertsBefore = true,
	//	
	//	arguments[0] = option,
	//	
	//	this.insertTabs(...arguments);
	//	
	//}
	
	//prependTabs(option) {
	//	
	//	option instanceof Element && (option = { viewer: option }),
	//	option && typeof option === 'object' ? (option.prepends = true) : (option = { prepends: true }),
	//	
	//	arguments[0] = option,
	//	
	//	this.addTabs(...arguments);
	//	
	//}
	
	get tabListeners() {
		
		return HTMLShadowListenerElement.asArray(this.constructor[HTMLTabsManagerElement.$tab]);
		
	}
	
}

export class HTMLTabContainerElement extends HTMLShadowListenerElement {
	
	static SLOT_NAME = 'container';
	static moInit = { childList: true };
	static tagName = 'tab-container';
	static containerAssignedNodesOption = { flatten: true };
	
	static [HTMLCustomShadowElement.$bind] = {
		
		interactedAppendTab(event) {
			
			this.bubble('tab-append', this);
			
		},
		
		interactedPrependTab(event) {
			
			this.bubble('tab-prepend', this);
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$init]() {
		
		this.appendChild(document.getElementById('tab-container-parts').content.cloneNode(true));
		
	}
	
	static [HTMLShadowListenerElement.$slot] = {
		
		'[name="after"]': {
			
			['.append-tab'](event, slotted, slottedNodes) {
				
				this.addListener(slotted, 'click', this.interactedAppendTab);
				
			}
			
		},
		
		'[name="before"]': {
			
			['.prepend-tab'](event, slotted, slottedNodes) {
				
				this.addListener(slotted, 'click', this.interactedPrependTab);
				
			}
			
		}
		
	};
	
	static mutatedChildList(mrs) {
		
		const { SLOT_NAME } = HTMLTabContainerElement, { length } = mrs;
		let i,i0,l0, addedNodes;
		
		i = -1;
		while (++i < length) {
			
			if (l0 = (addedNodes = mrs[i].addedNodes).length) {
				
				i0 = -1;
				while (++i0 < l0) addedNodes[i0].slot ||= SLOT_NAME;
				
			}
			
		}
		
	}
	
	constructor() {
		
		super();
		
		const { mutatedChildList, moInit } = HTMLTabContainerElement;
		
		(this.mo = new MutationObserver(this.mutatedChildList = mutatedChildList.bind(this))).observe(this, moInit);
		
	}
	
	connectedCallback() {
		
		const { SLOT_NAME } = HTMLTabContainerElement, { children } = this, { length } = children;
		let i;
		
		i = -1;
		while (++i < length) children[i].slot ||= SLOT_NAME;
		
	}
	
	//appendTabs(viewsContainer, option) {
	//	
	//	if (this.getRootNode() === viewsContainer.getRootNode()) {
	//		
	//		const	{ tabs, views } = HTMLTabsManagerElement.addTabs(undefined, this, ...arguments),
	//				{ length } = tabs;
	//		let i;
	//		
	//		i = -1;
	//		while (++i < length) tabs[i].slot = 'container';
	//		
	//	}
	//	
	//}
	//
	//prependTabs(viewsContainer, option) {
	//	
	//	if (this.getRootNode() === viewsContainer.getRootNode()) {
	//		
	//		const	{ tabs, views } = HTMLTabsManagerElement.addTabs(true, this, ...arguments),
	//				{ length } = tabs;
	//		let i;
	//		
	//		i = -1;
	//		while (++i < length) tabs[i].slot = 'container';
	//		
	//	}
	//	
	//}
	//
	//removeTabs() {
	//}
	
	get after() {
		
		return this.shadowRoot?.getElementById?.('after-container');
		
	}
	get container() {
		
		return this.shadowRoot?.getElementById?.('container');
		
	}
	get containerSlot() {
		
		return this.container?.querySelector?.('slot[name="container"]');
		
	}
	get tabs() {
		
		return	this.containerSlot?.assignedNodes?.(HTMLTabContainerElement.containerAssignedNodesOption);
		
	}
	get before() {
		
		return this.shadowRoot?.getElementById?.('before-container');
		
	}
	
}
HTMLTabContainerElement.define();