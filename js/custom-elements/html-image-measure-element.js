export default class HTMLImageMeasureElement extends HTMLElement {
	
	static loadEventOption = { once: true };
	static tagName = 'img-measure';
	static observedAttributeNames = [ 'src' ];
	static get observedAttributes() {
		
		return this.observedAttributeNames;
		
	}
	
	static loaded(event) {
		
		const	{ setCSSPropertyWithUnit } = HTMLImageMeasureElement,
				{ id, src, style } = this,
				{ height, naturalWidth, naturalHeight, width } = this.img;
		let prefix;
		
		setCSSPropertyWithUnit(this, (prefix = 'img-' + (id ? id + '-' : '')) + 'height', height, 'px'),
		setCSSPropertyWithUnit(this, prefix + 'natural-height', naturalHeight, 'px'),
		setCSSPropertyWithUnit(this, prefix + 'natural-width', naturalWidth, 'px'),
		setCSSPropertyWithUnit(this, prefix + 'width', width, 'px'),
		style.setProperty((prefix = '--' + prefix) + 'src', `url("${src}")`),
		style.setProperty(prefix + 'wh', +(width > height)),
		style.setProperty(prefix + 'hw', +(height > width)),
		style.setProperty(prefix + 'nwh', +(naturalWidth > naturalHeight)),
		style.setProperty(prefix + 'nhw', +(naturalHeight > naturalWidth));
		
	}
	
	static setCSSPropertyWithUnit(element, name, value, unit) {
		
		element instanceof Element &&
			(
				element.style.setProperty((name = '--' + name) + (unit ? '-raw' : ''), value),
				unit && element.style.setProperty(name, value + unit)
			);
		
	}
	
	//static parseFloat(v, defaultValue) {
	//	
	//	return HTMLImageMeasureElement.parseNumber(v, defaultValue, true);
	//	
	//}
	//static parseInt(v, defaultValue) {
	//	
	//	return HTMLImageMeasureElement.parseNumber(v, defaultValue);
	//	
	//}
	//static parseNumber(v, defaultValue, asFloat) {
	//	
	//	let v0;
	//	
	//	return Number.isNaN(v0 = window['parse' + (asFloat ? 'Float' : 'Int')](v)) ? v || defaultValue : v0;
	//	
	//}
	
	constructor() {
		
		super();
		
		const { constructor: { loaded, loadEventOption } } = this;
		
		(this.img = new Image()).addEventListener('load', this.loaded = loaded.bind(this), loadEventOption);
		
	}
	attributeChangedCallback(name, last, current) {
		
		switch (name) {
			
			case 'src':
			this.img.src = current, this.dispatchEvent(new CustomEvent('changed-src', { detail: { current, last } }));
			break;
			
		}
		
	}
	
	setCSSPropertyWithUnit() {
		
		HTMLImageMeasureElement.setCSSPropertyWithUnit(this, ...arguments);
		
	}
	
	get src() {
		
		return this.getAttribute('src');
		
	}
	set src(v) {
		
		this.setAttribute('src', v);
		
	}
	
}

customElements.define(HTMLImageMeasureElement.tagName, HTMLImageMeasureElement);