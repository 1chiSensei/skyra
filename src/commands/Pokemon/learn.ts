import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { LearnMethodTypesReturn } from '#lib/i18n/languageKeys/keys/commands/Pokemon';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import { fetchGraphQLPokemon, getFuzzyLearnset, GetPokemonSpriteParameters, getSpriteKey, resolveColour } from '#utils/APIs/Pokemon';
import { CdnUrls } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import type { Learnset, LearnsetLevelUpMove } from '@favware/graphql-pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const kPokemonGenerations = new Set([1, 2, 3, 4, 5, 6, 7, 8]);

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['learnset', 'learnall'],
	description: LanguageKeys.Commands.Pokemon.LearnDescription,
	detailedDescription: LanguageKeys.Commands.Pokemon.LearnExtended,
	flags: ['shiny', 'back']
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: Message, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const response = await sendLoadingMessage(message, t);

		const generation = await args.pick(UserPaginatedMessageCommand.generation).catch(() => 8);
		const pokemon = await args.pick('string');
		const backSprite = args.getFlags('back');
		const shinySprite = args.getFlags('shiny');

		const movesList = args.nextSplit();
		const learnsetData = await this.fetchAPI(pokemon, movesList, generation, { backSprite, shinySprite });

		await this.buildDisplay(learnsetData, generation, movesList, t, { backSprite, shinySprite }).run(response, message.author);
		return response;
	}

	private async fetchAPI(pokemon: string, moves: string[], generation: number, getSpriteParams: GetPokemonSpriteParameters) {
		try {
			const { data } = await fetchGraphQLPokemon<'getFuzzyLearnset'>(getFuzzyLearnset(getSpriteParams), {
				pokemon,
				moves,
				generation
			});

			return data.getFuzzyLearnset;
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.LearnQueryFailed, {
				pokemon,
				moves
			});
		}
	}

	private parseMove(t: TFunction, pokemon: string, generation: number, move: string, method: string) {
		return t(LanguageKeys.Commands.Pokemon.LearnMethod, { generation, pokemon, move, method });
	}

	private buildDisplay(learnsetData: Learnset, generation: number, moves: string[], t: TFunction, getSpriteParams: GetPokemonSpriteParameters) {
		const spriteToGet = getSpriteKey(getSpriteParams);
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(learnsetData.color))
				.setAuthor(`#${learnsetData.num} - ${toTitleCase(learnsetData.species)}`, CdnUrls.Pokedex)
				.setTitle(t(LanguageKeys.Commands.Pokemon.LearnTitle, { pokemon: learnsetData.species, generation }))
				.setThumbnail(learnsetData[spriteToGet])
		});

		const learnableMethods = Object.entries(learnsetData).filter(
			([key, value]) => key.endsWith('Moves') && (value as LearnsetLevelUpMove[]).length
		) as [keyof LearnMethodTypesReturn, LearnsetLevelUpMove[]][];

		display.setSelectMenuOptions((pageIndex) => ({
			label: learnableMethods.map(([method]) => toTitleCase(method.slice(0, method.length - 5)))[pageIndex - 1]
		}));

		if (learnableMethods.length === 0) {
			return display.addPageEmbed((embed) =>
				embed.setDescription(
					t(LanguageKeys.Commands.Pokemon.LearnCannotLearn, {
						pokemon: learnsetData.species,
						moves
					})
				)
			);
		}

		for (const [methodName, methodData] of learnableMethods) {
			const methods = methodData.map((move) => {
				const methodTypes = t(LanguageKeys.Commands.Pokemon.LearnMethodTypes, { level: move.level });
				return this.parseMove(t, learnsetData.species, move.generation!, move.name!, methodTypes[methodName]);
			});

			display.addPageEmbed((embed) => embed.setDescription(methods.join('\n')));
		}

		return display;
	}

	private static generation = Args.make<number>((parameter, { argument }) => {
		const numberParameter = Number(parameter);
		if (numberParameter && kPokemonGenerations.has(numberParameter)) return Args.ok(numberParameter);
		return Args.error({
			parameter,
			argument,
			identifier: LanguageKeys.Commands.Pokemon.LearnInvalidGeneration,
			context: { generation: parameter }
		});
	});
}
