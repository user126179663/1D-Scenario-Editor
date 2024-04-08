import HTMLAssignableElement from './html-assignable-element.js';

// インスタンスのコンストラクターに設定された HTMLShadowListenerElement.$event に基づき、
// EventTarget を継承する任意のオブジェクト上の任意のイベントに対し任意のコールバック関数を実行する。
// 実際のところ、任意のイベントを聴取できるのは汎用化のためだけで、その機能を通じて、
// この要素が子要素に持つ <node-element> のイベント node-slotted を聴取することを目的としている。
// これにより、任意の操作によって拡張された <node-element> の変化を、このインスタンス上に反映させることができる。
// より正確に言えば、そうした拡張および反映のための処理を独自に実装することができる。
// なお、所定のメソッドを通じて HTMLShadowListenerElement.$event に変化を加えると、
// ページ上の document でイベント updated-shadow-listener が発生する。
// このイベントは内部処理のために使うことを想定しているため、基本的には意識する必要はない。

export default class HTMLShadowListenerElement extends HTMLAssignableElement {
	
	static $allow = Symbol('HTMLShadowListenerElement.allow');
	static $block = Symbol('HTMLShadowListenerElement.block');
	static $event = Symbol('HTMLShadowListenerElement.event');
	static $handler = Symbol('HTMLShadowListenerElement.handler');
	static $updated = Symbol('HTMLShadowListenerElement.updated');
	static EVENT_TYPE_UPDATED = 'updated-shadow-listener';
	
	// 第一引数 target に指定された HTMLShadowListenerElement を継承するオブジェクトかそのインスタンスから、
	// そのオブジェクトが持つ静的プロパティ HTMLShadowListenerElement.$event を取得する。
	// 戻り値は Array で、その中から元のプロパティの値からオブジェクトの静的プロパティ HTMLShadowListenerElement.$block に設定された Array に列挙された
	// 文字列に一致するプロパティ id を持つ要素が取り除かれる。
	// ただし、静的プロパティ HTMLShadowListenerElement.$allow に設定された Array に列挙された文字列内に $block に一致する文字列があった場合、
	// その文字列に一致する id を持つ要素は戻り値に含まれる。（つまり $allow の指定は $block に優先される）
	// また $event 内の要素で id が重複する場合、より後方の要素だけが戻り値に含まれる。（つまり id の重複は許容されない）
	static getShadowListeners(target) {
		
		if (target = HTMLShadowListenerElement.asPrototype(target, HTMLShadowListenerElement)) {
			
			const	{ isArray } = Array,
					{ $allow, $block, $event, getConstructor, pushStatic } = HTMLShadowListenerElement,
					allowList = target[$allow],
					blockList = isArray(target[$block]) ? [ ...target[$block] ] : [],
					shadowListeners = pushStatic(target, $event) ?? [],
					shadowListenersLength = shadowListeners.length,
					filtered = [];
			let i,l,i0,i1, shadowListener, id;
			
			if (isArray(allowList)) {
				
				i = -1, l = blockList.length;
				while (++i < l) allowList.indexOf(blokckList[i]) === -1 || blockList.splice(i, 1);
				
			}
			
			i = i0 = i1 = -1;
			while (++i < shadowListenersLength) {
				
				if ((id = (shadowListener = shadowListeners[i]).id) && blockList.indexOf(id) === -1) {
					
					i0 = i;
					while (++i0 < shadowListenersLength && shadowListeners[i0].id !== id);
					i0 === shadowListenersLength && (filtered[++i1] = shadowListener);
					
				} else filtered[++i1] = shadowListener;
				
			}
			
			return filtered;
			
		}
		
		return null;
		
	}
	
	static [HTMLAssignableElement.$init]() {
		
		const	{ isArray } = Array,
				{ $event, $handler, asArray } = HTMLShadowListenerElement,
				{ shadowListeners, shadowRoot } = this,
				shadowListenersLength = shadowListeners.length,
				handler = this[$handler] ??= HTMLShadowListenerElement[$handler].bind(this),
				targets = [];
		let i,l,i0,l0,i1,l1,k, descriptor, target, types,type;
		
		this.abort($event);
		
		i = -1;
		while (++i < shadowListenersLength) {
			
			if ((descriptor = shadowListeners[i]) && typeof descriptor === 'object') {
				
				const { option, targets: rawTargets, types: rawTypes } = descriptor;
				
				isArray(rawTargets) ? targets.push(...rawTargets) : (targets[0] = rawTargets),
				
				i0 = -1, l0 = targets.length;
				while (++i0 < l0) {
					
					if (target = targets[i0]) {
						
						target === true ?	(targets[i0] = shadowRoot) :
							typeof target === 'string' &&
								(
									targets.splice(i0, 1, ...shadowRoot.querySelectorAll(target)),
									i0 += -l0 + (l0 = targets.length)
								);
						
					} else (targets.splice(i0--, 1), --l0);
					
				}
				
				i0 = -1, l1 = l0, l0 = (types = asArray(rawTypes)).length;
				while (++i0 < l0) {
					
					i1 = -1, type = types[i0];
					while (++i1 < l1) this.addListener(targets[i1], type, handler, option, $event);
					
				}
				
				targets.length = 0;
				
			}
			
		}
		
	}
	
	static addShadowListeners(target = this, ...descriptors) {
		
		const shadowListeners = HTMLShadowListenerElement.getShadowListeners(target);
		
		if (shadowListeners) {
			
			const	{ $event, $updated, EVENT_TYPE_UPDATED, getConstructor, getShadowListeners, updates } =
						HTMLShadowListenerElement,
					{ length } = descriptors,
					constructor = getConstructor(target),
					{ length: shadowListenersLength } = constructor[$event] = shadowListeners;
			let i,i0;
			
			i = -1, i0 = shadowListenersLength - 1;
			while (++i < length) shadowListeners[++i0] = descriptors[i];
			
			i0 === shadowListenersLength - 1 ||
				document.dispatchEvent(new CustomEvent(EVENT_TYPE_UPDATED, { detail: { $updated, constructor, updates } }));
			
		}
		
	}
	
	//static addDescriptor(descriptor, constructor = this) {
	//	
	//	if (descriptor && typeof descriptor === 'object') {
	//		
	//		const	{ isArray } = Array,
	//				{ $event, $updated, EVENT_TYPE_UPDATED, isSameListener, updates, asArray } = HTMLShadowListenerElement,
	//				event = constructor[$event] ??= {};
	//		let i,l,i0,l0,k, updated, listeners,listener, addedListeners;
	//		
	//		for (k in descriptor) {
	//			
	//			i = -1,
	//			l = (listeners = descriptor[k] = asArray(descriptor[k])).length,
	//			l0 = (addedListeners = event[k] = asArray(event[k] ?? [])).length;
	//			while (++i < l) {
	//				
	//				i0 = -1, listener = listeners[i];
	//				while	(++i0 < l0 && !isSameListener(addedListeners[i0], listener));
	//				i0 === l0 || addedListeners.splice(i0, 1),
	//				addedListeners[l0++] = listener,
	//				updated ??= true;
	//				
	//			}
	//			
	//		}
	//		
	//		updated &&
	//			document.dispatchEvent(new CustomEvent(EVENT_TYPE_UPDATED, { detail: { $updated, constructor, updates } }));
	//		
	//	}
	//	
	//}
	
	//static isSameListener(source, target) {
	//	
	//	let isSame;
	//	
	//	if (isSame = source && typeof source === 'object' && target && typeof target === 'object') {
	//		
	//		const { hasOwn, keys } = Object;
	//		let i,l,k;
	//		
	//		for (k in source) {
	//			
	//			if (isSame = hasOwn(target, k)) {
	//				
	//				switch (k) {
	//					
	//					case 'targets':
	//					case 'handlers':
	//					if (
	//							isSame =	(l = (v = isArray(v = source[k]) ? v : [ v ]).length) ===
	//										(v0 = isArray(v0 = target[k]) ? v0 : [ v0 ]).length
	//					) {
	//						
	//						i = -1;
	//						while (++i < l && v0.indexOf(v[i]) !== -1);
	//						isSame = i === l;
	//						
	//					}
	//					break;
	//					
	//					case 'option':
	//					if (
	//							isSame =
	//								keys((v = source[k0]) && typeof v === 'object' ? v : (v = { capture: !!v })).length ===
	//								keys((v0 = target[k0]) && typeof v0 === 'object' ? v0 : (v0 = { capture: !!v0 })).length
	//					) {
	//						
	//						for (k0 in v) if (!(isSame = hasOwn(v0, k0) && v[k0] === v0[k0])) break;
	//						
	//					}
	//					break;
	//					
	//				}
	//				
	//			} else break;
	//			
	//		}
	//		
	//	}
	//	
	//	return isSame;
	//	
	//}
	
	static removeDescriptor(target = this, ...values) {
		
		const shadowListeners = HTMLShadowListenerElement.getShadowListeners(target);
		
		if (shadowListeners) {
			
			const	{ $event, $updated, EVENT_TYPE_UPDATED, getConstructor, getShadowListeners, updates } =
						HTMLShadowListenerElement,
					{ length } = values,
					constructor = getConstructor(target),
					{ length: shadowListenersLength } = constructor[$event] = shadowListeners;
			let i,i0;
			
			i = -1;
			while (++i < length) {
				
				switch (typeof (v = values[i])) {
					
					case 'number':
					shadowListeners.splice(v, 1);
					break;
					
					case 'object':
					v = v?.id;
					case 'string':
					i0 = -1;
					while (++i0 < shadowListenersLength) shadowListeners[i].id === v && shadowListeners.splice(i, 1);
					break;
					
				}
				
			}
			
			shadowListenersLength === shadowListeners.length ||
				document.dispatchEvent(new CustomEvent(EVENT_TYPE_UPDATED, { detail: { $updated, constructor, updates } }));
			
		}
		
	}
	
	//static removeDescriptor(descriptor, constructor = this) {
	//	
	//	if (descriptor && typeof descriptor === 'object') {
	//		
	//		const	{ hasOwn } = Object,
	//				{ isArray } = Array,
	//				{ $event, $updated, EVENT_TYPE_UPDATED, isSameListener, updates, asArray } = HTMLShadowListenerElement,
	//				event = constructor[$event] ??= {};
	//		let i,l,i0,l0,k, updated, listeners,listener, addedListeners,addedListener;
	//		
	//		for (k in descriptor) {
	//			
	//			if (hasOwn(event, k)) {
	//				
	//				i = -1,
	//				l = (listeners = descriptor[k] = asArray(descriptor[k])).length,
	//				l0 = (addedListeners = event[k] = asArray(event[k] ?? [])).length;
	//				while (++i < l) {
	//					
	//					i0 = -1, listener = listeners[i];
	//					while	(
	//								++i0 < l0 &&
	//								!(
	//									isSameListener(listener, addedListeners[i0]) &&
	//										(addedListeners.splice(i0--, 1), --l0, updated ??= true)
	//								)
	//							);
	//					
	//					l0 || (delete event[k], i = l);
	//					
	//				}
	//				
	//			}
	//			
	//		}
	//		
	//		updated &&
	//			document.dispatchEvent(new CustomEvent(EVENT_TYPE_UPDATED, { detail: { $updated, constructor, updates } }));
	//		
	//	}
	//	
	//}
	
	static updates(target) {
		
		const { $updated, constructor } = this;
		
		return $updated === HTMLShadowListenerElement.$updated && target instanceof constructor;
		
	}
	
	constructor() {
		
		super();
		
		const { $updated, EVENT_TYPE_UPDATED } = HTMLShadowListenerElement;
		
		this.addListener	(
									document,
									EVENT_TYPE_UPDATED,
									this[$updated] = HTMLShadowListenerElement[$updated].bind(this)
								);
		
	}
	
	get shadowListeners() {
		
		return HTMLShadowListenerElement.getShadowListeners(this);
		
	}
	
}
HTMLShadowListenerElement[HTMLShadowListenerElement.$updated] = function (event) {
	
	event.detail.updates(this) && HTMLShadowListenerElement[HTMLAssignableElement.$init].call(this);
	
},
HTMLShadowListenerElement[HTMLShadowListenerElement.$handler] = function (event) {
	
	const	{ isArray } = Array,
			{ $event } = HTMLShadowListenerElement,
			{ constructor, shadowListeners, shadowRoot } = this,
			{ length: shadowListenersLength } = shadowListeners,
			{ target: eventTarget, type } = event,
			composedPath = event.composedPath(),
			path = composedPath.length ? composedPath : [ eventTarget ],
			pathLength = path.length,
			targets = [];
	let i,l,i0,l0,i1,l1, target, types, descriptor;
	
	i = -1;
	while (++i < shadowListenersLength) {
		
		if (isArray(types = (descriptor = shadowListeners[i]).types) ? types.indexOf(type) !== -1 : types === type) {
			
			const { targets: rawTargets } = descriptor;
			
			isArray(rawTargets) ? targets.push(...rawTargets) : (targets[0] = rawTargets),
			i0 = -1, l0 = targets.length;
			while (++i0 < l0) {
				
				if (target = targets[i0]) {
					
					if (target === true && path.indexOf(shadowRoot) !== -1) break;
					
					if (typeof target === 'string') {
						
						i1 = -1;
						while (++i1 < pathLength && !path[i1].matches?.(target));
						
						if (i1 !== pathLength) break;
						
					} else if (path.indexOf(target) !== -1) break;
					
				}
				
			}
			
			targets.length = 0;
			
			if (i0 !== l0) {
				
				const { handlers } = descriptor;
				
				if (typeof handlers === 'function') {
					
					handlers.call(this, event, eventTarget);
					
				} else if (isArray(handlers) && (l0 = handlers.length)) {
					
					i0 = -1;
					while (++i0 < l0) handlers[i0]?.call?.(this, event, eventTarget);
					
				}
				
			}
			
		}
		
	}
	
};