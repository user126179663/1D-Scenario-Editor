import HTMLCustomShadowElement from './html-custom-element.js';

// このカスタム要素は、DOM を文字列化した HTML から、再度 DOM を復元するために必要とされる。
// 具体的に言えば、HTML にした DOM を HTML から復元しても、イベントリスナーなどの状態は復元されないが、
// この要素の ShadowDOM 内の <slot> 要素に特定の要素が割り当てられた時に、slotchange イベントから起動されるイベントハンドラー内で、
// 後付けでそれらの要素にイベントリスナーを登録することができる。

export default class HTMLAssignableElement extends HTMLCustomShadowElement {
	
	static $assignedNodesOption = Symbol('HTMLAssignableElement.assignedNodesOption');
	static $handler = Symbol('HTMLAssignableElement.handler');
	static $last = Symbol('HTMLAssignableElement.last');
	static $slot = Symbol('HTMLAssignableElement.slot');
	
	static [HTMLCustomShadowElement.$init]() {
		
		const	{ isArray } = Array,
				{ $handler, $slot } = HTMLAssignableElement,
				{ constructor, shadowRoot } = this,
				slot = constructor[$slot],
				handler = this[$handler] ??= HTMLAssignableElement[$handler].bind(this);
		let i,l,k, slots,s;
		
		this.abort($slot);
		
		for (k in slot) {
			
			i = -1, l = (slots = shadowRoot.querySelectorAll(k)).length;
			while (++i < l)
				(s = slots[i]).tagName === 'SLOT' && this.addListener(s, 'slotchange', handler, undefined, $slot);
			
		}
		
	}
	
	static record(current, last) {
		
		const { isArray } = Array, assigned = [], discharged = [];
		let i,l,i0,i1, v;
		
		i = i0 = -1, l = (isArray(current ??= []) ? current : (current = [ current ])).length,
		isArray(last ??= []) || (last = [ last ]);
		while (++i < l) last.indexOf(v = current[i]) === -1 && (assigned[++i0] = v);
		
		i = i1 = -1, l = last.length;
		while (++i < l) current.indexOf(last[i]) === -1 && (discharged[++i1] = last.splice(i--, 1)[0], --l);
		
		if (++i0) {
			
			i = -1;
			while (++i < i0) last[l++] = assigned[i];
			
		}
		
		return { assigned, discharged };
		
	}
	
	constructor() {
		
		super();
		
		this[HTMLAssignableElement.$last] ??= new WeakMap();
		
	}
	
	recordSlotting(targetSlot) {
		
		if (
				targetSlot instanceof HTMLSlotElement &&
				targetSlot.tagName === 'SLOT' &&
				this.shadowRoot.contains(targetSlot)
		) {
			
			const { $assignedNodesOption, $last } = HTMLAssignableElement, last = this[$last];
			
			return HTMLAssignableElement.record	(
																targetSlot.assignedNodes(HTMLAssignableElement[$assignedNodesOption]),
																(last.has(targetSlot) ? last : (last.set(targetSlot, []))).get(targetSlot)
															);
			
		}
		
	}
	
}
HTMLAssignableElement[HTMLAssignableElement.$assignedNodesOption] = { flatten: true };
// Sample
//HTMLAssignableElement[HTMLAssignableElement.$slot] = {
//	'#sample': {
//		
//		['.sample-0'](event, slotted, slottedNodes) {
//			
//			console.log(...arguments);
//			
//		},
//		
//		['.sample-1'](event, slotted, slottedNodes) {
//			
//			console.log(...arguments);
//			
//		}
//		
//	}
//};
HTMLAssignableElement[HTMLAssignableElement.$handler] = function (event) {
	
	const	{ isArray } = Array,
			{ $slot } = HTMLAssignableElement,
			slot = this.constructor[$slot],
			{ target } = event,
			{ assigned, discharged } = this.recordSlotting(target);
	let i,l,i0,l0,k,v,k0, isDischarged, changed, node, handler;
	
	isDischarged = -1;
	while (++isDischarged < 2) {
		
		l = (changed = isDischarged ? discharged : assigned).length;
		
		for (k in slot) {
			
			if (target.matches(k) && (v = slot[k])) {
				
				switch (typeof v) {
					
					case 'function':
					i = -1;
					while (++i < l) v.call(this, event, changed[i], !!isDischarged, changed);
					break;
					
					case 'object':
					i = -1;
					while (++i < l) {
						
						for (k0 in v) {
							
							if ((node = changed[i]).matches(k0)) {
								
								if (isArray(handler = v[k0])) {
									
									i0 = -1, l0 = handler.length;
									while (++i0 < l0) handler[i0]?.call?.(this, event, node, !!isDischarged, changed);
									
								} else handler?.call?.(this, event, node, !!isDischarged, changed);
								
							}
							
						}
						
					}
					break;
					
				}
				
			}
			
		}
		
	}
	
};