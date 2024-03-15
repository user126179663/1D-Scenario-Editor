export default class HTMLImageFetcherElement extends HTMLElement {
	
	static $img = Symbol('HTMLImageFetcherElement.img');
	static $loaded = Symbol('HTMLImageFetcherElement.loaded');
	static loadEventOption = {};
	static tagName = 'fetch-img';
	static observedAttributeNames = [ 'src' ];
	static get observedAttributes() {
		
		return this.observedAttributeNames;
		
	}
	
	static loaded(event) {
		
		const	{ $img } = HTMLImageFetcherElement,
				{ id, src, style, url, x, y, px, py, scale } = this,
				{ height, naturalWidth, naturalHeight, width } = this[$img];
		let prefix;
		
		style.setProperty((prefix = '--img-' + (id ? id + '-' : '')) + 'height', height + 'px'),
		style.setProperty(prefix + 'height-raw', height),
		style.setProperty(prefix + 'natural-height', naturalHeight + 'px'),
		style.setProperty(prefix + 'natural-height-raw', naturalHeight),
		style.setProperty(prefix + 'natural-width', naturalWidth + 'px'),
		style.setProperty(prefix + 'natural-width-raw', naturalWidth),
		style.setProperty(prefix + 'width', width + 'px'),
		style.setProperty(prefix + 'width-raw', width),
		style.setProperty(prefix + 'src', `url("${src}")`),
		style.setProperty(prefix + 'url', `url("${url || src}")`),
		style.setProperty(prefix + 'scale', scale),
		style.setProperty(prefix + 'x', x),
		style.setProperty(prefix + 'y', y),
		style.setProperty(prefix + 'px', px),
		style.setProperty(prefix + 'py', py),
		style.setProperty(prefix + 'wh', +(width > height)),
		style.setProperty(prefix + 'hw', +(height > width));
		
	}
	
	static parseFloat(v, defaultValue) {
		
		return HTMLImageFetcherElement.parseNumber(v, defaultValue, true);
		
	}
	static parseInt(v, defaultValue) {
		
		return HTMLImageFetcherElement.parseNumber(v, defaultValue);
		
	}
	static parseNumber(v, defaultValue, asFloat) {
		
		let v0;
		
		return Number.isNaN(v0 = window['parse' + (asFloat ? 'Float' : 'Int')](v)) ? v || defaultValue : v0;
		
	}
	
	constructor() {
		
		super();
		
		const { $img, $loaded } = HTMLImageFetcherElement, { constructor: { loaded, loadEventOption } } = this;
		
		// AbortController を設定する必要がある（優先度が高くないため後回しにしている）
		(this[$img] = new Image()).addEventListener('load', this[$loaded] = loaded.bind(this), loadEventOption);
		
	}
	attributeChangedCallback(name, last, current) {
		
		switch (name) {
			
			case 'src':
			this.updateSrc(current), this.dispatchEvent(new CustomEvent('changed-src', { detail: { current, last } }));
			break;
			
		}
		
	}
	
	updateSrc(src = this.src) {
		
		this[HTMLImageFetcherElement.$img].src = src;
		
	}
	
	get px() {
		
		return HTMLImageFetcherElement.parseFloat(this.getAttribute('px'), 0);
		
	}
	set px(v) {
		
		this.setAttribute('px', v);
		
	}
	get py() {
		
		return HTMLImageFetcherElement.parseFloat(this.getAttribute('py'), 0);
		
	}
	set py(v) {
		
		this.setAttribute('py', v);
		
	}
	get scale() {
		
		return HTMLImageFetcherElement.parseFloat(this.getAttribute('scale'), 1);
		
	}
	set scale(v) {
		
		this.setAttribute('scale', v);
		
	}
	get src() {
		
		return this.getAttribute('src');
		
	}
	set src(v) {
		
		this.setAttribute('src', v);
		
	}
	get url() {
		
		return this.getAttribute('url');
		
	}
	set url(v) {
		
		this.setAttribute('url', v);
		
	}
	get x() {
		
		return HTMLImageFetcherElement.parseFloat(this.getAttribute('x'), 0);
		
	}
	set x(v) {
		
		this.setAttribute('x', v);
		
	}
	get y() {
		
		return HTMLImageFetcherElement.parseFloat(this.getAttribute('y'), 0);
		
	}
	set y(v) {
		
		this.setAttribute('y', v);
		
	}
	
}

customElements.define(HTMLImageFetcherElement.tagName, HTMLImageFetcherElement);