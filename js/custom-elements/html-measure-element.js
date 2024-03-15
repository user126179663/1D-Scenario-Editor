export default class HTMLMeasureElement extends HTMLElement {
	
	static $observed = Symbol('HTMLMeasureElement.observed');
	static $observer = Symbol('HTMLMeasureElement.observer');
	static tagName = 'dom-measure';
	
	static observed(entries, observer) {
		
		this.toggleAttribute('observed-resizing', true);
		
		const { id, style } = this, rect = this.getBoundingClientRect(), { height, left, top, width } = rect;
		let k,v,v0, prefix, isSize;
		
		prefix = '--' + (id ? id + '-' : '');
		for (k in rect) typeof (v = rect[k]) === 'number' &&
			(
				v0 =	(isSize = k === 'width' || k === 'height') ?
							Number(style.getPropertyValue(prefix + k + '-raw')) >= v ? -1 : v : v,
				style.setProperty(prefix + k + '-raw', v),
				style.setProperty(prefix + k, v + 'px'),
				isSize &&
					(style.setProperty(prefix + k + '-actual-raw', v), style.setProperty(prefix + k + '-actual', v + 'px'))
			);
		
		style.setProperty(prefix + 'scroll-left-raw', left + scrollX),
		style.setProperty(prefix + 'scroll-left', left + scrollX + 'px'),
		style.setProperty(prefix + 'scroll-top-raw', top + scrollY),
		style.setProperty(prefix + 'scroll-top', top + scrollY + 'px'),
		
		style.setProperty(prefix + 'wh', +(width === height || width > height)),
		style.setProperty(prefix + 'hw', +(width !== height && height > width));
		
		this.toggleAttribute('observed-resizing', false);
		
	}
	
	constructor() {
		
		super();
		
		const { $observed, $observer } = HTMLMeasureElement, { constructor: { observed } } = this;
		
		(this[$observer] = new ResizeObserver(this[$observed] = observed.bind(this))).observe(this);
		
	}
	
}

customElements.define(HTMLMeasureElement.tagName, HTMLMeasureElement);