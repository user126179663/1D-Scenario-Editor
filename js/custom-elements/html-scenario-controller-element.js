import HTMLCustomShadowElement from './html-custom-element.js';

export default class HTMLScenarioControllerElement extends HTMLCustomShadowElement {
	
	static assignedNodesOption = { flatten: true };
	static tagName = 'scenario-controller';
	
	static [HTMLCustomShadowElement.$attribute] = {
		
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
	
	static [HTMLCustomShadowElement.$bind] = {
		
		changedEditable(event) {
			
			this.syncEditorEditable(event.target);
			
		},
		
		changedEditableSub(event) {
			
			this.syncEditorEditable(event.target, 'editable-sub');
			
		},
		
		interactedAddAfterButton(event) {
			
			hi(event);
			
		},
		
		interactedAddBeforeButton(event) {
			
			hi(event);
			
		},
		
		interactedCreateSingleLineButton(event) {
			
			this.add({ isLine: true });
			
		},
		
		interactedCreateParagraphButton(event) {
			
			this.add(null);
			
		},
		
		nodeSlotted(event) {
			
			const { detail: slottedNodes } = event, { length } = slottedNodes;
			let i, node;
			
			i = -1;
			while (++i < length) {
				
				switch ((node = slottedNodes[i]).id) {
					
					case 'add-after':
					this.addListener(node, 'click', this.interactedAddAfterButton);
					break;
					
					case 'add-before':
					this.addListener(node, 'click', this.interactedAddBeforeButton);
					break;
					
				}
				
			}
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$init]() {
		
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
	
	add(...values) {
		
		const { paragraphs } = this, { length } = values;
		let i,v, editor, node;
		
		i = -1;
		while (++i < length) {
			
			if ((v = values[i])?.tagName !== 'EDITABLE-ELEMENT') {
				
				if (!(v instanceof HTMLElement)) {
					
					typeof v === 'string' && (v = { value: v }),
					(v && typeof v === 'object') || (v = {});
					
					const { isLine, value } = v;
					
					(editor = document.createElement(isLine ? 'input' : 'textarea')).value = value ?? '';
					
				}
				
				(editor ||= v).slot = 'editor',
				(v = document.createElement('editable-element')).appendChild(editor),
				editor = undefined;
				
			}
			
			(node = values[i] = document.createElement('node-element')).appendChild(v).slot = 'node',
			node.appendChild(document.getElementById('scenario-controller-wrapper-parts').content.cloneNode(true));
			
		}
		
		paragraphs.append(...values);
		
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