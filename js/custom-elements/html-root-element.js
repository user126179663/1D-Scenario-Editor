import { HTMLAttrSpec, HTMLAttrVal, HTMLAttrArray, HTMLAttrBigInt, HTMLAttrBool, HTMLAttrBStr, HTMLAttrFunc, HTMLAttrJSON, HTMLAttrNum, HTMLAttrStr, HTMLAttrSymbol, HTMLAttrUndefined, HTMLAttrElement, HTMLAttrSelector, HTMLAttrElementId } from './html-attr-spec.js';

export class HTMLAttributesLocker extends HTMLElement {
	
	static {
		
		this.tagName = 'attributes-locker',
		
		this.$attribute = Symbol('HTMLAttributesLocker.attribute'),
		
		this.READABLE = 1,
		this.WRITABLE = 2,
		this.LOCKED = 4,
		
		this.UNLOCKED = this.READABLE + this.WRITABLE,
		
		this[this.$attribute] = Object.create(null);
		
	}
	
	static camelize(str, index = 0, delimiter = '-') {
		
		const splitted = (''+str).split(''+delimiter), l = splitted.length;
		let i, k, camel;
		
		camel = splitted?.[i = +index - 1] ?? '';
		while (++i < l) camel += (k = splitted[i])[0].toUpperCase() + k.slice(1);
		
		return camel;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	getFlags(name) {
		
		const { $attribute, UNLOCKED } = HTMLAttributesLocker;
		
		return this.constructor?.[$attribute]?.[name] ?? UNLOCKED;
		
	}
	getLockedAttribute(name, defaultValue, specificationOrAsBooleanAttribute = HTMLAttrStr, ...args) {
		
		const isSpec =	specificationOrAsBooleanAttribute === HTMLAttrVal ||
								HTMLAttrVal.isPrototypeOf(specificationOrAsBooleanAttribute);
		
		return	this.isReadableAttribute(name) ?
						//document.createElement('attr-' + type)?.specify?.(this.attributes[name])
						// 以下で specificationOrAsBooleanAttribute に指定されていることが期待される、
						// HTMLAttrVal か、それをを継承したオブジェクトの、シンボル $specify を名前に持つ静的メソッドを実行しているが、
						// このメソッドは、本来は HTMLAttrVal.specify() を通じて実行することを想定しているため、
						// 所定の引数を与えて直接呼び出すこの処理が妥当かどうかは不明なところがある。
						isSpec ?	specificationOrAsBooleanAttribute?.[HTMLAttrVal.$specify]?.
										(this.getAttribute(name), defaultValue, false, ...args) :
									this.hasAttribute(name) :
						isSpec ? defaultValue : !!defaultValue;
		
	}
	setLockedAttribute(name, value, specificationOrAsBooleanAttribute = HTMLAttrVal, defaultValue = '', ...args) {
		
		const writes = this.isWritableAttribute(name);
		
		writes &&	(
							specificationOrAsBooleanAttribute === HTMLAttrVal ||
								HTMLAttrVal.isPrototypeOf(specificationOrAsBooleanAttribute) ?
								this.setAttribute(name, specificationOrAsBooleanAttribute.toStr(value, defaultValue, ...args)) :
								this.toggleAttribute(name, !!value)
						);
		
		return writes;
		
	}
	
	isFlaggedAttribute(name, flags) {
		
		const v = this.getFlags(name);
		
		return typeof v === 'number' && v & flags;
		
	}
	isLockedAttribute(name) {
		
		return !!this.isFlaggedAttribute(name, HTMLAttributesLocker.LOCKED);
		
	}
	isReadableAttribute(name) {
		
		return !!this.isFlaggedAttribute(name, HTMLAttributesLocker.READABLE);
		
	}
	isUnlockedAttribute(name) {
		
		return !!this.isFlaggedAttribute(name, HTMLAttributesLocker.UNLOCKED);
		
	}
	isWritableAttribute(name) {
		
		return !!this.isFlaggedAttribute(name, HTMLAttributesLocker.WRITABLE);
		
	}
	
}
customElements.define(HTMLAttributesLocker.tagName, HTMLAttributesLocker);

export class HTMLMutationEmitter extends HTMLAttributesLocker {
	
	static {
		
		this.tagName = 'mutation-emitter',
		
		this.$defaultInit = Symbol('HTMLMutationEmitter.defaultInit'),
		this.$init = Symbol('HTMLMutationEmitter.init'),
		this.$mutated = Symbol('HTMLMutationEmitter.mutated'),
		this.$observer = Symbol('HTMLMutationEmitter.observer'),
		
		this[this.$mutated] = HTMLMutationEmitter.mutated,
		
		this.initAttributeName = {
			attributeFilter: 'observed-attribute-filter',
			attributes: 'observes-attributes',
			attributeOldValue: 'records-attribute-old-value',
			characterData: 'observes-character-data',
			characterDataOldValue: 'records-character-data-old-value',
			childList: 'observes-child-list',
			subtree: 'observes-subtree'
		},
		this.observedAttributesValue = Object.values(this.initAttributeName),
		
		this[HTMLAttributesLocker.$attributes] = {
			'observed-attribute-filter': HTMLAttributesLocker.LOCKED,
			'observes-attributes': HTMLAttributesLocker.LOCKED,
			'records-attribute-old-value': HTMLAttributesLocker.LOCKED,
			'observes-character-data': HTMLAttributesLocker.LOCKED,
			'records-character-data-old-value': HTMLAttributesLocker.LOCKED,
			'observes-child-list': HTMLAttributesLocker.LOCKED,
			'observes-subtree': HTMLAttributesLocker.LOCKED
		};
		
	}
	
	static get observedAttributes() {
		
		return this.observedAttributesValue;
		
	}
	
	static getAttrNameByInitKey(key) {
		
		return HTMLMutationEmitter.initAttributeName[key] ?? null;
		
	}
	static getInitKeyByAttrName(name) {
		
		const { initAttributeName } = HTMLMutationEmitter;
		let k;
		
		for (k in initAttributeName) if (initAttributeName[k] === name) return k;
		
		return null;
		
	}
	
	static mutated(mrs) {
		
		const l = mrs.length;
		let i,i0,ia,la,ir,lr, k,v, mr, target, attribute, characterData, childList, addedNodes, removedNodes, node;
		
		i = ia = ir = -1;
		while (++i < l) {
			
			switch ((mr = mrs[i]).type) {
				
				case 'attributes':
				(v = (attribute ??= new Map()).get(target = mr.target) ?? (attribute.set(target, v = {}), v))
					[k = mr.attributeName] = { current: target.getAttribute(k), last: mr.oldValue, mutationRecord: mr };
				break;
				
				case 'characterData':
				characterData = mr;
				break;
				
				case 'childList':
				
				if (la = (v = mr.addedNodes)?.length) {
					i0 = -1, addedNodes ??= [];
					while (++i0 < la) addedNodes.indexOf(node = v[i0]) === -1 && (addedNodes[++ia] = node);
				}
				
				if (lr = (v = mr.removedNodes)?.length) {
					i0 = -1, removedNodes ??= [];
					while (++i0 < lr) removedNodes.indexOf(node = v[i0]) === -1 && (removedNodes[++ir] = node);
				}
				
				(la || lr) && ((childList ??= [])[childList.length] = mr);
				
				break;
				
			}
			
		}
		
		//console.info({ attribute, characterData, childList, addedNodes, removedNodes, mutationRecords: mrs });
		
		this.dispatchEvent
			(
				new CustomEvent(
					'mutated',
					{ detail: { attribute, characterData, childList, addedNodes, removedNodes, mutationRecords: mrs } }
				)
			);
		
	}
	
	constructor() {
		
		super();
		
		const	{ $observer, $init, $defaultInit, $mutated } = HTMLRootElement,
				mutated = this.constructor[$mutated],
				callback = typeof mutated === 'function' && mutated,
				defaultInit = this.constructor[$defaultInit];
		
		typeof callback === 'function' && this.updateMutationEmitter(callback.bind(this)),
		
		defaultInit && typeof defaultInit === 'object' && this.observeMutation(defaultInit, true);
		
	}
	attributeChangedCallback(name, last, current) {
		
		const { observedAttributesValue } = HTMLMutationEmitter;
		
		if (observedAttributesValue.indexOf(name) !== -1) {
			
			const init = this.getObserverInit();
			
			if (init && typeof init === 'object') {
				
				let k,v;
				
				(current !== (v = this[k = HTMLAttributesLocker.camelize(name, 1)])) &&
					(this[k] = current, this.observeMutation());
				
			}
			
		}
		
	}
	disconnectMutationEmitter() {
		
		const { $observer } = HTMLMutationEmitter, observer = this[$observer];
		
		observer instanceof MutationObserver && observer.disconnect();
		
	}
	getObserverInit() {
		
		const init = this[HTMLMutationEmitter.$init];
		
		return init && typeof init === 'object' ? init : undefined;
		
	}
	getObserverInitValue(key, specificationOrAsBooleanAttribute) {
		
		const	init = this.getObserverInit();
		let v;
		
		if (init) {
			
			const attrName = HTMLMutationEmitter.getAttrNameByInitKey(key);
			
			attrName &&	(v = this.getLockedAttribute(attrName, v = init[key], specificationOrAsBooleanAttribute));
			
		}
		
		return v;
		
	}
	observeMutation(init = this[HTMLMutationEmitter.$init], replaces) {
		
		const { $observer } = HTMLMutationEmitter, observer = this[$observer];
		
		if (observer instanceof MutationObserver && init && typeof init === 'object') {
			
			const	{ isArray } = Array, { $observer, $init } = HTMLRootElement,
					currentInit = replaces ? (this[$init] = {}) : this[$init];
			
			if (init !== currentInit) {
				
				let k, v;
				
				for (k in init)
					(v = init[k]) === null ? delete currentInit[k] : (currentInit[k] = isArray(v) ? [ ...v ] : v);
				
			}
			
			observer.observe(this, currentInit);
			
			return true;
			
		}
		
		return false;
		
	}
	updateMutationEmitter(callback) {
		
		const	{ $mutated, $observer, mutated } = HTMLMutationEmitter;
		
		callback = typeof mutated === 'function' && mutated.bind(this);
		
		if (callback) {
			
			this.disconnectMutationEmitter(),
			
			this[$observer] = new MutationObserver(this[$mutated] = callback);
			
		}
		
	}
	setObserverInitValue(key, value, reflects = true, specificationOrAsBooleanAttribute, ...args) {
		
		const { $init, getAttrNameByInitKey } = HTMLMutationEmitter, attrName = getAttrNameByInitKey(key);
		
		attrName &&
			this.setLockedAttribute
				(
					attrName,
					value = typeof value === 'string' || value,
					specificationOrAsBooleanAttribute,
					undefined,
					...args
				) &&
					reflects &&
						(this[$init][key] = Array.isArray(value) ? [ ...value ] : !!value, this.observeMutation());
		
	}
	
	get observedAttributeFilter() {
		
		return this.getObserverInitValue('attributeFilter', HTMLAttrArray);
		
	}
	set observedAttributeFilter(v) {
		
		this.setObserverInitValue('attributeFilter', v, undefined, HTMLAttrArray);
		
	}
	get observesAttributes() {
		
		return this.getObserverInitValue('attributes', true);
		
	}
	set observesAttributes(v) {
		
		this.setObserverInitValue('attributes', v, undefined, true);
		
	}
	get observesCharacterData() {
		
		return this.getObserverInitValue('characterData', true);
		
	}
	set observesCharacterData(v) {
		
		this.setObserverInitValue('characterData', v, undefined, true);
		
	}
	get observesChildList() {
		
		return this.getObserverInitValue('childList', true);
		
	}
	set observesChildList(v) {
		
		this.setObserverInitValue('childList', v, undefined, true);
		
	}
	get observesSubtree() {
		
		return this.getObserverInitValue('subtree', true);
		
	}
	set observesSubtree(v) {
		
		this.setObserverInitValue('subtree', v, undefined, true);
		
	}
	get recordsAttributeOldValue() {
		
		return this.getObserverInitValue('attributeOldValue', true);
		
	}
	set recordsAttributeOldValue(v) {
		
		this.setObserverInitValue('attributeOldValue', v, undefined, true);
		
	}
	get recordsCharacterDataOldValue() {
		
		return this.getObserverInitValue('characterDataOldValue', true);
		
	}
	set recordsCharacterDataOldValue(v) {
		
		this.setObserverInitValue('characterDataOldValue', v, undefined, true);
		
	}
	
}
customElements.define(HTMLMutationEmitter.tagName, HTMLMutationEmitter);

export class HTMLRootElement extends HTMLMutationEmitter {
	
	static {
		
		this.tagName = 'root-element',
		
		this.$allowSelector = Symbol('HTMLRootElement.allowSelector'),
		this.$blockSelector = Symbol('HTMLRootElement.blockSelector'),
		this.$iterates = Symbol('HTMLRootElement.iterates'),
		this.$iterator = Symbol('HTMLRootElement.iterator'),
		// [$iterates]() の戻り値がこのシンボルである時、通常は [$iterates]() のあとに行なわれる
		// Element.prototype.matches() によるフィルタリング処理がスキップされ、
		// 戻り値の要素は常に [@@Symbol.iterator] の戻り値に含まれる。
		this.$permitted = Symbol('HTMLRootElement.permitted'),
		// 通常は、allowSelector は blockSelector に優先される。
		// precedesBlock を true に設定すると、この動作を反転させ、
		// 先に blockSelector の一致を確認し、それが ture の場合、その要素を処理の対象外にする。
		this.$precedesBlock = Symbol('HTMLRootElement.precedesBlock'),
		this.$presetSpec = Symbol('HTMLRootElement.presetSpec'),
		this.$presetSpecDescriptor = Symbol('HTMLRootElement.presetSpecDescriptor'),
		//this.$raw = Symbol('HTMLRootElement.raw'),
		
		this[this.$iterator] = '*',
		
		Object.defineProperty
			(
				this,
				'presetSpec',
				{
					get() {
						
						const v = this[HTMLRootElement.$presetSpec];
						
						return v instanceof HTMLAttrSpec ? v : null;
						
					},
					set(v) {
						
						const desc = this[HTMLRootElement.$presetSpecDescriptor];
						
						if (v !== desc && v && typeof v === 'object') {
							
							this[HTMLRootElement.$presetSpec] =
								HTMLAttrSpec.build(this[HTMLRootElement.$presetSpecDescriptor] = v);
							
						}
						
					}
				}
			);
		
		//this[this.$mutationEmitterDefaultInit] = { subtree: true };
		
		//this[AttributeLocker.$attribute] = {
		//	allowSelector: AttributeLocker.LOCKED,
		//	blockSelector: AttributeLocker.LOCKED
		//};;
		
	}
	
	static matches(element, selector, that) {
		
		return element instanceof Element &&
			(typeof selector === 'function' ? !!selector(element).call(that) : element.matches(selector));
		
	}
	
	constructor() {
		
		super();
		
	}
	
	*[Symbol.iterator]() {
		
		const	{ constructor } = this,
				{ $iterates, $iterator } = HTMLRootElement,
				iterator = constructor[$iterator],
				iterated = typeof iterator === 'function' ? iterator.call(this) :
					[
							...(this.shadowRoot?.querySelectorAll?.(iterator) ?? []),
							...this.querySelectorAll(iterator)
					],
				//iterated = typeof iterator === 'function' ? iterator.call(this) : this.querySelectorAll(iterator),
				l = iterated?.length;
		
		if (l) {
			
			const { $permitted, precedesBlock } = this;
			let i,v, element;
			
			i = -1;
			while (++i < l)	element = iterated[i],
									(v = this[$iterates]?.(element, iterated)) &&
										(
											v === $permitted ||
											(
												precedesBlock ?
													(!this.matchesByBlockSelector(element) && this.matchesByAllowSelector(element)) :
													(this.matchesByAllowSelector(element) || !this.matchesByBlockSelector(element))
											)
										)  && (yield element);
			
		}
		
	}
	
	specify(element) {
		
		return this.spec?.specify?.(element);
		
	}
	
	matchesAll(element, selector) {
		
		return this.contains(element) && (selector && HTMLRootElement.matches(element, selector, this));
		
	}
	
	matchesByAllowSelector(element) {
		
		const { $allowSelector } = HTMLRootElement;
		
		return this.matchesAll(element, this.allowSelector);
		
	}
	
	matchesByBlockSelector(element) {
		
		return this.matchesAll(element, this.blockSelector);
		
	}
	
	get allowSelector() {
		
		return this.getLockedAttribute('allow-selector', this.constructor[HTMLRootElement.$allowSelector]);
		
	}
	set allowSelector(v) {
		
		return this.setLockedAttribute('allow-selector', v);
		
	}
	get spec() {
		
		let spec;
		
		return	(
						(spec = document.getElementById(this.getAttribute('spec'))) instanceof HTMLAttrSpec &&
						!spec.disabled &&
						spec
					) ||	(
								(spec = this.constructor[HTMLRootElement.$presetSpec]) instanceof HTMLAttrSpec &&
								!spec.disabled &&
								spec
							) || null;
		
	}
	set spec(v) {
		
		this.setAttribute('spec', v);
		
	}
	get blockSelector() {
		
		return this.getLockedAttribute('block-selector', this.constructor[HTMLRootElement.$blockSelector]);
		
	}
	set blockSelector(v) {
		
		return this.setLockedAttribute('block-selector', v);
		
	}
	get precedesBlock() {
		
		return this.getLockedAttribute('precedes-block', this.constructor[HTMLRootElement.$precedesBlock], true);
		
	}
	set precedesBlock(v) {
		
		return this.setLockedAttribute('precedes-block', v, true);
		
	}
	
}
customElements.define(HTMLRootElement.tagName, HTMLRootElement);