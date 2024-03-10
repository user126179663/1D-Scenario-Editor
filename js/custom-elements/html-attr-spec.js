import { HTMLAttributesLocker } from './html-root-element.js';

export class HTMLAttrSpec extends HTMLElement {
	
	static {
		
		this.tagName = 'attr-spec',
		
		this.$false = Symbol('HTMLAttrSpec.false'),
		this.$noSpec = Symbol('HTMLAttrSpec.noSpec');
		
	}
	
	static build(descriptor) {
		
		if (descriptor && typeof descriptor === 'object') {
			
			const spec = document.createElement(HTMLAttrSpec.tagName), { attr } = descriptor;
			let k,v;
			
			for (k in descriptor) ((v = descriptor[k]) && v === 'object') || (spec[k] = v);
			
			if (attr && typeof attr === 'object') {
				
				const { build } = HTMLAttrVal, nodes = [];
				let i,k, node;
				
				i = -1;
				for (k in attr) (node = build(k, attr[k])) && (nodes[++i] = node);
				
				i === -1 || spec.append(...nodes);
				
			}
			
			return spec;
			
		}
		
		return null;
		
	}
	
	static modifySpecDescriptor(descriptor, keyModifier, valueModifier = keyModifier) {
		
		const { modifySpecDescriptor } = HTMLAttrSpec;
		let v;
		
		if (Array.isArray(descriptor)) {
			
			const l = descriptor.length;
			let i;
			
			i = -1, v = '';
			while (++i < l) v += valueModifier?.(i, descriptor[i], descriptor);
			
			return v;
			
		} else if (descriptor && typeof descriptor === 'object') {
			
			let k,k0;
			
			descriptor = { ...descriptor };
			
			for (k in descriptor)	k0 = keyModifier?.(k, v = descriptor[k], descriptor) || k,
											k0 === k || (descriptor[k0] = v, delete descriptor[k]),
											(v = descriptor[k0]) && typeof v === 'object' &&
												(descriptor[k0] = modifySpecDescriptor(v, keyModifier, valueModifier));
			
			return descriptor;
			
		}
		
	}
	
	constructor() {
		
		super();
		
	}
	
	*[Symbol.iterator]() {
		
		const { children } = this, l = children.length;
		let i, child;
		
		i = -1;
		while (++i < l) (child = children[i]) instanceof HTMLAttrVal && (yield child);
		
	}
	
	getSpec(nameOrAttr) {
		
		const	specs =	this.querySelectorAll
								(`:scope > [name="${nameOrAttr instanceof Attr ? nameOrAttr.name : nameOrAttr}"]`),
				spec = specs?.[specs.length - 1];
		
		return spec instanceof HTMLAttrVal ? spec : null;
		
	}
	specify(element) {
		
		if (!this.disabled) {
			
			if (!(element instanceof Element)) throw new TypeError();
			
			const	{ $false } = HTMLAttrSpec,
					{ camelize } = HTMLAttributesLocker,
					{ asCamel, inherit } = this,
					{ attributes } = element;
			let k,k0,v, spec, attr, host;
			
			host =	element.closest(inherit) ||
							(host = element.getRootNode?.()?.host).tagName.toLowerCase() === inherit ? host : null;
			
			const hostAttrs = host?.attributes, specified = {};
			
			for (spec of this) {
				
				spec.disabled ||
					(
						(
							v =	(attr = attributes[k = spec.name]) instanceof Attr ?
										spec.specify(attr) :
										(k0 = spec.inheritProperty) ?
											k0 in host ?	host[k0] : spec.specify() :
																(k0 = spec.inherit) && host.hasAttribute(k0) ?
																	spec.specify(hostAttrs?.[spec.inherit]) : spec.specify()
						) === $false || ((k0 = spec.key) && (k = k0), specified[asCamel ? camelize(k, 1) : k] = v)
					);
				
			}
			
			return specified;
			
		}
		
	}
	specifyAttr(attr, as) {
		
		const spec = this.getSpec(as || attr);
		
		return spec ? spec.specify(attr) : attr?.value;
		
	}
	
	get asCamel() {
		
		return this.hasAttribute('camel-case');
		
	}
	set asCamel(v) {
		
		this.toggleAttribute('camel-case', !!v);
		
	}
	get disabled() {
		
		return this.hasAttribute('disabled');
		
	}
	set disabled(v) {
		
		return this.toggleAttribute('disabled', !!v);
		
	}
	get inherit() {
		
		return this.getAttribute('inherit');
		
	}
	set inherit(v) {
		
		return this.setAttribute('inherit', v);
		
	}
	
}
customElements.define(HTMLAttrSpec.tagName, HTMLAttrSpec);

export class HTMLAttrVal extends HTMLElement {
	
	static {
		
		this.tagName = 'attr-val',
		
		this.$specify = Symbol('HTMLAttrVal.specify'),
		this.$specifyValue = Symbol('HTMLAttrVal.specifyValue'),
		this.$toStr = Symbol('HTMLAttrVal.toStr'),
		
		this[this.$specify] = (value, defaultValue, raw) => value ?? (raw ? value : defaultValue);
		
	}
	
	static build(attrName, descriptor) {
		
		let node;
		
		if (
			attrName && typeof attrName === 'string' &&
			(node = document.createElement('attr-' + (descriptor?.type || 'val'))) instanceof HTMLAttrVal
		) {
			
			node.name = attrName;
			
			if (descriptor && typeof descriptor === 'object') {
				
				let k;
				for (k in descriptor) k === 'type' || (node[k === 'defaultValue' ? 'textContent' : k] = descriptor[k]);
				
			}
			
			return node;
			
		}
		
		return null;
		
	}
	
	static specify(value, name, attr, defaultValue, raw, asBooleanAttribute, scope, ...args) {
		
		const { $false } = HTMLAttrSpec, { $specify, $specifyValue } = HTMLAttrVal;
		
		// 以下の式は、asBooleanAttribute が true の時、value が null ないし undefined である場合、この関数は $false を返す。
		// そうでなければ指定された attr に基づいて scope のメソッド specifyValue、specify のいずれかを実行し、その戻り値を返す。
		// 以下の式の一行目の最後にある $false は式ではなく、上記の評価の結果返される戻り値である。
		return	asBooleanAttribute && (value === null || value === undefined) && $false ||
						(
							attr instanceof Attr ?
								(scope ?? this)?.[$specify]?.(value, name || attr.name, attr, defaultValue, raw, ...args) :
								typeof (scope = scope ?? this)?.[$specifyValue] === 'function' ?
									scope[$specifyValue](value, defaultValue, raw, ...args) :
									scope?.[$specify]?.(value, undefined, undefined, defaultValue, raw, ...args)
						);
		
	}
	
	static specifyValue(value, defaultValue, raw, asBooleanAttribute, scope, ...args) {
		
		return HTMLAttrVal.specify(value, undefined, undefined, defaultValue, raw, asBooleanAttribute, scope, ...args);
		
	}
	
	static toStr(value, defaultValue, raw, scope, ...args) {
		
		const toStr = (scope ?? this)?.[HTMLAttrVal.$toStr];
		
		return typeof toStr === 'function' ? toStr(value, defaultValue, raw, ...args) : raw ? value : ''+value;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	specify(attr, ...args) {
		
		if (!this.disabled) {
			
			const { specify } = HTMLAttrVal, { asBool, raw } = this;
			
			if (attr instanceof Attr) {
				
				const { name, value } = attr;
				
				return specify(value, name, attr, undefined, raw, asBool, this, ...args);
				
			} else return specify(attr, undefined, undefined, undefined, raw, asBool, this, ...args);
			
		}
		
	}
	
	toStr(value, defaultValue, ...args) {
		
		return HTMLAttrVal.toStr(value, defaultValue, this.raw, this, ...args);
		
	}
	
	get asBool() {
		
		return this.hasAttribute('bool');
		
	}
	set asBool(v) {
		
		return this.toggleAttribute('bool', !!v);
		
	}
	get disabled() {
		
		return this.hasAttribute('disabled');
		
	}
	set disabled(v) {
		
		return this.toggleAttribute('disabled', !!v);
		
	}
	// 値の変換後、それを値として持つプロパティの名前を設定する。未設定の場合は name の値が使われる。
	get key() {
		
		return this.getAttribute('key');
		
	}
	set key(v) {
		
		return this.setAttribute('key', v);
		
	}
	// 包含されている上位要素の属性名を示す。
	get inherit() {
		
		return this.getAttribute('inherit');
		
	}
	set inherit(v) {
		
		return this.setAttribute('inherit', v);
		
	}
	// 包含されている上位要素のプロパティ名を示す。inheritProperty は inherit に優先されかつ排他関係にある。
	get inheritProperty() {
		
		return this.getAttribute('inherit-property');
		
	}
	set inheritProperty(v) {
		
		return this.setAttribute('inherit-property', v);
		
	}
	// 自身に存在する対象の属性名を示す。
	get name() {
		
		return this.getAttribute('name');
		
	}
	set name(v) {
		
		return this.setAttribute('name', v);
		
	}
	get raw() {
		
		return this.hasAttribute('raw');
		
	}
	set raw(v) {
		
		return this.toggleAttribute('raw', !!v);
		
	}
	get trimmedText() {
		
		return this.textContent.trim();
		
	}
	set trimmedText(v) {
		
		this.textContent = v.trim();
		
	}
	
}
HTMLAttrVal.prototype[HTMLAttrVal.$specify] = function (str, name, attr, defaultValue, raw) {
	
	return str;
	
};
customElements.define(HTMLAttrVal.tagName, HTMLAttrVal);

export class HTMLAttrArray extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-array',
		
		this.delimiter = ' ';
		
	}
	
	static [HTMLAttrVal.$specify](str, defaultValue, raw, delimiter = HTMLAttrArray.delimiter) {
		
		return (str = ''+str)?.split?.(delimiter) ?? [];
		
	}
	
	static [HTMLAttrVal.$toStr](value, defaultValue, raw, delimiter = HTMLAttrArray.delimiter) {
		
		return (value = (''+value))?.join?.(delimiter) ?? value;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](str, name, attr, defaultValue, raw, delimiter = this.delimiter) {
		
		return HTMLAttrArray[HTMLAttrVal.$specify](str, defaultValue, raw, delimiter);
		
	}
	
	[HTMLAttrVal.$toStr](value, defaultValue, raw, delimiter = this.delimiter) {
		
		return HTMLAttrArray[HTMLAttrVal.$toStr](value, defaultValue, raw, delimiter);
		
	}
	
	get delimiter() {
		
		return this.getAttribute('delimiter') ?? HTMLAttrArray.delimiter;
		
	}
	set delimiter(v) {
		
		return this.setAttribute('delimiter');
		
	}
	
}
customElements.define(HTMLAttrArray.tagName, HTMLAttrArray);

export class HTMLAttrBigInt extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-bigint';
		
	}
	
	static [HTMLAttrVal.$specify](value, defaultValue, raw) {
		
		try {
			
			value = BigInt(value);
			
		} catch (error) {
			
			console.info(error),
			raw || (value = HTMLAttrBigInt[HTMLAttrVal.$specify](defaultValue, 0, raw));
			
		};
		
		return value;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](value, name, attr, defaultValue = this.trimmedText, raw = this.raw) {
		
		return HTMLAttrBigInt[HTMLAttrVal.$specify](value, defaultValue, raw);
		
	}
	
}
customElements.define(HTMLAttrBigInt.tagName, HTMLAttrBigInt);

export class HTMLAttrBool extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-bool';
		
	}
	
	static [HTMLAttrVal.$specify](value) {
		
		return !!value;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](value) {
		
		return HTMLAttrBool[HTMLAttrVal.$specify](value);
		
	}
	
}
customElements.define(HTMLAttrBool.tagName, HTMLAttrBool);

export class HTMLAttrBStr extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-bstr';
		
	}
	
	static [HTMLAttrVal.$specify](value, defaultValue = '') {
		
		return value !== undefined && value !== null && (HTMLAttrStr[HTMLAttrVal.$specify](...arguments) || defaultValue);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](value, name, attr, defaultValue = this.trimmedText) {
		
		return HTMLAttrBStr[HTMLAttrVal.$specify](value, defaultValue);
		
	}
	
}
customElements.define(HTMLAttrBStr.tagName, HTMLAttrBStr);

export class HTMLAttrFunc extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-func';
		
	}
	
	static [HTMLAttrVal.$specify](value, defaultValue, raw, ...args) {
		
		return new Function(...args, ''+value);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](value, name, attr, defaultValue, raw, ...args) {
		
		return HTMLAttrFunc[HTMLAttrVal.$specify](value, defaultValue, raw, ...args);
		
	}
	
}
customElements.define(HTMLAttrFunc.tagName, HTMLAttrFunc);

export class HTMLAttrJSON extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-json',
		
		this.defaultValue = 'null',
		this.strDefaultValue = null;
		
	}
	
	static [HTMLAttrVal.$specify](value, defaultValue = HTMLAttrJSON.defaultValue, raw) {
		
		try {
			
			value = JSON.parse(value);
			
		} catch (error) {
			
			console.info(value, error),
			raw || (value = HTMLAttrJSON[HTMLAttrVal.$specify](defaultValue, HTMLAttrJSON.defaultValue, raw));
			
		}
		
		return value;
		
	}
	
	static [HTMLAttrVal.$toStr](value, defaultValue = HTMLAttrJSON.strDefaultValue, raw) {
		
		
		try {
			
			value = JSON.stringify(value);
			
		} catch (error) {
			
			console.info(value, error),
			raw || (value = HTMLAttrJSON[HTMLAttrVal.$toStr](defaultValue, HTMLAttrJSON.strDefaultValue, raw));
			
		};
		
		return value;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](value, name, attr, defaultValue = this.trimmedText, raw = this.raw) {
		
		return HTMLAttrJSON[HTMLAttrVal.$specify](value, defaultValue, raw);
		
	}
	
	[HTMLAttrVal.$toStr](value, defaultValue = this.trimmedText, raw = this.raw) {
		
		return HTMLAttrJSON[HTMLAttrVal.$toStr](value, defaultValue, raw);
		
	}
	
}
customElements.define(HTMLAttrJSON.tagName, HTMLAttrJSON);

export class HTMLAttrNum extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-num',
		
		this.$failed = Symbol('HTMLAttrNum.failed'),
		this.$raw = Symbol('HTMLAttrNum.raw'),
		
		this.defaultValue = null,
		this.isInt = false,
		this.max = Infinity,
		this.min = -Infinity;
		
	}
	
	static [HTMLAttrVal.$specify](
		value,
		defaultValue = HTMLAttrNum.defaultValue,
		raw,
		min = HTMLAttrNum.min,
		max = HTMLAttrNum.max,
		isInt = HTMLAttrNum.isInt
	) {
		
		const	{ $failed, $raw, toNumber } = HTMLAttrNum;
		let v;
		
		if ((v = toNumber(value, raw ? $raw : toNumber(defaultValue, $failed))) === $failed) {
			
			return HTMLAttrNum.defaultValue;
		
		} else if (v === $raw) {
			
			return value;
			
		}
		
		typeof max === 'number' && v > max && (v = max),
		typeof min === 'number' && v < min && (v = min);
		
		return isInt ? parseInt(v) : v;
		
	}
	
	static toNumber(value, defaultValue = HTMLAttrNum.defaultValue) {
		
		return value === '' || value === null || value === undefined || Number.isNaN(value = +value) ? defaultValue : value;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](
		value,
		name,
		attr,
		defaultValue = this.trimmedText,
		raw = this.raw,
		min = this.min,
		max = this.max,
		int = this.int
	) {
		
		return HTMLAttrNum[HTMLAttrVal.$specify](value, defaultValue, raw, min, max, int);
		
	}
	
	get int() {
		
		return this.hasAttribute('int');
		
	}
	set int(v) {
		
		return this.toggleAttribute('int', !!v);
		
	}
	get max() {
		
		return HTMLAttrNum.toNumber(this.getAttribute('max') ?? HTMLAttrNum.max, HTMLAttrNum.max);
		
	}
	set max(v) {
		
		return this.setAttribute('max', v);
		
	}
	get min() {
		
		return HTMLAttrNum.toNumber(this.getAttribute('min') ?? HTMLAttrNum.min, HTMLAttrNum.min);
		
	}
	set min(v) {
		
		return this.setAttribute('min', v);
		
	}
	
}
customElements.define(HTMLAttrNum.tagName, HTMLAttrNum);

export class HTMLAttrStr extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-str';
		
	}
	
	static [HTMLAttrVal.$specify](value, defaultValue) {
		
		return '' + (value ?? defaultValue);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](value) {
		
		return HTMLAttrStr[HTMLAttrVal.$specify](value);
		
	}
	
}
customElements.define(HTMLAttrStr.tagName, HTMLAttrStr);

export class HTMLAttrSymbol extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-symbol',
		
		this.strDefaultValue = '';
		
	}
	
	static [HTMLAttrVal.$specify](value) {
		
		return Symbol(''+value);
		
	}
	
	static [HTMLAttrVal.$toStr](value, defaultValue = HTMLAttrSymbol.strDefaultValue, raw) {
		
		return typeof value === 'symbol' ? value.description : raw ? ''+value : defaultValue;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](value) {
		
		return HTMLAttrSymbol[HTMLAttrVal.$specify](value);
		
	}
	
	[HTMLAttrVal.$toStr](value, defaultValue = HTMLAttrSymbol.strDefaultValue, raw = this.raw) {
		
		return HTMLAttrSymbol[HTMLAttrVal.$toStr](value, defaultValue, raw);
		
	}
	
}
customElements.define(HTMLAttrSymbol.tagName, HTMLAttrSymbol);

export class HTMLAttrUndefined extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-undefined';
		
	}
	
	static [HTMLAttrVal.$specify]() {
		
		return undefined;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify]() {
		
		return HTMLAttrUndefined[HTMLAttrVal.$specify]();
		
	}
	
}
customElements.define(HTMLAttrUndefined.tagName, HTMLAttrUndefined);

export class HTMLAttrElement extends HTMLAttrVal {
	
	static {
		
		this.tagName = 'attr-element';
		
	}
	
	static [HTMLAttrVal.$specify](value, defaultValue, raw, clones) {
		
		if (clones) {
			
			const df = new DocumentFragment();
			
			df.append(...this.cloneNode(true).children);
			
			return df;
			
		} else return this.children;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLAttrVal.$specify](value, name, attr, defaultValue, raw) {
		
		return this.constructor[HTMLAttrVal.$specify](value, defaultValue, raw, this.clones);
		
	}
	
	get clones() {
		
		return this.hasAttribute('clone');
		
	}
	set clones(v) {
		
		return this.toggleAttribute('clone', !!v);
		
	}
	
}

export class HTMLAttrSelector extends HTMLAttrElement {
	
	static {
		
		this.tagName = 'attr-selector';
		
	}
	
	static [HTMLAttrVal.$specify](value, defaultValue, raw, clones) {
		
		let v;
		
		try {
			
			v = document.querySelectorAll(value);
			
		} catch(error) {
			
			v = defaultValue, console.info(error);
			
		}
		
		const l = v?.length;
		
		if (l) {
			
			const df = new DocumentFragment(), l = v.length;
			let i;
			
			i = -1;
			while (++i < l) df.appendChild(clones ? v[i].cloneNode(true) : v[i]);
			
			return df;
			
		}
		
		return null;
		
	}
	
	constructor() {
		
		super();
		
	}
	
}
customElements.define(HTMLAttrSelector.tagName, HTMLAttrSelector);

export class HTMLAttrElementId extends HTMLAttrElement {
	
	static {
		
		this.tagName = 'attr-eid';
		
	}
	
	static [HTMLAttrVal.$specify](value, defaultValue, raw, clones) {
		
		const v = document.getElementById(value);
		
		return this.clones ? v.cloneNode(true) : v;
		
	}
	
	constructor() {
		
		super();
		
	}
	
}
customElements.define(HTMLAttrElementId.tagName, HTMLAttrElementId);