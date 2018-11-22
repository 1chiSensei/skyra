export class LanguageHelp {

	private explainedUsage: string | null = null;
	private possibleFormats: string | null = null;
	private examples: string | null = null;
	private reminder: string | null = null;

	public setExplainedUsage(text: string): this {
		this.explainedUsage = text;
		return this;
	}

	public setPossibleFormats(text: string): this {
		this.possibleFormats = text;
		return this;
	}

	public setExamples(text: string): this {
		this.examples = text;
		return this;
	}

	public setReminder(text: string): this {
		this.reminder = text;
		return this;
	}

	public display(name: string, options: LanguageHelpDisplayOptions, multiline: boolean = false): string {
		const { extendedHelp, explainedUsage = [], possibleFormats = [], examples = [], reminder } = options;
		const output = [];

		// Extended help
		if (extendedHelp)
			output.push(LanguageHelp.resolveMultilineString(extendedHelp, multiline), '');

		// Explained usage
		if (explainedUsage.length)
			output.push(this.explainedUsage, ...explainedUsage.map(([arg, desc]) => `→ **${arg}**: ${desc}`), '');

		// Possible formats
		if (possibleFormats.length)
			output.push(this.possibleFormats, ...possibleFormats.map(([type, example]) => `→ **${type}**: ${example}`), '');

		// Examples
		if (examples.length)
			output.push(this.examples, ...examples.map((example) => `→ Skyra, ${name}${example ? ` *${example}*` : ''}`), '');
		else
			output.push(this.examples, `→ Skyra, ${name}`, '');

		// Reminder
		if (reminder)
			output.push(this.reminder, LanguageHelp.resolveMultilineString(reminder, multiline));

		return output.join('\n');
	}

	public static resolveMultilineString(str: string | string[], multiline: boolean): string {
		return Array.isArray(str)
			? LanguageHelp.resolveMultilineString(str.join(multiline ? '\n' : ' '), multiline)
			: str.split('\n').map((line) => line.trim()).join(multiline ? '\n' : ' ');
	}

}

export interface LanguageHelpDisplayOptions {
	extendedHelp?: string[] | string;
	explainedUsage?: Array<[string, string]>;
	possibleFormats?: Array<[string, string]>;
	examples?: string[];
	reminder?: string[] | string;
}
