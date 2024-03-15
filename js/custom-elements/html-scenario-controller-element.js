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
			
		}
		
	};
	
	static [HTMLCustomShadowElement.$init]() {
		
		const { changedEditable, changedEditableSub, editor, subTextEditor } = this;
		
		this.addListener(editor, 'changed-editable', changedEditable),
		this.addListener(subTextEditor, 'changed-editable', changedEditableSub);
		
	}
	
	constructor() {
		
		super();
		
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
	
	get editor() {
		
		return this.shadowRoot?.getElementById('editor');
		
	}
	get subTextEditor() {
		
		return this.shadowRoot?.getElementById('sub-text');
		
	}
	get title() {
		
		return this.getElementById('title')?.assignedNodes?.(HTMLScenarioControllerElement.assignedNodesOption)?.[0];
		
	}
	
}
HTMLScenarioControllerElement.define();