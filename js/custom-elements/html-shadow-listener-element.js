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
	
	static $event = Symbol('HTMLShadowListenerElement.event');
	static $handler = Symbol('HTMLShadowListenerElement.handler');
	static $updated = Symbol('HTMLShadowListenerElement.updated');
	static EVENT_TYPE_UPDATED = 'updated-shadow-listener';
	
	static [HTMLAssignableElement.$init]() {
		
		const	{ isArray } = Array,
				{ $event, $handler, wrapArray } = HTMLShadowListenerElement,
				{ constructor, shadowRoot } = this,
				descriptor = constructor[$event],
				handler = this[$handler] ??= HTMLShadowListenerElement[$handler].bind(this),
				targets = [];
		let i,l,i0,l0,k, listeners, target;
		
		this.abort($event);
		
		if (descriptor && typeof descriptor === 'object') {
			
			for (k in descriptor) {
				
				i = -1, l = (listeners = descriptor[k] = wrapArray(descriptor[k])).length;
				while (++i < l) {
					
					const { option, targets: currentTargets } = listeners[i];
					
					isArray(currentTargets) ? targets.push(...currentTargets) : (targets[0] = currentTargets),
					
					i0 = -1, l0 = targets.length;
					while (++i0 < l0) {
						
						if (target = targets[i0]) {
							
							target === true ?	(targets[i0] = shadowRoot) :
								typeof target === 'string' && targets.splice(i0, 1, ...shadowRoot.querySelectorAll(target));
							
						} else targets.splice(i0, 1);
						
					}
					
					i0 = -1, l0 = targets.length;
					while (++i0 < l0) this.addListener(targets[i0], k, handler, option, $event);
					
					targets.length = 0;
					
				}
				
			}
			
		}
		
	}
	
	static addDescriptor(descriptor) {
		
		if (descriptor && typeof descriptor === 'object') {
			
			const	{ isArray } = Array,
					{ $event, $updated, EVENT_TYPE_UPDATED, isSameListener, wrapArray } = HTMLShadowListenerElement,
					event = this.constructor[$event] ??= {};
			let i,l,i0,l0,k, updated, listeners,listener, addedListeners;
			
			for (k in descriptor) {
				
				i = -1,
				l = (listeners = descriptor[k] = wrapArray(descriptor[k])).length,
				l0 = (addedListeners = event[k] = wrapArray(event[k] ?? [])).length;
				while (++i < l) {
					
					i0 = -1, listener = listeners[i];
					while	(++i0 < l0 && !isSameListener(addedListeners[i0], listener));
					i0 === l0 || addedListeners.splice(i0, 1),
					addedListeners[l0++] = listener,
					updated ??= true;
					
				}
				
			}
			
			updated && document.dispatchEvent(new CustomEvent(EVENT_TYPE_UPDATED, { detail: $updated }));
			
		}
		
	}
	
	static isSameListener(source, target) {
		
		let isSame;
		
		if (isSame = source && typeof source === 'object' && target && typeof target === 'object') {
			
			const { hasOwn, keys } = Object;
			let i,l,k;
			
			for (k in source) {
				
				if (isSame = hasOwn(target, k)) {
					
					switch (k) {
						
						case 'targets':
						case 'handlers':
						if (
								isSame =	(l = (v = isArray(v = source[k]) ? v : [ v ]).length) ===
											(v0 = isArray(v0 = target[k]) ? v0 : [ v0 ]).length
						) {
							
							i = -1;
							while (++i < l && v0.indexOf(v[i]) !== -1);
							isSame = i === l;
							
						}
						break;
						
						case 'option':
						if (
								isSame =
									keys((v = source[k0]) && typeof v === 'object' ? v : (v = { capture: !!v })).length ===
									keys((v0 = target[k0]) && typeof v0 === 'object' ? v0 : (v0 = { capture: !!v0 })).length
						) {
							
							for (k0 in v) if (!(isSame = hasOwn(v0, k0) && v[k0] === v0[k0])) break;
							
						}
						break;
						
					}
					
				} else break;
				
			}
			
		}
		
		return isSame;
		
	}
	
	static removeDescriptor(descriptor) {
		
		if (descriptor && typeof descriptor === 'object') {
			
			const	{ hasOwn } = Object,
					{ isArray } = Array,
					{ $event, $updated, EVENT_TYPE_UPDATED, isSameListener, wrapArray } = HTMLShadowListenerElement,
					event = this.constructor[$event] ??= {};
			let i,l,i0,l0,k, updated, listeners,listener, addedListeners,addedListener;
			
			for (k in descriptor) {
				
				if (hasOwn(event, k)) {
					
					i = -1,
					l = (listeners = descriptor[k] = wrapArray(descriptor[k])).length,
					l0 = (addedListeners = event[k] = wrapArray(event[k] ?? [])).length;
					while (++i < l) {
						
						i0 = -1, listener = listeners[i];
						while	(
									++i0 < l0 &&
									!(
										isSameListener(listener, addedListeners[i0]) &&
											(addedListeners.splice(i0--, 1), --l0, updated ??= true)
									)
								);
						
						l0 || (delete event[k], i = l);
						
					}
					
				}
				
			}
			
			updated && document.dispatchEvent(new CustomEvent(EVENT_TYPE_UPDATED, { detail: $updated }));
			
		}
		
	}
	
	static wrapArray(target) {
		
		return Array.isArray(target) ? target : [ target ];
		
	}
	
	constructor() {
		
		super();
		
		const { $updated } = HTMLShadowListenerElement;
		
		this.addListener	(
									document,
									'updated-shadow-listener',
									this[$updated] = HTMLShadowListenerElement[$updated].bind(this)
								);
		
	}
	
}
HTMLShadowListenerElement[HTMLShadowListenerElement.$updated] = function (event) {
	
	const { $updated } = HTMLShadowListenerElement, { detail } = event;
	
	detail === $updated && HTMLShadowListenerElement[HTMLAssignableElement.$init].call(this);
	
},
HTMLShadowListenerElement[HTMLShadowListenerElement.$handler] = function (event) {
	
	const	{ isArray } = Array,
			{ $event, wrapArray } = HTMLShadowListenerElement,
			{ shadowRoot } = this,
			{ target, type } = event,
			composedPath = event.composedPath(),
			composedPathLength = composedPath.length,
			path = composedPath.length ? composedPath : [ target ],
			pathLength = path.length,
			descriptor = this.constructor[$event],       
			targets = [];
	let i,l,k,i0,l0,i1,l1, listeners,listener,targetValue;
	
	for (k in descriptor) {
		
		if (type === k) {
			
			i = -1, l = (listeners = descriptor[k] = wrapArray(descriptor[k])).length;
			while (++i < l) {
				
				const { targets: currentTargets } = (listener = listeners[i]);
				
				isArray(currentTargets) ? targets.push(...currentTargets) : (targets[0] = currentTargets),
				i0 = -1, l0 = targets.length;
				while (++i0 < l0) {
					
					if (targetValue = targets[i0]) {
						
						if (targetValue === true && path.indexOf(shadowRoot) !== -1) break;
							
						if (typeof targetValue === 'string') {
							
							i1 = -1;
							while (++i1 < pathLength && !path[i1].matches?.(targetValue));
							
							if (i1 < pathLength) break;
							
						} else if (path.indexOf(targetValue) !== -1) break;
						
					}
					
				}
				
				targets.length = 0;
				
				if (i0 < l0) {
					
					const { handlers } = listener;
					
					if (typeof handlers === 'function') {
						
						handlers.call(this, event, target);
						
					} else if (isArray(handlers) && (l0 = handlers.length)) {
						
						i0 = -1;
						while (++i0 < l0) handlers[i0]?.call?.(this, event, target);
						
					}
					
				}
				
			}
			
		}
		
	}
	
};