import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserLazyPaginatedMessage } from '#lib/structures';
// TODO: Remove "sw" import alias. This is just here so I can easily type it while coding.
import { GuildMessage, StarWars as sw } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { Emojis } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { toTitleCase } from '@sapphire/utilities';
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
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		for (const result of peopleData.results) {
			display.addAsyncPageEmbed(async (embed) => {
				const personHomeworld = await this.fetchApi<sw.Resource.Planets, sw.DetailOrSearch.Detail, false>({
					url: result.homeworld,
					throwOnError: false
				});
				const personSpecies: string[] = [];
				const personStarships: string[] = [];
				const personFilms: string[] = [];
				const personVehicles: string[] = [];

				for (const species of result.species) {
					const speciesData = await this.fetchApi<sw.Resource.Species, sw.DetailOrSearch.Detail, false>({
						url: species,
						throwOnError: false
					});

					if (speciesData) {
						personSpecies.push(speciesData.name);
					}
				}

				for (const starship of result.starships) {
					const starshipData = await this.fetchApi<sw.Resource.Starships, sw.DetailOrSearch.Detail, false>({
						url: starship,
						throwOnError: false
					});

					if (starshipData) {
						personStarships.push(starshipData.name);
					}
				}

				for (const vehicle of result.vehicles) {
					const vehicleData = await this.fetchApi<sw.Resource.Vehicles, sw.DetailOrSearch.Detail, false>({
						url: vehicle,
						throwOnError: false
					});

					if (vehicleData) {
						personVehicles.push(vehicleData.name);
					}
				}

				for (const film of result.films) {
					const filmData = await this.fetchApi<sw.Resource.Films, sw.DetailOrSearch.Detail, false>({
						url: film,
						throwOnError: false
					});

					if (filmData) {
						personFilms.push(filmData.title);
					}
				}
				const description = [
					`**${peopleTitles.height}**: ${result.height}`,
					`**${peopleTitles.mass}**: ${result.mass}`,
					`**${peopleTitles.gender}**: ${this.parseGenderString(result.gender)}`,
					`**${peopleTitles.skinColour}**: ${toTitleCase(result.skin_color)}`,
					`**${peopleTitles.eyeColour}**: ${toTitleCase(result.eye_color)}`,
					`**${peopleTitles.yearOfBirth}**: ${result.birth_year}`,
					`**${peopleTitles.hairColour}**: ${t(LanguageKeys.Globals.AndListValue, {
						value: result.hair_color.split(', ').map(toTitleCase)
					})}`,
					personHomeworld ? `**${peopleTitles.homeWorld}**: ${personHomeworld.name}` : undefined,
					personSpecies.length
						? `**${peopleTitles.species}**: ${t(LanguageKeys.Globals.AndListValue, { value: personSpecies })}`
						: undefined,
					personStarships.length
						? `**${peopleTitles.ownedStarShips}**: ${t(LanguageKeys.Globals.AndListValue, { value: personStarships })}`
						: undefined,
					personVehicles.length
						? `**${peopleTitles.ownedVehicles}**: ${t(LanguageKeys.Globals.AndListValue, { value: personVehicles })}`
						: undefined,
					personFilms.length
						? `**${peopleTitles.appearedInFilms}**: ${t(LanguageKeys.Globals.AndListValue, { value: personFilms })}`
						: undefined
				]
					.filter(Boolean)
					.join('\n');

				return embed
					.setTitle(result.name) //
					.setDescription(description);
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

	private parseGenderString(gender: 'male' | 'female' | string) {
		switch (gender) {
			case 'male':
				return Emojis.MaleSignEmoji;
			case 'female':
				return Emojis.FemaleSignEmoji;
			default:
				return gender;
		}
	}

	private async fetchApi<R extends sw.Resource, D extends sw.DetailOrSearch = sw.DetailOrSearch.Search, E extends boolean = true>({
		resource,
		query,
		url,
		throwOnError = true
	}: sw.FetchApiParameters): sw.FetchApiReturnType<R, D, E> {
		try {
			url ??= new URL(`${BaseUrl}/${resource}`);

			if (url instanceof URL) {
				url.searchParams.append('search', query!);
			}

			return await fetch(url, FetchResultTypes.JSON);
		} catch {
			if (throwOnError) {
				this.error(LanguageKeys.Commands.Tools.StarWarsNoResult, { query });
			}

			return undefined as unknown as sw.FetchApiReturnType<R, D, E>;
		}
	}
}
