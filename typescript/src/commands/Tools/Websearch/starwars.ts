import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserLazyPaginatedMessage } from '#lib/structures';
// TODO: Remove "sw" import alias. This is just here so I can easily type it while coding.
import { GuildMessage, StarWars as sw } from '#lib/types';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { MessageEmbed } from 'discord.js';
import { URL } from 'url';

const BaseUrl = 'https://swapi.dev/api';

@ApplyOptions<PaginatedMessageCommand.Options>({
	cooldown: 10,
	aliases: ['swapi', 'star-wars', 'sw'],
	description: LanguageKeys.Commands.Tools.StarWarsDescription,
	extendedHelp: LanguageKeys.Commands.Tools.StarWarsExtended,
	subCommands: [
		sw.Resource.Films,
		{ input: sw.Resource.People, default: true },
		sw.Resource.Planets,
		sw.Resource.Species,
		sw.Resource.Starships,
		sw.Resource.Vehicles,
		sw.Resource.Vehicles
	]
})
export class UserCommand extends PaginatedMessageCommand {
	public async [sw.Resource.People](message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, t)]);

		const peopleData = await this.fetchApi<sw.Resource.People>({ resource: sw.Resource.People, query });

		if (peopleData.count === 0) return this.error(LanguageKeys.Commands.Tools.StarWarsNoResult, { query });

		const { people: peopleTitles } = t(LanguageKeys.Commands.Tools.StarWarsEmbedTitles);
		const display = new UserLazyPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.context.db.fetchColor(message))
				.setFooter(' - © swapi.dev')
		});

		for (const result of peopleData.results) {
			display.addAsyncPageEmbed(async (embed) => {
				const personHomeworld = await this.fetchApi<sw.Resource.Planets, sw.DetailOrSearch.Detail>({ url: result.homeworld });
				const personSpecies: string[] = [];

				for (const species of result.species) {
					const speciesData = await this.fetchApi<sw.Resource.Species, sw.DetailOrSearch.Detail>({ url: species });

					if (speciesData) {
						personSpecies.push(speciesData.name);
					}
				}

				embed
					.setTitle(result.name)
					.addField(peopleTitles.mass, result.mass)
					.addField(peopleTitles.skinColour, result.skin_color)
					.addField(peopleTitles.height, result.height)
					.addField(peopleTitles.yearOfBirth, result.birth_year)
					.addField(peopleTitles.eyeColour, result.eye_color)
					.addField(peopleTitles.gender, result.gender)
					.addField(peopleTitles.hairColour, t(LanguageKeys.Globals.AndListValue, { value: result.hair_color.split(', ') }));

				if (personHomeworld) {
					embed.addField(peopleTitles.homeWorld, personHomeworld.name);
				}

				if (personSpecies.length) {
					embed.addField(peopleTitles.species, t(LanguageKeys.Globals.AndListValue, { value: personSpecies }));
				}

				return embed;
			});
		}

		await display.start(loadingMessage as GuildMessage, message.author);
		return loadingMessage;
	}

	// public async [sw.Resource.Films](message: GuildMessage, args: PaginatedMessageCommand.Args) {
	// 	const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, args.t)]);

	// 	const {} = await this.searchApi<sw.Resource.Films>(sw.Resource.Films, query);
	// }

	// public async [sw.Resource.Starships](message: GuildMessage, args: PaginatedMessageCommand.Args) {
	// 	const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, args.t)]);
	// }

	// public async [sw.Resource.Vehicles](message: GuildMessage, args: PaginatedMessageCommand.Args) {
	// 	const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, args.t)]);
	// }

	// public async [sw.Resource.Species](message: GuildMessage, args: PaginatedMessageCommand.Args) {
	// 	const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, args.t)]);
	// }

	// public async [sw.Resource.Planets](message: GuildMessage, args: PaginatedMessageCommand.Args) {
	// 	const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, args.t)]);
	// }

	private async fetchApi<R extends sw.Resource, U extends sw.DetailOrSearch = sw.DetailOrSearch.Search>({
		resource,
		query,
		url
	}: sw.FetchApiParameters): Promise<U extends sw.DetailOrSearch.Search ? sw.StarWarsApiResponse<R> : sw.SmartResourceType<R> | null> {
		try {
			url ??= new URL(`${BaseUrl}/${resource}`);

			if (url instanceof URL) {
				url.searchParams.append('search', query!);
			}

			return await fetch(url, FetchResultTypes.JSON);
		} catch {
			this.error(LanguageKeys.Commands.Tools.StarWarsNoResult, { query });
		}
	}
}
