import HTMLShadowListenerElement from './html-shadow-listener-element.js';

export default class HTMLScenarioControllerElement extends HTMLShadowListenerElement {
	
	static assignedNodesOption = { flatten: true };
	static tagName = 'scenario-controller';
	
	static [HTMLShadowListenerElement.$attribute] = {
		
		editable: {
			
			observed(name, last, current) {
				
				this.editor.toggleAttribute(name, typeof current === 'string');
				
			}
			
		},
		
		['editable-sub']: {
			
			observed(name, last, current) {
				
				this.subTextEditor.toggleAttribute('editable', typeof current === 'string');
				
			}
			
		}
		
	};
	
	static [HTMLShadowListenerElement.$bind] = {
		
		changedEditable(event) {
			
			this.syncEditorEditable(event.target);
			
		},
		
		changedEditableSub(event) {
			
			this.syncEditorEditable(event.target, 'editable-sub');
			
		},
		
		interactedAddAfterButton(event) {
			
			this.insertEditorsAfter(event.composedPath()[0].assignedSlot.getRootNode().host, null);
			
		},
		
		interactedAddBeforeButton(event) {
			
			this.insertEditorsBefore(event.composedPath()[0].assignedSlot.getRootNode().host, null);
			
		},
		
		interactedCreateSingleLineButton(event) {
			
			this.add({ isLine: true });
			
		},
		
		interactedCreateParagraphButton(event) {
			
			this.add(null);
			
		}
		
	};
	
	static [HTMLShadowListenerElement.$event] = {
		
		'node-slotted': {
			
			targets: true,
			
			handlers(event) {
				
				const	{ detail: { isDischarged, target } } = event,
						method = isDischarged ? 'remove' : 'add' + 'Listener';
				
				switch (target.id) {
					
					case 'add-after':
					this[method](target, 'click', this.interactedAddAfterButton);
					break;
					
					case 'add-before':
					this[method](target, 'click', this.interactedAddBeforeButton);
					break;
					
				}
				
			}
			
		}
		
	};
	
	static [HTMLShadowListenerElement.$init]() {
		
		const	{
					changedEditable,
					changedEditableSub,
					createSingleLineButton,
					createParagraphButton,
					editor,
					interactedCreateSingleLineButton,
					interactedCreateParagraphButton,
					nodeSlotted,
					shadowRoot,
					subTextEditor
				} = this;
		
		this.addListener(createSingleLineButton, 'click', interactedCreateSingleLineButton),
		this.addListener(createParagraphButton, 'click', interactedCreateParagraphButton),
		
		this.addListener(editor, 'changed-editable', changedEditable),
		this.addListener(subTextEditor, 'changed-editable', changedEditableSub),
		
		this.addListener(shadowRoot, 'node-slotted', nodeSlotted);
		
	}
	
	constructor() {
		
		super();
		
	}
	
	createEditor(value) {
		
		if (!(value instanceof Element)) {
			
			const	{ isLine, value: v } =
						(typeof value === 'string' ? (value = { value }) : value) && typeof value === 'object' ? value : {};
			
			(value = document.createElement(isLine ? 'input' : 'textarea')).value = v ?? '';
			
		} else if (value.tagName === 'EDITABLE-ELEMENT') return value;
		
		const	editor = document.createElement('editable-element'),
				node = document.createElement('node-element');
		
		value.slot = 'editor',
		editor.slot = 'node',
		editor.appendChild(value),
		node.appendChild(editor),
		node.appendChild(document.getElementById('scenario-controller-wrapper-parts').content.cloneNode(true));
		
		return node;
		
	}
	//coco add,insertEditorsAfter,insertEditorsBefore を整理
	add(...values) {
		
		const { paragraphs } = this, { length } = values;
		let i;
		
		i = -1;
		while (++i < length) values[i] = this.createEditor(values[i]);
		
		paragraphs.append(...values);
		
	}
	
	insertEditorsAfter(referenceNode, ...values) {
		
		if (this.paragraphs === referenceNode.parentElement) {
			
			const { length } = values;
			let i;
			
			i = -1;
			while (++i < length) values[i] = this.createEditor(values[i]);
			
			referenceNode.after(...values);
			
		}
		
	}
	
	insertEditorsBefore(referenceNode, ...values) {
		
		if (this.paragraphs === referenceNode.parentElement) {
			
			const { length } = values;
			let i;
			
			i = -1;
			while (++i < length) values[i] = this.createEditor(values[i]);
			
			referenceNode.before(...values);
			
		}
		
	}
	
	syncEditorEditable(target, propName = 'editing') {
		
		const v = target.hasAttribute('editable');
		
		v === this.hasAttribute(propName) || this.toggleAttribute(propName, v);
		
	}
	
	toJSON() {
		/*<template id="scenario-controller">
			
			<link rel="stylesheet" href="css/html-scenario-contoller-element.css">
			
			<section id="root">
				
				<header>
					<div><slot name="title"></slot></div>
				</header>
				
				<editable-element id="sub-text">
					<slot name="sub-text" slot="editor"></slot>
				</editable-element>
				
				<scenario-editor id="editor">
					<textarea id="edit" slot="editor"></textarea>
				</scenario-editor>
				
				<footer></footer>
				
			</section>
			
		</template>*/
		
		const { editor, subTextEditor, title } = this;
		
		return { title: title.outerHTML, text: editor.toJSON(), subText: subTextEditor.toJSON() };
		
	}
	
	get createSingleLineButton() {
		
		return this.shadowRoot?.getElementById('create-single-line');
		
	}
	get createParagraphButton() {
		
		return this.shadowRoot?.getElementById('create-paragraph');
		
	}
	get editor() {
		
		return this.shadowRoot?.getElementById('editor');
		
	}
	get paragraphs() {
		
		return this.shadowRoot?.getElementById('paragraphs');
		
	}
	get subTextEditor() {
		
		return this.shadowRoot?.getElementById('sub-text');
		
	}
	get titleNode() {
		
		return this.getElementById('title')?.assignedNodes?.(HTMLScenarioControllerElement.assignedNodesOption)?.[0];
		
	}
	get text() {
		
		return this.editor.content;
		
	}
	set text(v) {
		
		this.editor.content = v;
		
	}
	get subText() {
		
		return this.subTextEditor.value;
		
	}
	set subText(v) {
		
		this.subTextEditor.value = v;
		
	}
	
}
HTMLScenarioControllerElement.define();