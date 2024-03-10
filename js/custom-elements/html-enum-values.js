export class HTMLEnumValuesElement extends HTMLElement {
	
	static {
		
		this.tagName = 'enum-values',
		
		this.$of = Symbol('HTMLEnumValuesElement.of');
		
	}
	
	constructor() {
		
		super();
		
	}
	
	*[Symbol.iterator]() {
		
		const { children } = this, l = children.length;
		let i, child;
		
		i = -1;
		while (++i < l)	((child = children[i]) instanceof HTMLValueElement || child instanceof HTMLEnumValuesElement) &&
			 						(yield child);
		
	}
	
	of() {
		
		const { $of } = HTMLEnumValuesElement;
		
		if (typeof this[$of] === 'function') return this[$of](...arguments);
		
		const values = [];
		let i;
		
		i = -1;
		for (const v of this) values[v.key || ++i] = v.of();
		
		return values;
		
	}
	
	get key() { return this.getAttribute('key'); }
	set key(v) { this.setAttribute('key', v); }
	
}
customElements.define(HTMLEnumValuesElement.tagName, HTMLEnumValuesElement);

export class HTMLRegExpElement extends HTMLEnumValuesElement {
	
	static {
		
		this.tagName = 'reg-exp',
		
		this.$mutated = Symbol('HTMLRegExpElement.mutated'),
		this.$observedAttributes = Symbol('HTMLRegExpElement.observedAttributes'),
		this.$rx = Symbol('HTMLRegExpElement.rx'),
		
		this[this.$observedAttributes] = [ 'flags', 'pattern' ];
		
	}
	static get observedAttributes() {
		
		return this[this.$observedAttributes];
		
	}
	
	constructor() {
		
		super();
		
	}
	attributeChangedCallback(name, last, current) {
		
		last === current || (this[HTMLRegExpElement.$rx] = new RegExp(this.pattern, this.flags));
		
	}
	
	exec(str) {
		
		return this.rx?.exec?.(str);
		
	}
	
	execAll(str) {
		
		return (''+str)?.matchAll?.(this.rx);
		
	}
	
	// 戻り値が存在する場合、それは常に値を列挙する配列になる。
	// 配列の値は文字列に限らず、HTMLAttrValue を継承する任意の要素を使って、任意の値を設定することができる。
	[HTMLEnumValuesElement.$of](str = this.source) {
		
		if (str = ''+str) {
			
			const	{ isArray } = Array,
					isGlobal = this.flags.indexOf('g') !== -1,
					executed = this['exec' + (isGlobal ? 'All' : '')](str),
					matched = Array.isArray(executed) ? [ executed ] : executed,
					value = [];
			let i,l,i0,v, m,m0, index, lastIndex;
			
			i = -1, lastIndex = 0;
			for (m of matched)	(index = m.index) && (v = str.slice(lastIndex, index)) && (value[++i] = v),
										value[++i] = m,
										lastIndex = index + m.length;
			lastIndex === str.length || (value[++i] = str.slice(lastIndex));
			
			for (i0 of this) break;
			
			if (i0) {
				
				l = ++i, i = -1;
				while (++i < l) {
					
					if (isArray(m = value[i])) {
						
						m0 = m[0];
						for (v of this) {
							if (v.key === m0) {
								//m0 = (v = v.of())?.join?.('') ?? ''+v;
								m0 = v.of();
								break;
							}
						}
						
						value[i] = m0;
						
					}
					
				}
				
			}
			
			return i0 ? value : isGlobal ? matched : executed;
			
		}
		
		return null;
		
	}
	
	get rx() {
		
		return this[HTMLRegExpElement.$rx] ??= new RegExp(this.pattern, this.flags);
		
	}
	
	get flags() {
		
		return this.getAttribute('flags') ?? '';
		
	}
	set flags(v) {
		
		return this.setAttribute('flags', v);
		
	}
	get pattern() {
		
		return this.getAttribute('pattern');
		
	}
	set pattern(v) {
		
		this.setAttribute('pattern', v);
		
	}
	get source() {
		
		return document.querySelector(this.getAttribute('source'))?.textContent;
		
	}
	set source(v) {
		
		this.setAttribute('source', v);
		
	}
	
}
customElements.define(HTMLRegExpElement.tagName, HTMLRegExpElement);

export class HTMLValueElement extends HTMLElement {
	
	static {
		
		this.tagName = 'v-val',
		
		this.$of = Symbol('HTMLValueElement.of');
		
	}
	
	static is(target) {
		
		return target === HTMLValueElement || HTMLValueElement.isPrototypeOf(target) || target instanceof HTMLValueElement;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	of(str = this.textContent) {
		
		const of = HTMLValueElement.$of;
		
		return typeof this[of] === 'function' ? this[of](str) : (this[of] ?? str.trim());
		
	}
	
	valueOf() {
		
		const v = this.textContent, fixed = v.trim().toLowerCase();
		
		switch (this.type) {
			case 'bool': return fixed === 'true' ? true : fixed === 'false' || fixed === '0' ? false : !!fixed;
			case 'int': return Number.parseInt(fixed);
			case 'float': return Number.parseFloat(fixed);
			case 'dom':
			const df = new DocumentFragment();
			df.append(...this.cloneNode(true).children);
			return df;
			default: return v;
		}
		
	}
	
	get key() {
		
		return this.getAttribute('key');
		
	}
	set key(v) {
		
		this.setAttribute('key', v);
		
	}
	get trimmedText() {
		
		return this.textContent.trim();
		
	}
	set trimmedText(v) {
		
		this.textContent = v.trim();
		
	}
	
}
customElements.define(HTMLValueElement.tagName, HTMLValueElement);

export class HTMLValueBoolElement extends HTMLValueElement {
	
	static {
		
		this.tagName = 'v-bool';
		
	}
	
	static of(str) {
		
		return !(!str || str === 'false' || str === '0');
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLValueElement.$of](str = this.textContent) {
		
		return HTMLValueBoolElement.of(str.trim().toLowerCase());
		
	}
	
}
customElements.define(HTMLValueBoolElement.tagName, HTMLValueBoolElement);

export class HTMLValueIntElement extends HTMLValueElement {
	
	static {
		
		this.tagName = 'v-int';
		
	}
	
	static of(str, radix = 10) {
		
		return Number.parseInt(str, radix);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLValueElement.$of](str = this.textContent) {
		
		return HTMLValueIntElement.of(str, this.radix);
		
	}
	
	get radix() {
		
		return this.getAttribute('radix');
		
	}
	set radix(v) {
		
		this.setAttribute('radix', v);
		
	}
	
}
customElements.define(HTMLValueIntElement.tagName, HTMLValueIntElement);

export class HTMLValueFloatElement extends HTMLValueElement {
	
	static {
		
		this.tagName = 'v-float';
		
	}
	
	static of(str) {
		
		return Number.parseFloat(str);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLValueElement.$of](str = this.textContent) {
		
		return HTMLValueFloatElement.of(str);
		
	}
	
}
customElements.define(HTMLValueFloatElement.tagName, HTMLValueFloatElement);

export class HTMLValueNodesElement extends HTMLValueElement {
	
	static {
		
		this.tagName = 'v-nodes';
		
	}
	
	static of(element) {
		
		if (this.clones) {
			
			const df = new DocumentFragment();
			
			df.append(...element.cloneNode(true).children);
			
			return df;
			
		} else return element.children;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLValueElement.$of]() {
		
		return HTMLValueDocFragmentElement.of(this);
		
	}
	
	get clones() {
		
		return this.hasAttribute('clones');
		
	}
	set clones(v) {
		
		return this.getAttribute('clones', !!v);
		
	}
	
}
customElements.define(HTMLValueNodesElement.tagName, HTMLValueNodesElement);

export class HTMLValueJSONElement extends HTMLValueElement {
	
	static {
		
		this.tagName = 'v-json';
		
	}
	
	static of(str) {
		
		try {
			
			str = JSON.parse(str);
			
		} catch (error) {
			
			console.info(str, error);
			
			return null;
			
		}
		
		return str;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLValueElement.$of](str = this.textContent) {
		
		return HTMLValueJSONElement.of(str.trim());
		
	}
	
}
customElements.define(HTMLValueJSONElement.tagName, HTMLValueJSONElement);

export class HTMLValueDateElement extends HTMLValueElement {
	
	static {
		
		this.tagName = 'v-date';
		
	}
	
	static of(str) {
		
		return new Date(this.time ? HTMLValueIntElement.of(str) : str);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLValueElement.$of](str = this.textContent) {
		
		return HTMLValueDateElement.of(str.trim());
		
	}
	
	get time() {
		
		return this.hasAttribute('time');
		
	}
	set time(v) {
		
		return this.tpggleAttribute('time', !!v);
		
	}
	
}
customElements.define(HTMLValueDateElement.tagName, HTMLValueDateElement);