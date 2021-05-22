import type { URL } from 'url';

export namespace StarWars {
	export const enum Resource {
		Films = 'films',
		People = 'people',
		Planets = 'planets',
		Species = 'species',
		Starships = 'starships',
		Vehicles = 'vehicles'
	}

	export const enum DetailOrSearch {
		Detail,
		Search
	}

	export interface FetchApiParameters {
		/** The resource to fetch */
		resource?: Resource;
		/** The query parameter to search */
		query?: string;
		/** Optional exact URL to fetch, for fetching detailed data */
		url?: string | URL;
		/** Whether to throw on error, useful to set to false for fetching detailed data */
		throwOnError?: boolean;
	}

	export type FetchApiReturnType<R extends Resource, DS extends DetailOrSearch = DetailOrSearch.Search, TE extends boolean = true> = Promise<
		TE extends true ? FetchApiReturnTypeWithThrow<R, DS> : FetchApiReturnTypeWithoutThrow<R, DS>
	>;

	type FetchApiReturnTypeWithThrow<R extends Resource, DS extends DetailOrSearch = DetailOrSearch.Search> = DS extends DetailOrSearch.Search
		? StarWarsApiResponse<R>
		: SmartResourceType<R> | null;

	type FetchApiReturnTypeWithoutThrow<R extends Resource, DS extends DetailOrSearch = DetailOrSearch.Search> = DS extends DetailOrSearch.Search
		? StarWarsApiResponse<R> | undefined
		: SmartResourceType<R> | null | undefined;

	export interface StarWarsApiResponse<R extends Resource> {
		/**
		 * The total amount of results returned by the search
		 */
		count: number;
		/**
		 * The url to get the next page of data, if available
		 * @remark data is paginated every 10 results
		 */
		next: string | null;
		/**
		 * The url to get the previous page of data, if available.
		 * @remark data is paginated every 10 results
		 */
		previous: string | null;
		/**
		 * The results returned for this resource
		 */
		results: Array<SmartResourceType<R>>;
	}

	export type SmartResourceType<R extends Resource> = R extends Resource.Films
		? Film
		: R extends Resource.People
		? People
		: R extends Resource.Planets
		? Planet
		: R extends Resource.Species
		? Species
		: R extends Resource.Starships
		? Starship
		: R extends Resource.Vehicles
		? Vehicles
		: never;

	export interface EmbedTitles {
		[Resource.Films]: {
			characters: string; //
			creationDate: string;
			director: string;
			episodeId: string;
			planets: string; //
			producer: string;
			releaseDate: string;
			species: string; //
			starships: string; //
			title: string;
			url: string;
			vehicles: string; //
		};
		[Resource.People]: {
			appearedInFilms: string;
			eyeColour: string;
			gender: string;
			hairColour: string;
			height: string;
			homeWorld: string;
			mass: string;
			ownedStarShips: string;
			ownedVehicles: string;
			skinColour: string;
			species: string;
			yearOfBirth: string;
		};
	}

	/**
	 * A person within the Star Wars universe
	 */
	export interface People {
		/**
		 * An array of starship resources that this person has piloted
		 */
		starships: string[];
		/**
		 * the ISO 8601 date format of the time that this resource was edited.
		 */
		edited: string;
		/**
		 * The name of this person.
		 */
		name: string;
		/**
		 * The ISO 8601 date format of the time that this resource was created.
		 */
		created: string;
		/**
		 * The url of this resource
		 */
		url: string;
		/**
		 * The gender of this person (if known).
		 */
		gender: string;
		/**
		 * An array of vehicle resources that this person has piloted
		 */
		vehicles: string[];
		/**
		 * The skin color of this person.
		 */
		skin_color: string;
		/**
		 * The hair color of this person.
		 */
		hair_color: string;
		/**
		 * The height of this person in meters.
		 */
		height: string;
		/**
		 * The eye color of this person.
		 */
		eye_color: string;
		/**
		 * The mass of this person in kilograms.
		 */
		mass: string;
		/**
		 * An array of urls of film resources that this person has been in.
		 */
		films: string[];
		/**
		 * The url of the species resource that this person is.
		 */
		species: string[];
		/**
		 * The url of the planet resource that this person was born on.
		 */
		homeworld: string;
		/**
		 * The birth year of this person. BBY (Before the Battle of Yavin) or ABY (After the Battle of Yavin).
		 */
		birth_year: string;
	}

	/**
	 * A Star Wars film
	 */
	export interface Film {
		/**
		 * The starship resources featured within this film.
		 */
		starships: string[];
		/**
		 * the ISO 8601 date format of the time that this resource was edited.
		 */
		edited: string;
		/**
		 * The planet resources featured within this film.
		 */
		planets: string[];
		/**
		 * The producer(s) of this film.
		 */
		producer: string;
		/**
		 * The title of this film.
		 */
		title: string;
		/**
		 * The url of this resource
		 */
		url: string;
		/**
		 * The release date at original creator country.
		 */
		release_date: string;
		/**
		 * The vehicle resources featured within this film.
		 */
		vehicles: string[];
		/**
		 * The episode number of this film.
		 */
		episode_id: number;
		/**
		 * The director of this film.
		 */
		director: string;
		/**
		 * The ISO 8601 date format of the time that this resource was created.
		 */
		created: string;
		/**
		 * The opening crawl text at the beginning of this film.
		 */
		opening_crawl: string;
		/**
		 * The people resources featured within this film.
		 */
		characters: string[];
		/**
		 * The species resources featured within this film.
		 */
		species: string[];
	}

	/**
	 * A Starship
	 */
	export interface Starship {
		/**
		 * The number of non-essential people this starship can transport.
		 */
		passengers: string;
		/**
		 * An array of People URL Resources that this starship has been piloted by.
		 */
		pilots: string[];
		/**
		 * The name of this starship. The common name, such as Death Star.
		 */
		name: string;
		/**
		 * The class of this starships hyperdrive.
		 */
		hyperdrive_rating: string;
		/**
		 * The hypermedia URL of this resource.
		 */
		url: string;
		/**
		 * The maximum number of kilograms that this starship can transport.
		 */
		cargo_capacity: string;
		/**
		 * the ISO 8601 date format of the time that this resource was edited.
		 */
		edited: string;
		/**
		 * The maximum length of time that this starship can provide consumables for its entire crew without having to resupply.
		 */
		consumables: string;
		/**
		 * The maximum speed of this starship in atmosphere. n/a if this starship is incapable of atmosphering flight.
		 */
		max_atmosphering_speed: string;
		/**
		 * The number of personnel needed to run or pilot this starship.
		 */
		crew: string;
		/**
		 * The length of this starship in meters.
		 */
		length: string;
		/**
		 * The Maximum number of Megalights this starship can travel in a standard hour. A Megalight is a standard unit of distance and has never been defined before within the Star Wars universe. This figure is only really useful for measuring the difference in speed of starships. We can assume it is similar to AU, the distance between our Sun (Sol) and Earth.
		 */
		MGLT: string;
		/**
		 * The class of this starship, such as Starfighter or Deep Space Mobile Battlestation.
		 */
		starship_class: string;
		/**
		 * The ISO 8601 date format of the time that this resource was created.
		 */
		created: string;
		/**
		 * An array of Film URL Resources that this starship has appeared in.
		 */
		films: string[];
		/**
		 * The model or official name of this starship. Such as T-65 X-wing or DS-1 Orbital Battle Station.
		 */
		model: string;
		/**
		 * The cost of this starship new, in galactic credits.
		 */
		cost_in_credits: string;
		/**
		 * The manufacturer of this starship. Comma seperated if more than one.
		 */
		manufacturer: string;
	}

	/**
	 * A vehicle.
	 */
	export interface Vehicles {
		/**
		 * The class of this vehicle, such as Wheeled.
		 */
		vehicle_class: string;
		/**
		 * The number of non-essential people this vehicle can transport.
		 */
		passengers: string;
		/**
		 * An array of People URL Resources that this vehicle has been piloted by.
		 */
		pilots: string[];
		/**
		 * The name of this vehicle. The common name, such as Sand Crawler.
		 */
		name: string;
		/**
		 * The ISO 8601 date format of the time that this resource was created.
		 */
		created: string;
		/**
		 * The hypermedia URL of this resource.
		 */
		url: string;
		/**
		 * The maximum number of kilograms that this vehicle can transport.
		 */
		cargo_capacity: string;
		/**
		 * the ISO 8601 date format of the time that this resource was edited.
		 */
		edited: string;
		/**
		 * The maximum length of time that this vehicle can provide consumables for its entire crew without having to resupply.
		 */
		consumables: string;
		/**
		 * The maximum speed of this vehicle in atmosphere.
		 */
		max_atmosphering_speed: string;
		/**
		 * The number of personnel needed to run or pilot this vehicle.
		 */
		crew: string;
		/**
		 * The length of this vehicle in meters.
		 */
		length: string;
		/**
		 * An array of Film URL Resources that this vehicle has appeared in.
		 */
		films: string[];
		/**
		 * The model or official name of this vehicle. Such as All Terrain Attack Transport.
		 */
		model: string;
		/**
		 * The cost of this vehicle new, in galactic credits.
		 */
		cost_in_credits: string;
		/**
		 * The manufacturer of this vehicle. Comma seperated if more than one.
		 */
		manufacturer: string;
	}

	/**
	 * A species within the Star Wars universe
	 */
	export interface Species {
		/**
		 * The ISO 8601 date format of the time that this resource was edited.
		 */
		edited: string;
		/**
		 * The name of this species.
		 */
		name: string;
		/**
		 * The classification of this species.
		 */
		classification: string;
		/**
		 * An array of People URL Resources that are a part of this species.
		 */
		people: string[];
		/**
		 * A comma-seperated string of common eye colors for this species, none if this species does not typically have eyes.
		 */
		eye_colors: string;
		/**
		 * The ISO 8601 date format of the time that this resource was created.
		 */
		created: string;
		/**
		 * The designation of this species.
		 */
		designation: string;
		/**
		 * A comma-seperated string of common skin colors for this species, none if this species does not typically have skin.
		 */
		skin_colors: string;
		/**
		 * The language commonly spoken by this species.
		 */
		language: string;
		/**
		 * The hypermedia URL of this resource.
		 */
		url: string;
		/**
		 * A comma-seperated string of common hair colors for this species, none if this species does not typically have hair.
		 */
		hair_colors: string;
		/**
		 * The URL of a planet resource, a planet that this species originates from.
		 */
		homeworld: string;
		/**
		 *  An array of Film URL Resources that this species has appeared in.
		 */
		films: string[];
		/**
		 * The average lifespan of this species in years.
		 */
		average_lifespan: string;
		/**
		 * The average height of this person in centimeters.
		 */
		average_height: string;
	}

	/**
	 * A planet.
	 */
	export interface Planet {
		/**
		 * The diameter of this planet in kilometers.
		 */
		diameter: string;
		/**
		 * The climate of this planet. Comma-seperated if diverse.
		 */
		climate: string;
		/**
		 * The percentage of the planet surface that is naturally occuring water or bodies of water.
		 */
		surface_water: string;
		/**
		 * The name of this planet.
		 */
		name: string;
		/**
		 * The ISO 8601 date format of the time that this resource was created.
		 */
		created: string;
		/**
		 * The hypermedia URL of this resource.
		 */
		url: string;
		/**
		 * The number of standard hours it takes for this planet to complete a single rotation on its axis.
		 */
		rotation_period: string;
		/**
		 * the ISO 8601 date format of the time that this resource was edited.
		 */
		edited: string;
		/**
		 * the terrain of this planet. Comma-seperated if diverse.
		 */
		terrain: string;
		/**
		 * A number denoting the gravity of this planet. Where 1 is normal.
		 */
		gravity: string;
		/**
		 * The number of standard days it takes for this planet to complete a single orbit of its local star.
		 */
		orbital_period: string;
		/**
		 * An array of Film URL Resources that this planet has appeared in.
		 */
		films: string[];
		/**
		 * An array of People URL Resources that live on this planet.
		 */
		residents: string[];
		/**
		 * The average populationof sentient beings inhabiting this planet.
		 */
		population: string;
	}
}
