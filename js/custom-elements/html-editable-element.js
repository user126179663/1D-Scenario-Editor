import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLEditableElement extends HTMLCustomShadowElement {
	
	static editorAssignNodesOption = { flatten: true };
	static moInit = { attributes: true, attributeFilter: [ 'contenteditable', 'readonly' ] };
	static tagName = 'editable-element';
	
	static [HTMLCustomShadowElement.$attribute] = {
		
		editable: {
			
			get(v) {
				
				return this.hasAttribute('editable');
				
			},
			
			observed(name, last, current) {
				
				this.updateEditable(),
				
				last === current ||
					this.dispatchEvent(new CustomEvent('changed-editable', { detail: typeof current === 'string' }));
				
			},
			
			set(v) {
				
				this.toggleAttribute('editable', !!v);
				
			}
			
		}
		
	};
	static [HTMLCustomShadowElement.$bind] = {
		
		blurred() {
			
			this.isForm() ||	(
										this.updateEditable(false),
										this.dispatchEvent(new CustomEvent('changed-editable', { detail: false }))
									);
			
		},
		
		changedSlot(event) {
			
			const { target } = event, editor = target.assignedNodes()[0];
			
			if (editor) {
				
				const { blurred, constructor: { moInit }, editor, mutated, observedEditor } = this;
				
				(this.observer = new MutationObserver(observedEditor)).observe(editor, moInit),
				
				this.addListener(editor, 'input', mutated),
				this.addListener(editor, 'blur', blurred),
				
				this.updateEditable(),
				
				this.dispatchEvent(new CustomEvent('changed-editable', { detail: this.hasAttribute('editable') }));
				
			}
			
		},
		
		mutated(event) {
			
			this.dispatchEvent(new CustomEvent('mutated', { bubbles: true, composed: true, detail: event }));
			
		},
		
		switched() {
			
			const { switcher: { checked } } = this;
			
			this.toggleAttribute('editable', checked);
			
		},
		
		observedEditor(mrs) {
			
			const length = mrs.length;
			let i, mr, attr;
			
			i = -1;
			while (++i < length) {
				
				switch (attr = (mr = mrs[i]).attributeName) {
					
					case 'contenteditable':
					this.toggleAttribute('editable', this.switcher.checked = mr.target.hasAttribute(attr));
					break;
					
					case 'readonly':
					this.toggleAttribute('editable', this.switcher.checked = !mr.target.hasAttribute(attr));
					break;
					
				}
				
			}
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$init]() {
		
		const { changedSlot, editor, editorSlot, switched, switcher } = this;
		
		this.addListener(switcher, 'change', switched),
		this.addListener(editorSlot, 'slotchange', changedSlot),
		
		editor && editorSlot.dispatchEvent(new Event('slotchange'));
		
	}
	
	constructor() {
		
		super();
		
	}
	
	isForm() {
		
		const { editor } = this;
		
		return editor instanceof HTMLInputElement || editor instanceof HTMLTextAreaElement;
		
	}
	
	updateEditable(value = this.hasAttribute('editable')) {
		
		const { beforeInput, editor, switcher } = this;
		
		this.addListener(editor, 'input', beforeInput),
		
		editor.toggleAttribute('contenteditable', switcher.checked = value),
		editor.toggleAttribute('readonly', !value),
		
		value && editor.focus();
		
	}
	
	toJSON() {
		
		/*
			<div id="root">
				
				<input id="switch" type="checkbox" hidden>
				
				<div id="ctrl">
					<div id="switcher">
						<label for="switch"></label>
					</div>
				</div>
				
				<div id="edit-node">
					<label for="edit"><slot name="label"></slot></label>
					<slot id="editor" name="editor"></slot>
				</div>
				
			</div>
		*/
		
		const { asHTML, editor, label } = this;
		
		return	{
						content: this.isForm() ? editor.value ?? '' : editor[asHTML ? 'innerHTML' : 'textContent'],
						editing: this.hasAttribute('editing'),
						label: label.outerHTML
					};
		
	}
	
	get asHTML() {
		
		return this.hasAttribute('ashtml');
		
	}
	set asHTML(v) {
		
		return this.toggleAttribute('ashtml', !!v);
		
	}
	get editor() {
		
		const { constructor: { editorAssignNodesOption }, editorSlot } = this;
		
		return editorSlot?.assignedNodes?.(editorAssignNodesOption)?.[0];
		
	}
	get editorSlot() {
		
		return this.shadowRoot.getElementById('editor');
		
	}
	get label() {
		
		const { constructor: { editorAssignNodesOption }, shadowRoot } = this;
		
		return shadowRoot.getElementById('editor-label')?.assignedNodes?.(editorAssignNodesOption)?.[0];
		
	}
	get switcher() {
		
		return this.shadowRoot.getElementById('switch');
		
	}
	
}
HTMLEditableElement.define();