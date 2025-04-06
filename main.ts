import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface TextWrapSettings {
	quickTagOne: string;
	quickTagTwo: string;
	quickTagThree: string;
}

const DEFAULT_SETTINGS: TextWrapSettings = {
	quickTagOne: "",
	quickTagTwo: "",
	quickTagThree: ""
}

export default class TextWrap extends Plugin {
	settings: TextWrapSettings;

	async onload() {
		await this.loadSettings();

		// Main command with modal input
		this.addCommand({
			id: 'wrap-text',
			name: 'Enter new tags',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				new TextWrapModal(this.app, selection, (tag, text) => {
					this.wrapText(editor, tag, text);
				}).open();
			},
		});

		// Quick Tag One command
		this.addCommand({
			id: 'quick-tag-one',
			name: 'Quick Tag One',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				this.wrapText(editor, this.settings.quickTagOne, selection);
			},
		});

		// Quick Tag Two command
		this.addCommand({
			id: 'quick-tag-two',
			name: 'Quick Tag Two',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				this.wrapText(editor, this.settings.quickTagTwo, selection);
			},
		});

		// Quick Tag Three command
		this.addCommand({
			id: 'quick-tag-three',
			name: 'Quick Tag Three',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				this.wrapText(editor, this.settings.quickTagThree, selection);
			},
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Parse tag string into tag name and attributes
	private parseTag(tagString: string): { tagName: string; attributes: string } {
		const match = tagString.match(/^(\w+)(.*)/);
		if (match) {
			return {
				tagName: match[1],
				attributes: match[2].trim()
			};
		}
		return {
			tagName: tagString,
			attributes: ''
		};
	}

	// Wrap text with parsed tag, ensuring attributes are only in the opening tag
	private wrapText(editor: Editor, tagString: string, text: string) {
		const { tagName, attributes } = this.parseTag(tagString);
		const openingTag = attributes ? `<${tagName} ${attributes}>` : `<${tagName}>`;
		const closingTag = `</${tagName}>`;
		editor.replaceSelection(`${openingTag}${text}${closingTag}`);
	}
}

class TextWrapModal extends Modal {
	modalTag: string;
	modalText: string;
	tagAndText: (modalTag: string, modalText: string) => void;

	constructor(
		app: App,
		defaultText: string,
		tagAndText: (modalTag: string, modalText: string) => void
	) {
		super(app);
		this.modalText = defaultText;
		this.tagAndText = tagAndText;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h3", { text: "Enter tags" });

		new Setting(contentEl)
			.setName("Press submit button to send tags")
			.addText((text) =>
				text.onChange((value) => {
					this.modalTag = value;
				})
			);

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(() => {
						this.tagAndText(this.modalTag, this.modalText);
						this.close();
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SettingTab extends PluginSettingTab {
	plugin: TextWrap;

	constructor(app: App, plugin: TextWrap) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Customize Quick Tags' });
		containerEl.createEl('p', { text: 'Tags will be applied to selected text as: <tagName attributes>selectedText</tagName>' });

		new Setting(containerEl)
			.setName('Quick Tag One')
			.setDesc('Customize')
			.addText(text => text
				.setValue(this.plugin.settings.quickTagOne)
				.onChange(async (value) => {
					this.plugin.settings.quickTagOne = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Quick Tag Two')
			.setDesc('Customize')
			.addText(text => text
				.setValue(this.plugin.settings.quickTagTwo)
				.onChange(async (value) => {
					this.plugin.settings.quickTagTwo = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Quick Tag Three')
			.setDesc('Customize')
			.addText(text => text
				.setValue(this.plugin.settings.quickTagThree)
				.onChange(async (value) => {
					this.plugin.settings.quickTagThree = value;
					await this.plugin.saveSettings();
				}));
	}
}
