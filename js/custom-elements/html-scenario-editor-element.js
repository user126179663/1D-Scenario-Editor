import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLScenarioEditorElement extends HTMLCustomShadowElement {
	
	static tagName = 'scenario-editor';
	
	static [HTMLCustomShadowElement.$attribute] = {
		
		editable: {
			
			observed(name, last, current) {
				
				this.editor.toggleAttribute(name, typeof current === 'string');
				
			}
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$bind] = {
		
		changedEditable(event) {
			
			const v = event.target.hasAttribute('editable');
			
			v === this.hasAttribute('editable') || this.toggleAttribute('editable', v);
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$init]() {
		
		const { changedEditable, editor } = this;
		
		this.addListener(editor, 'changed-editable', changedEditable);
		
	}
	
	constructor() {
		
		super();
		
		this.addListener(this.editor, 'changed-editable', this.changedEditable);
		
	}
	
	toJSON() {
		/*
			
			<article>
				<editable-element id="editor">
					<slot slot="label" name="label"></slot>
					<slot slot="editor" name="editor"></slot>
				</editable-element>
			</article>
			
		*/
		
		return this.editor.toJSON();
	}
	
	get editor() {
		
		return this.shadowRoot.getElementById('editor');
		
	}
	
}
HTMLScenarioEditorElement.define();