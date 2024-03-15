/*
	（不十分）HTMLCustomElement を継承する際に必要な実装:
		オブジェクト（以下 HTMLMyElement）を定義後、そのオブジェクトで HTMLMyElement.define() を実行する。
		
		コンストラクターとは別にプロパティ名 HTMLCustomElement.$init で初期化関数を設定することができる。
		この初期化関数は、HTMLCustomElement 上ではコンストラクターとこれと言った差はなく、
		プロトタイプチェーン上の同関数を HTMLCustomElement から子孫方向へ実行する。
		また、同初期化関数は静的メソッドとして設定する必要がある。
		HTMLCustomElement を継承する HTMLCustomShadowElement も同一の初期化関数を仕様として持っているが、
		こちらは属性 template の変更時に常に実行される分、HTMLCustomElement の初期化関数より実用を想定している。
*/

export class HTMLCustomElement extends HTMLElement {
	
	static EMIT_OPTIONS_BUBBLES = 1;
	static EMIT_OPTIONS_CANCELABLE = 2;
	static EMIT_OPTIONS_COMPOSED = 4;
	
	static tagName = 'custom-element';
	
	static $abortAll = Symbol('HTMLCustomElement.$abortAll');
	static $ac = Symbol('HTMLCustomElement.$ac');
	static $acc = Symbol('HTMLCustomElement.$acc');
	static $assignedBind = Symbol('HTMLCustomElement.assignedBind');
	static $attribute = Symbol('HTMLCustomElement.attribute');
	static $bind = Symbol('HTMLCustomElement.bind');
	static $binder = Symbol('HTMLCustomElement.binder');
	static $boundArgs = Symbol('HTMLCustomElement.boundArgs');
	static $boundAt = Symbol('HTMLCustomElement.boundAt');
	static $delete = Symbol('HTMLCustomElement.delete');
	static $deleteAll = Symbol('HTMLCustomElement.deleteAll');
	static $define = Symbol('HTMLCustomElement.define');
	static $init = Symbol('HTMLCustomElement.$init');
	static $observedAttributes = Symbol('HTMLCustomElement.observedAttributes');
	static $observedAttributeNames = Symbol('HTMLCustomElement.observedAttributeNames');
	static assigningNodeFilter =
				[ 'localName', 'name', 'namespaceURI', 'nodeName', 'nodeType', 'nodeValue', 'prefix', 'value' ];
	static recursiveDOMFilter = [ 'children', 'shadowRoot' ];
	static emitOptions = [ 'bubbles', 'cancelable', 'composed' ];
	
	static get observedAttributes() {
		
		return this[HTMLCustomElement.$observedAttributeNames];
		
	}
	
	// 第一引数 target に指定したオブジェクトに、第二引数 source に指定したオブジェクトのプロパティをコピーする。
	// 第三引数 filter に、プロパティ名を列挙した Array 指定すると、filter 内に列挙されたプロパティ名だけを対象にコピーする。
	// filter が未指定の場合、すべてのプロパティがコピーされる。
	// いずれの場合も、対象となるのは for ... in によって得られるプロパティで、
	// Object.hasOwn() によって確認されるものに加え、プロトタイプチェーン上のプロパティもこれに加わる。
	// 戻り値は target で、この target は第一引数に指定したオブジェクトと同一のものとなる。
	static assign(target = {}, source, filter) {
		
		if (target && source && typeof target === 'object' && typeof source === 'object') {
			
			const typeOfFilter = typeof filter;
			let k;
			
			(typeOfFilter === 'string' || typeOfFilter === 'number') && (filter = [ filter ]);
			
			if (Array.isArray(filter)) {
				
				const { length } = filter;
				let i;
				
				i = -1;
				while (++i < length) (k = filter[i]) in source && (target[k] = source[k]);
				
			} else {
				
				for (k in source) target[k] = source[k];
				
			}
			
		}
		
		return target;
		
	}
	
	// target から辿れるプロトタイプが持つ propertyName に一致するプロパティが object であれば、
	// それらが持つプロパティをすべて Object.assign を通じて統合した新しい object を返す。
	// 既定では object 内のプロパティで名前衝突が起きた場合は、 target に近い object のプロパティが、より遠い object のプロパティに優先される。
	// inverts に true を指定すると、この優先順を反転させられる。
	static assignStatic(target, propertyName, inverts) {
		
		const	{ assignStaticTest, getStaticProperties } = HTMLCustomElement,
				props = HTMLCustomElement.getStaticProperties(...arguments, assignStaticTest), length = props.length;
		
		if (length) {
			
			const { assign } = Object, merged = {};
			let i;
			
			i = -1;
			while (++i < length) assign(merged, props[i]);
			
			return merged;
			
		}
		
		return null;
		
	}
	static assignStaticTest(v) {
		
		return v && typeof v === 'object';
		
	}
	//static assignStatic(target, propertyName, inverts) {
	//	
	//	const { getPrototypeOf, hasOwn } = Object, sources = [];
	//	let i, constructor, source;
	//	
	//	i = -1, (constructor = getPrototypeOf(target).constructor) === Function || (target = constructor);
	//	do	hasOwn(target, propertyName) &&
	//		(source = target[propertyName]) &&
	//		typeof source === 'object' &&
	//		(sources[++i] = source);
	//	while (target = getPrototypeOf(target));
	//	
	//	if (i !== -1) {
	//		
	//		const { assign } = Object, merged = {};
	//		
	//		++i, inverts && sources.reverse();
	//		while (--i > -1) assign(merged, sources[i]);
	//		
	//		return merged;
	//		
	//	}
	//	
	//	return null;
	//	
	//}
	
	// handlers に指定した object 内の function を、binder に指定した object で束縛し、
	// すべての束縛した function を boundAt に指定した object のプロパティとする。
	// boundAt が未指定であれば、boundAt の値は binder になる。その際、binder が未指定であれば、新規作成された object が戻り値になる。
	// handlers には特殊なプロパティとしてシンボル @@$boundAt, @@$boundArgs, @@$binder が指定できる。
	// @@$boundArgs は、handlers 内のすべての束縛関数に実行時に与えられる引数を指定する。
	// これは Function.prototype.bind の第三引数に相当する。
	// @@binder は、handlers 内のすべての関数を束縛する object を指定する。
	// この関数の第二引数 binder と異なる値を指定することができるが、通常は binder の値が優先される。
	// handlers は入れ子することができ、入れ子内でも @@boundArgs, @@binder を任意に設定可能である。
	// 入れ子した場合、binder の値は入れ子内に指定された @@binder の値が優先される。未指定の場合、binder がそのまま使われる。
	// また入れ子した時の boundAt の値は、指定されていれば @@$boundAt の値、そうでなければ関数実行時に指定された boundAt が使われる。
	static bindAll(handlers, binder, boundAt = handlers?.[HTMLCustomElement.$boundAt] || binder || {}) {
		
		if (handlers && typeof handlers === 'object') {
			
			const	{ isArray } = Array,
					{ assign } = Object,
					{ $binder, $boundAt, $boundArgs, bindAll, ownKeys } = HTMLCustomElement,
					ks = ownKeys(handlers),
					ksLength = ks.length;
			let i, k, handler, args;
			
			i = -1, (k = handlers?.[HTMLCustomElement.$binder]) && (binder = k);
			while (++i < ksLength)	(k = ks[i]) !== $binder &&
											k !== $boundArgs &&
											k !== $boundAt &&
												(
													typeof (handler = handlers[k]) === 'function' ?
														(
															boundAt[k] =	isArray(args = handler[$boundArgs]) ?
																					handler.bind(binder, ...args) : handler.bind(binder)
														) :
														bindAll(handler, handlers[$binder] || binder, handlers[$boundAt] || boundAt)
												);
			
			return boundAt;
			
		}
		
	}
	
	static define() {
		
		this[HTMLCustomElement.$define](this);
		
	}
	
	static ownKeys(target) {
		
		return	target && typeof target === 'object' ?
						[ ...Object.getOwnPropertySymbols(target), ...Object.keys(target) ] : null;
		
	}
	
	static getStaticProperties(target, propertyName, inverts, test) {
		
		const { getPrototypeOf, hasOwn } = Object, props = [], passes = typeof test !== 'function';
		let i, constructor, prop;
		
		i = -1, (constructor = getPrototypeOf(target).constructor) === Function || (target = constructor);
		do	hasOwn(target, propertyName) &&
			!(void (prop = target[propertyName])) &&
			(passes || test(prop, ...arguments)) &&
			(props[++i] = prop);
		while (target = getPrototypeOf(target));
		
		return inverts ? props.reverse() : props;
		
	}
	
	static getStaticFunctionsTest(v) {
		
		return typeof v === 'function';
		
	}
	
	// target から辿れるプロトタイプが持つ propertyName に一致するプロパティが Array であれば、
	// それらの Array 内のすべての要素を target から近い順に新しい配列に Array.prototype.push を通じて追加される。
	// inverts に true を指定すると、遠い順に追加される。
	static pushStatic(target, propertyName, inverts) {
		
		const props = HTMLCustomElement.getStaticProperties(...arguments, Array.isArray), length = props.length;
		
		if (length) {
			
			const merged = [];
			let i;
			
			i = -1;
			while (++i < length) merged.push(...props[i0]);
			
			return merged;
			
		}
		
		return props;
		
	}
	//static pushStatic(target, propertyName, inverts) {
	//	
	//	const { isArray } = Array, { getPrototypeOf, hasOwn } = Object, sources = [];
	//	let i, constructor, source;
	//	
	//	i = -1, (constructor = getPrototypeOf(target).constructor) === Function || (target = constructor);
	//	do	hasOwn(target, propertyName) && isArray(source = target[propertyName]) && (sources[++i] = source);
	//	while (target = getPrototypeOf(target));
	//	
	//	if (i !== -1) {
	//		
	//		const { assign } = Object, merged = [];
	//		let i0;
	//		
	//		i0 = -1, ++i, inverts && sources.reverse();
	//		while (++i0 < i) merged.push(...sources[i0]);
	//		
	//		return merged;
	//		
	//	}
	//	
	//	return null;
	//	
	//}
	
	// 第一引数に指定した Node を継承するオブジェクトを、JSON 互換のオブジェクトでコピーする。
	// 戻り値は HTMLCustomElement.nodify の第一引数に指定することができる。
	// 戻り値を JSON.stringify() を通じて文字列化し、localStorage などに保存することを想定している。
	static jsonalize(node) {
		
		const { jsonalize } = HTMLCustomElement;
		let data;
		
		if (node instanceof Node) {
			
			const	{ ELEMENT_NODE, ATTRIBUTE_NODE, TEXT_NODE, CDATA_SECTION_NODE, PROCESSING_INSTRUCTION_NODE, COMMENT_NODE, DOCUMENT_NODE, DOCUMENT_TYPE_NODE, DOCUMENT_FRAGMENT_NODE } = Node,
					{ assign, assigningNodeFilter } = HTMLCustomElement;
			
			data = assign(undefined, node, assigningNodeFilter);
			
			switch (data.nodeType) {
				
				case ELEMENT_NODE:
				
				const { attributes, childNodes, shadowRoot } = node;
				
				data.attributes = jsonalize(attributes),
				data.childNodes = jsonalize(childNodes),
				shadowRoot && (data.shadowRoot = jsonalize(shadowRoot.childNodes));
				
				break;
				
				// このブロック内の以下未対応ないし未実装
				case ATTRIBUTE_NODE:break;
				case TEXT_NODE:break;
				case CDATA_SECTION_NODE:break;
				case PROCESSING_INSTRUCTION_NODE:break;
				case COMMENT_NODE:break;
				case DOCUMENT_NODE:break;
				case DOCUMENT_TYPE_NODE:break;
				case DOCUMENT_FRAGMENT_NODE:break;
				
			}
			
		} else if (typeof node[Symbol.iterator] === 'function') {
			
			let i;
			
			i = -1, data = [];
			for (const v of node) data[++i] = jsonalize(v);
			
		}
		
		return data === undefined ? null : data;
		
	}
	
	// HTMLCustomElement.jsonalize() の逆関数で、第一引数 data に指定した JSON 互換のオブジェクトから DOM ツリーを作成する。
	// data には HTMLCustomElement.jsonalize() の戻り値を使うことができる。
	static nodify(data) {
		
		if (typeof data === 'string') {
			
			try {
				
				data = JSON.parse(data);
				
			} catch (error) {
				
				console.info(error);
				
				return null;
				
			}
			
		}
		
		const { nodify } = HTMLCustomElement;
		
		if (Array.isArray(data)) {
			
			const { length } = data, nodes = [];
			let i;
			
			i = -1;
			while (++i < length) nodes[i] = nodify(data[i]);
			
			return nodes;
			
		} else if (data && typeof data === 'object') {
			
			const	{ ELEMENT_NODE, ATTRIBUTE_NODE, TEXT_NODE, CDATA_SECTION_NODE, PROCESSING_INSTRUCTION_NODE, COMMENT_NODE, DOCUMENT_NODE, DOCUMENT_TYPE_NODE, DOCUMENT_FRAGMENT_NODE } = Node;
			let k,isAttr;
			
			switch (data.nodeType) {
				
				case ELEMENT_NODE:
				
				const	{ attributes, childNodes, nodeName, shadowRoot } = data,
						attrs = nodify(attributes),
						nodes = nodify(childNodes),
						shadow = shadowRoot && nodify(shadowRoot),
						element = document.createElement(nodeName),
						{ shadowRoot: sr } = element;
				
				for (const v of attrs) element.setAttributeNode(v);
				
				element.append(...nodes),
				
				shadow && (sr || element.attachShadow({ mode: 'open' })).replaceChildren(...shadow);
				
				return element;
				
				case ATTRIBUTE_NODE:
				k ||= 'Attribute', isAttr = true;
				case TEXT_NODE:
				k ||= 'TextNode';
				case COMMENT_NODE:
				k ||= 'Comment';
				
				const node = document['create' + k](isAttr ? data.name : data.nodeValue);
				
				isAttr && (node.value = data.value);
				
				return node;
				
				// このブロック内の以下未対応ないし未実装
				case CDATA_SECTION_NODE:break;
				case PROCESSING_INSTRUCTION_NODE:break;
				case DOCUMENT_NODE:break;
				case DOCUMENT_TYPE_NODE:break;
				case DOCUMENT_FRAGMENT_NODE:break;
				
			}
			
		}
		
	}
	
	// 第一引数 object のプロパティに対して第二引数 callback に指定した関数を再帰的に実行する。
	// 第三引数 filter にプロパティ名を列挙した Array を指定すると、それと一致するプロパティに対してのみ callback を実行する。
	// 第四引数以降の引数は callback の第四引数以降にそのまま渡される。
	static recursive(object, callback, filter, ...args) {
		
		if (object && typeof object === 'object' && typeof callback === 'function') {
			
			const { recursive } = HTMLCustomElement;
			
			if (typeof object[Symbol.iterator] === 'function') {
				
				let i,v;
				
				for (v of object) callback(recursive(v, callback, filter, ...args), ++i, object, ...args);
				
			} else {
				
				typeof filter === 'string' && (filter = [ filter ]);
				let k;
				
				if (Array.isArray(filter)) {
					
					const { length } = filter;
					let i;
					
					i = -1;
					while (++i < length)	(k = filter[i]) in object &&
													(callback(recursive(object[k], callback, filter, ...args), k, object, ...args));
					
				} else {
					
					for (k in object) callback(recursive(object[k], object, filter, ...args), k, object, ...args);
					
				}
				
			}
			
			callback(object, undefined, undefined, ...args);
			
		}
		
		return object;
		
	}
	
	constructor() {
		
		super();
		
		const	{ $acc, $assignedBind, $init, $observedAttributes, bindAll } = HTMLCustomElement,
				{ constructor } = this;
		let i;
		
		this[$acc] = {},
		
		this[$observedAttributes] = bindAll(constructor[$observedAttributes], this, {}),
		
		bindAll(constructor[$assignedBind], this),
		
		this[$init]?.();
		
	}
	
	// keys に指定したプロパティ名に一致する this[HTMLCustomElement.$acc] 内の AbortController.abort() を実行する。
	// keys には任意の数のプロパティ名を指定できる。
	// keys に何も指定せずに実行すると this[HTMLCustomElement.$acc] 内に存在するすべての AbortController.abort() を実行する。
	// AbortController.abort() が実行されるとその AbortController は this[HTMLCustomElement.$acc] から削除される。
	// 同じプロパティ名で AbortContoller を作りたい時は、
	// HTMLCustomElement.prototype.addListener() の第五引数にそのプロパティ名を指定して実行するか、
	// HTMLCustomElement.prototype.getListenerOption() と言う内部処理用的なメソッドの第二引数に同名を指定して実行する。
	abort(...keys) {
		
		const { $ac, $acc } = HTMLCustomElement, acc = this[$acc];
		
		keys.length || (keys = [ ...Object.getOwnPropertySymbols(acc), ...Object.keys(acc) ]);
		
		const { length } = keys;
		let i,k, ac;
		
		i = -1;
		while (++i < length)	(ac = acc[(k = keys[i]) === true ? $ac : k]) instanceof AbortController &&
										(ac.abort(), delete acc[k]);
		
	}
	
	abortAll(...keys) {
		
		const { recursive, recursiveDOMFilter } = HTMLCustomElement;
		
		recursive(this, this[HTMLCustomElement.$abortAll], recursiveDOMFilter, ...keys);
		
	}
	
	addListener(target, type, handler, option, key) {
		
		target?.addEventListener?.(type, handler, this.getListenerOption(option, key));
		
	}
	
	attributeChangedCallback(name, last, current) {
		
		this[HTMLCustomElement.$observedAttributes][name]?.call(this, name, last, current);
		
	}
	
	delete(args, acKeys) {
		
		this.abort(...acKeys), this[HTMLCustomElement.$delete]?.(...args), this.remove();
		
	}
	
	deleteAll(args, acKeys) {
		
		const { recursive, recursiveDOMFilter } = HTMLCustomElement;
		
		recursive(this, this[HTMLCustomElement.$deleteAll], recursiveDOMFilter, args, acKeys), this.remove();
		
	}
	
	// EventTarget.prototype.dispatchEvent() のラッパー関数。
	// 第一引数 type にイベント名、第二引数 detail にイベント通知先に渡すデータ、第三引数 flags にイベントの通知方式を指定する。
	// flags には任意の HTMLCustomElement.EMIT_OPTIONS_BUBBLES,EMIT_OPTIONS_CANCELABLE,EMIT_OPTIONS_COMPOSED を指定する。
	// 例えば customElement.emit('any', { a: 0 }, HTMLCustomElement.EMIT_OPTIONS_BUBBLES | HTMLCustomElement.EMIT_OPTIONS_CANCELABLE) であれば、
	// customElement.dispatchEvent(new CustomEvent('any', { bubbles: true, cancelable: true, detail: { a: 0 } })) と同等になる。
	emit(type, detail, flags) {
		
		const	{ emitOptions } = HTMLCustomElement,
				length = emitOptions.length,
				option = detail === undefined ? {} : { detail };
		let i;
		
		i = -1;
		while (++i < length) option[emitOptions[i]] = !!(2**i & flags);
		
		this.dispatchEvent(new CustomEvent(type, option));
		
	}
	// customElement.emit(type, detail, HTMLCustomElement.EMIT_OPTIONS_BUBBLES) のショートカット関数。
	// 第三引数 composed に true を指定すると HTMLCustomElement.EMIT_OPTIONS_COMPOSED も指定される。
	bubble(type, detail, composed) {
		
		const { EMIT_OPTIONS_BUBBLES, EMIT_OPTIONS_COMPOSED } = HTMLCustomElement;
		
		this.emit(type, detail, EMIT_OPTIONS_BUBBLES | (!composed || EMIT_OPTIONS_COMPOSED));
		
	}
	// customElement.emit(type, detail, HTMLCustomElement.EMIT_OPTIONS_BUBBLES | HTMLCustomElement.EMIT_OPTIONS_CANCELABLE) のショートカット関数。
	// 第三引数 composed に true を指定すると HTMLCustomElement.EMIT_OPTIONS_COMPOSED も指定される。
	cancelableBubble(type, detail, composed) {
		
		const { EMIT_OPTIONS_BUBBLES, EMIT_OPTIONS_CANCELABLE, EMIT_OPTIONS_COMPOSED } = HTMLCustomElement;
		
		this.emit(type, detail, EMIT_OPTIONS_BUBBLES | EMIT_OPTIONS_CANCELABLE | (!composed || EMIT_OPTIONS_COMPOSED));
		
	}
	
	getListenerOption(source, key = HTMLCustomElement.$ac) {
		
		(source = source && typeof source === 'object' ? { ...source } : { capture: !!source }).signal =
			(this[HTMLCustomShadowElement.$acc][key] ??= new AbortController()).signal;
		
		return source;
		
	}
	
	jsonalize() {
		
		return HTMLCustomElement.jsonalize(this);
		
	}
	
	removeListener(target, type, handler, option) {
		
		target?.removeEventListener?.(type, handler, option);
		
	}
	
}
HTMLCustomElement[HTMLCustomElement.$bind] = {
	
	[HTMLCustomElement.$abortAll](value, key, object, ...keys) {
		
		value instanceof HTMLCustomElement && value.abort.apply(value, keys);
		
	},
	
	[HTMLCustomElement.$deleteAll](value, key, object, args, acKeys) {
		
		value instanceof HTMLCustomElement &&
			(value.abort.apply(value, acKeys), value[HTMLCustomElement.$delete]?.apply(value, args));
		
	}
	
},
// HTMLCustomElement を継承するカスタム要素は必ずこのメソッド define でカスタム要素を定義する必要がある。
// 第一引数 customElement には、カスタム要素を示すオブジェクトを指定する。
// このメソッド内では主に静的プロパティ @@CustomElement.$attribute が処理の対象になる。
// 同プロパティは、対象のカスタム要素の独自属性を定義する記述子で、
// 独自属性の名前をキーにした object が最上位になり、
// そのキーの値に、独自属性の設定を示す object を指定する。
// 例えば属性 sample を指定する場合、以下のようになる。
// static [CustomElement.$attribute] = { sample: { observed() { ... } } }
// 属性設定のプロパティ observed には、同属性が変更された時に、attributeChangedCallback を通じて実行されるコールバック関数を指定する。
// 同コールバック関数には、attributeChangedCallback に与えられた引数がそのままの順番、値で渡される。
// さらに同コールバック関数の実行コンテキスト(this)はカスタム要素のインスタンスを示す。
// 属性設定には、他に Object.defineProperty の第三引数と同じ値が指定できる。
// 設定のプロパティに value, writable がなく、get、または set が存在しないか、それらの値が function か null 以外である場合、
// get には該当する属性の現在の値を返す関数、set には該当する属性に指定された値を設定する関数が自動的に指定される。
// この自動設定を無効化したい場合は、前述のように value, writable を設定するか、{ get: null, set: null } などとする。
// 属性名とプロパティ名を異なるものにしたい場合、属性設定にプロパティ propertyName を設定する。
// 例えば以下のようにすると、プロパティ a に代入した時、カスタム要素の属性 b に a に代入した値が設定される。
// { a: { propertyName: 'b' } }
HTMLCustomElement[HTMLCustomElement.$define] = function (customElement) {
	
	const	{ defineProperties, keys } = Object,
			{
				$assignedBind,
				$attribute,
				$bind,
				$observedAttributes,
				$observedAttributeNames,
				assignStatic,
				ownKeys
			} = HTMLCustomElement,
			attribute = assignStatic(customElement, $attribute),
			observed = customElement[$observedAttributes] = {},
			property = {},
			bind = assignStatic(customElement, $bind);
	let k, ks, attr, prop, name;
	
	for (k in attribute) {
		
		if ((attr = attribute[k]) && typeof attr === 'object') {
			
			typeof attr.observed === 'function' && (observed[k] = attr.observed),
			
			delete (prop = { ...attr }).observed,
			
			typeof prop.get === 'function' || prop.get === null || 'value' in prop || 'writable' in prop ||
				(
					prop.get =	(
										k =>	typeof prop.get === 'boolean' ?
													function () { return this.hasAttribute(k); } :
													function () { return this.getAttribute(k); }
									)(k)
				),
			typeof prop.set === 'function' || prop.set === null || 'value' in prop || 'writable' in prop ||
				(
					prop.set =	(
										k =>	typeof prop.set === 'boolean' ?
													function (v) { return this.toggleAttribute(k, !!v); } :
													function (v) { return this.setAttribute(k, v); }
									)(k)
				),
			
			delete prop.propertyName,
			
			keys(prop).length && (property[typeof (name = attr.propertyName) === 'string' ? name : k] = prop);
			
		}
		
	}
	
	ownKeys(property)?.length && defineProperties(customElement.prototype, property),
	
	(ks = keys(observed)).length && (customElement[$observedAttributeNames] = ks),
	
	ownKeys(bind)?.length && (customElement[$assignedBind] = bind),
	
	customElements.define(customElement.tagName, customElement);
	
},
HTMLCustomElement.prototype[HTMLCustomElement.$init] = function () {
	
	const	{ $init, getStaticProperties, getStaticFunctionsTest } = HTMLCustomElement;
	
	for (const v of getStaticProperties(this, $init, true, getStaticFunctionsTest)) v.call(this);
	
},
HTMLCustomElement.define();

export default class HTMLCustomShadowElement extends HTMLCustomElement {
	
	static $init = Symbol('HTMLCustomShadowElement.$init');
	static shadowOption = { mode: 'open' };
	static tagName = 'custom-shadow';
	
	static [HTMLCustomElement.$attribute] = {
		
		template: {
			
			get() {
				
				return this.getAttribute('template') || this.constructor.tagName;
				
			},
			
			observed() {
				
				this[HTMLCustomShadowElement.$init]();
				
			}
			
		}
		
	};
	
	static [HTMLCustomElement.$init]() {
		
		const	{ $init, getStaticProperties, getStaticFunctionsTest } = HTMLCustomShadowElement;
		
		for (const v of getStaticProperties(this, $init, true, getStaticFunctionsTest)) v.call(this);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	updateTemplate(aborts = true) {
		
		const	{ shadowRoot, template: templateId } = this, template = document.getElementById(templateId);
		
		template instanceof HTMLTemplateElement &&
			(aborts && this.abortAll(), shadowRoot.replaceChildren(template.content.cloneNode(true)))
		
	}
	
}
HTMLCustomShadowElement[HTMLCustomShadowElement.$init] = function () {
	
	this.shadowRoot || this.attachShadow(this.constructor.shadowOption),
	this.updateTemplate(true);
	
},
HTMLCustomShadowElement.prototype[HTMLCustomShadowElement.$init] = function () {
	
	HTMLCustomShadowElement[HTMLCustomElement.$init].call(this);
	
};