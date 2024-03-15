import { HTMLCustomElement } from './html-custom-element.js';

export default class HTMLIOPointElement extends HTMLCustomElement {
	
	static defaultEventOption = { once: true };
	static tagName = 'io-point';
	
	static [HTMLCustomElement.$bind] = {
		
		offInternal(event) {
			
			const { onExternal, offInternal } = this;
			
			this.toggleAttribute('activating', false),
			this.toggleAttribute('activated', true),
			
			this.removeListener(this, 'pointerup', offInternal),
			this.addListener(window, 'pointerdown', onExternal);
			
		},
		onExternal(event) {
			
			const path = event.composedPath();
			let isInactivatable,p;
			
			if (path.indexOf(this) !== -1 && path[0] !== this) {
				
				const { length } = path;
				let i;
				
				i = -1;
				while (++i < length && (p = path[i]) !== this && !('iopInactivatable' in p.dataset));
				
				if (i === length || p === this) return;
				
				isInactivatable = true;
				
			}
			
			const { onExternal, onInternal } = this,
					handler = event =>	(
													this.toggleAttribute('activated', false),
													this.removeListener(window, 'pointerdown', onExternal),
													this.addListener(this, 'pointerdown', onInternal)
												);
			
			isInactivatable ?	this.addListener	(
																window,
																'pointerup',
																event => event.composedPath().indexOf(p) === -1 || handler(),
																{ once: true }
															) :
															handler();
			
		},
		onInternal(event) {
			
			const { offInternal, onInternal } = this;
			
			this.toggleAttribute('activating', true),
			
			this.removeListener(this, 'pointerdown', onInternal),
			this.addListener(this, 'pointerup', offInternal);
			
		}
		
	};
	
	static [HTMLCustomElement.$init]() {
		
		const { onInternal } = this;
		
		this.addListener(this, 'pointerdown', onInternal);
		
	}
	
	constructor() {
		
		super();
		
	}
	
}
HTMLIOPointElement.define();