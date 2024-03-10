import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLImageLoaderElement extends HTMLCustomShadowElement {
	
	static $dataURL = Symbol('HTMLImageLoaderElement.dataURL');
	static measureAssignedNodesOption = { flatten: true };
	static readerListenerOption = { once: true };
	static tagName = 'img-loader';
	
	static [HTMLCustomShadowElement.$attribute] = {
		
		src: {
			
			observed(name, last, current) {
				
				const { measure } = this;
				
				measure && last !== current && typeof current === 'string' && (measure.src = current);
				
			}
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$bind] = {
		
		changedFile(event) {
			
			const { $dataURL, readerListenerOption } = HTMLImageLoaderElement, reader = new FileReader();
			
			this.addListener	(
										reader,
										'loadend',
										event => reader.result && (this.src = this[$dataURL] = reader.result),
										readerListenerOption
									),
			
			reader.readAsDataURL(event.target.files[0]);
			
		},
		
		changedSrc(event) {
			
			this.src = event.target.src;
			
		},
		
		changedURL(event) {
			
			this.src = event.target.value;
			
		},
		
		slottedFetcher(event) {
			
			const { changedSrc, measure } = this;
			
			this.addListener(measure, 'changed-src', changedSrc);
			
		},
		
		switched(event) {
			
			const { fileInput, urlInput } = this;
			
			this.src = event.target.checked ? urlInput.value : this[HTMLImageLoaderElement.$dataURL];
			
		}
		
	};
	
	constructor() {
		
		super();
		
	}
	
	[HTMLCustomShadowElement.$init]() {
		
		const { changedFile, changedURL, fileInput, imageSlot, slottedFetcher, switched, switcher, urlInput } = this;
		
		this.addListener(imageSlot, 'slotchange', slottedFetcher),
		
		this.addListener(switcher, 'change', switched),
		
		this.addListener(fileInput, 'change', changedFile),
		this.addListener(urlInput, 'change', changedURL);
		
	}
	
	get fileInput() {
		
		return this.shadowRoot.getElementById('file');
		
	}
	get img() {
		
		return this.measure?.img;
		
	}
	get measure() {
		
		const { constructor: { measureAssignedNodesOption }, imageSlot } = this;
		
		return imageSlot?.assignedNodes?.(measureAssignedNodesOption)?.[0];
		
	}
	get imageSlot() {
		
		return this.shadowRoot.getElementById('image-slot');
		
	}
	get switcher() {
		
		return this.shadowRoot.getElementById('switcher');
		
	}
	get urlInput() {
		
		return this.shadowRoot.getElementById('url');
		
	}
	
}
HTMLImageLoaderElement.define();