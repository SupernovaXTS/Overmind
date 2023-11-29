export const RESOURCES_ALL_EXCEPT_ENERGY = _.without(
	RESOURCES_ALL,
	RESOURCE_ENERGY
) as _ResourceConstantSansEnergy[];

export const BOOSTS_T3 = [
	RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
	RESOURCE_CATALYZED_GHODIUM_ACID,
	RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
	RESOURCE_CATALYZED_ZYNTHIUM_ACID,
	RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
	RESOURCE_CATALYZED_LEMERGIUM_ACID,
	RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
	RESOURCE_CATALYZED_KEANIUM_ACID,
	RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
	RESOURCE_CATALYZED_UTRIUM_ACID,
];
export const BOOSTS_T2 = [
	RESOURCE_GHODIUM_ALKALIDE,
	RESOURCE_GHODIUM_ACID,
	RESOURCE_ZYNTHIUM_ALKALIDE,
	RESOURCE_ZYNTHIUM_ACID,
	RESOURCE_LEMERGIUM_ALKALIDE,
	RESOURCE_LEMERGIUM_ACID,
	RESOURCE_KEANIUM_ALKALIDE,
	RESOURCE_KEANIUM_ACID,
	RESOURCE_UTRIUM_ALKALIDE,
	RESOURCE_UTRIUM_ACID,
];

export const BOOSTS_T1 = [
	RESOURCE_GHODIUM_OXIDE,
	RESOURCE_GHODIUM_HYDRIDE,
	RESOURCE_ZYNTHIUM_OXIDE,
	RESOURCE_ZYNTHIUM_HYDRIDE,
	RESOURCE_LEMERGIUM_OXIDE,
	RESOURCE_LEMERGIUM_HYDRIDE,
	RESOURCE_KEANIUM_OXIDE,
	RESOURCE_KEANIUM_HYDRIDE,
	RESOURCE_UTRIUM_OXIDE,
	RESOURCE_UTRIUM_HYDRIDE,
];

export const INTERMEDIATE_REACTANTS: ResourceConstant[] = [
	RESOURCE_HYDROXIDE,
	RESOURCE_ZYNTHIUM_KEANITE,
	RESOURCE_UTRIUM_LEMERGITE,
	// RESOURCE_GHODIUM,
];

export const BASE_RESOURCES: ResourceConstant[] = [
	RESOURCE_CATALYST,
	RESOURCE_ZYNTHIUM,
	RESOURCE_LEMERGIUM,
	RESOURCE_KEANIUM,
	RESOURCE_UTRIUM,
	RESOURCE_OXYGEN,
	RESOURCE_HYDROGEN,
];
export const _baseResourcesLookup: { [resource: string]: boolean | undefined } =
	_.zipObject(
		BASE_RESOURCES,
		_.map(BASE_RESOURCES, () => true)
	);

export const RESOURCE_IMPORTANCE = [
	RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
	RESOURCE_CATALYZED_GHODIUM_ACID,
	RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
	RESOURCE_CATALYZED_ZYNTHIUM_ACID,
	RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
	RESOURCE_CATALYZED_LEMERGIUM_ACID,
	RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
	RESOURCE_CATALYZED_KEANIUM_ACID,
	RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
	RESOURCE_CATALYZED_UTRIUM_ACID,

	RESOURCE_OPS,

	RESOURCE_GHODIUM_ALKALIDE,
	RESOURCE_GHODIUM_ACID,
	RESOURCE_ZYNTHIUM_ALKALIDE,
	RESOURCE_ZYNTHIUM_ACID,
	RESOURCE_LEMERGIUM_ALKALIDE,
	RESOURCE_LEMERGIUM_ACID,
	RESOURCE_KEANIUM_ALKALIDE,
	RESOURCE_KEANIUM_ACID,
	RESOURCE_UTRIUM_ALKALIDE,
	RESOURCE_UTRIUM_ACID,

	RESOURCE_GHODIUM_OXIDE,
	RESOURCE_GHODIUM_HYDRIDE,
	RESOURCE_ZYNTHIUM_OXIDE,
	RESOURCE_ZYNTHIUM_HYDRIDE,
	RESOURCE_LEMERGIUM_OXIDE,
	RESOURCE_LEMERGIUM_HYDRIDE,
	RESOURCE_KEANIUM_OXIDE,
	RESOURCE_KEANIUM_HYDRIDE,
	RESOURCE_UTRIUM_OXIDE,
	RESOURCE_UTRIUM_HYDRIDE,

	RESOURCE_GHODIUM,
	RESOURCE_UTRIUM_LEMERGITE,
	RESOURCE_ZYNTHIUM_KEANITE,
	RESOURCE_HYDROXIDE,

	RESOURCE_CATALYST,
	RESOURCE_ZYNTHIUM,
	RESOURCE_LEMERGIUM,
	RESOURCE_KEANIUM,
	RESOURCE_UTRIUM,
	RESOURCE_OXYGEN,
	RESOURCE_HYDROGEN,

	RESOURCE_POWER,
	RESOURCE_ENERGY,

	// All other resources are
];

export const REAGENTS: {
	[product: string]: [ResourceConstant, ResourceConstant];
} = {
	// Tier 3
	[RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: [
		RESOURCE_GHODIUM_ALKALIDE,
		RESOURCE_CATALYST,
	],
	[RESOURCE_CATALYZED_GHODIUM_ACID]: [
		RESOURCE_GHODIUM_ACID,
		RESOURCE_CATALYST,
	],
	[RESOURCE_CATALYZED_ZYNTHIUM_ACID]: [
		RESOURCE_ZYNTHIUM_ACID,
		RESOURCE_CATALYST,
	],
	[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: [
		RESOURCE_ZYNTHIUM_ALKALIDE,
		RESOURCE_CATALYST,
	],
	[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: [
		RESOURCE_LEMERGIUM_ALKALIDE,
		RESOURCE_CATALYST,
	],
	[RESOURCE_CATALYZED_LEMERGIUM_ACID]: [
		RESOURCE_LEMERGIUM_ACID,
		RESOURCE_CATALYST,
	],
	[RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: [
		RESOURCE_KEANIUM_ALKALIDE,
		RESOURCE_CATALYST,
	],
	[RESOURCE_CATALYZED_KEANIUM_ACID]: [
		RESOURCE_KEANIUM_ACID,
		RESOURCE_CATALYST,
	],
	[RESOURCE_CATALYZED_UTRIUM_ACID]: [RESOURCE_UTRIUM_ACID, RESOURCE_CATALYST],
	[RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: [
		RESOURCE_UTRIUM_ALKALIDE,
		RESOURCE_CATALYST,
	],
	// Tier 2
	[RESOURCE_GHODIUM_ACID]: [RESOURCE_GHODIUM_HYDRIDE, RESOURCE_HYDROXIDE],
	[RESOURCE_GHODIUM_ALKALIDE]: [RESOURCE_GHODIUM_OXIDE, RESOURCE_HYDROXIDE],
	[RESOURCE_ZYNTHIUM_ACID]: [RESOURCE_ZYNTHIUM_HYDRIDE, RESOURCE_HYDROXIDE],
	[RESOURCE_ZYNTHIUM_ALKALIDE]: [RESOURCE_ZYNTHIUM_OXIDE, RESOURCE_HYDROXIDE],
	[RESOURCE_LEMERGIUM_ALKALIDE]: [
		RESOURCE_LEMERGIUM_OXIDE,
		RESOURCE_HYDROXIDE,
	],
	[RESOURCE_LEMERGIUM_ACID]: [RESOURCE_LEMERGIUM_HYDRIDE, RESOURCE_HYDROXIDE],
	[RESOURCE_KEANIUM_ALKALIDE]: [RESOURCE_KEANIUM_OXIDE, RESOURCE_HYDROXIDE],
	[RESOURCE_KEANIUM_ACID]: [RESOURCE_KEANIUM_HYDRIDE, RESOURCE_HYDROXIDE],
	[RESOURCE_UTRIUM_ACID]: [RESOURCE_UTRIUM_HYDRIDE, RESOURCE_HYDROXIDE],
	[RESOURCE_UTRIUM_ALKALIDE]: [RESOURCE_UTRIUM_OXIDE, RESOURCE_HYDROXIDE],
	// Tier 1
	[RESOURCE_GHODIUM_HYDRIDE]: [RESOURCE_GHODIUM, RESOURCE_HYDROGEN],
	[RESOURCE_GHODIUM_OXIDE]: [RESOURCE_GHODIUM, RESOURCE_OXYGEN],
	[RESOURCE_ZYNTHIUM_HYDRIDE]: [RESOURCE_ZYNTHIUM, RESOURCE_HYDROGEN],
	[RESOURCE_ZYNTHIUM_OXIDE]: [RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN],
	[RESOURCE_LEMERGIUM_OXIDE]: [RESOURCE_LEMERGIUM, RESOURCE_OXYGEN],
	[RESOURCE_LEMERGIUM_HYDRIDE]: [RESOURCE_LEMERGIUM, RESOURCE_HYDROGEN],
	[RESOURCE_KEANIUM_OXIDE]: [RESOURCE_KEANIUM, RESOURCE_OXYGEN],
	[RESOURCE_KEANIUM_HYDRIDE]: [RESOURCE_KEANIUM, RESOURCE_HYDROGEN],
	[RESOURCE_UTRIUM_HYDRIDE]: [RESOURCE_UTRIUM, RESOURCE_HYDROGEN],
	[RESOURCE_UTRIUM_OXIDE]: [RESOURCE_UTRIUM, RESOURCE_OXYGEN],
	// Tier 0
	[RESOURCE_GHODIUM]: [RESOURCE_ZYNTHIUM_KEANITE, RESOURCE_UTRIUM_LEMERGITE],
	[RESOURCE_HYDROXIDE]: [RESOURCE_OXYGEN, RESOURCE_HYDROGEN],
	[RESOURCE_ZYNTHIUM_KEANITE]: [RESOURCE_ZYNTHIUM, RESOURCE_KEANIUM],
	[RESOURCE_UTRIUM_LEMERGITE]: [RESOURCE_UTRIUM, RESOURCE_LEMERGIUM],
};

export const MINERAL_COMPOUNDS_ALL = _.keys(REAGENTS).concat(BASE_RESOURCES);
export const _mineralCompoundsAllLookup: {
	[resource: string]: boolean | undefined;
} = _.zipObject(
	MINERAL_COMPOUNDS_ALL,
	_.map(MINERAL_COMPOUNDS_ALL, () => true)
);

export const BOOST_PARTS: { [boost: string]: BodyPartConstant } = {
	UH: ATTACK,
	UO: WORK,
	KH: CARRY,
	KO: RANGED_ATTACK,
	LH: WORK,
	LO: HEAL,
	ZH: WORK,
	ZO: MOVE,
	GH: WORK,
	GO: TOUGH,

	UH2O: ATTACK,
	UHO2: WORK,
	KH2O: CARRY,
	KHO2: RANGED_ATTACK,
	LH2O: WORK,
	LHO2: HEAL,
	ZH2O: WORK,
	ZHO2: MOVE,
	GH2O: WORK,
	GHO2: TOUGH,

	XUH2O: ATTACK,
	XUHO2: WORK,
	XKH2O: CARRY,
	XKHO2: RANGED_ATTACK,
	XLH2O: WORK,
	XLHO2: HEAL,
	XZH2O: WORK,
	XZHO2: MOVE,
	XGH2O: WORK,
	XGHO2: TOUGH,
};

export type BoostType =
	| "attack"
	| "carry"
	| "ranged"
	| "heal"
	| "move"
	| "tough"
	| "harvest"
	| "construct"
	| "dismantle"
	| "upgrade";

export const BoostTypeBodyparts: {
	[boostType in BoostType]: BodyPartConstant;
} = {
	attack: ATTACK,
	carry: CARRY,
	ranged: RANGED_ATTACK,
	heal: HEAL,
	move: MOVE,
	tough: TOUGH,
	harvest: WORK,
	construct: WORK,
	dismantle: WORK,
	upgrade: WORK,
};

export type BoostTier = "T1" | "T2" | "T3";

export function isBoostType(str: string): str is BoostType {
	return (
		str === "attack" ||
		str === "carry" ||
		str === "ranged" ||
		str === "heal" ||
		str === "move" ||
		str === "tough" ||
		str === "harvest" ||
		str === "construct" ||
		str === "dismantle" ||
		str === "upgrade"
	);
}

export const BOOST_TIERS: {
	[boostType in BoostType]: { [boostTier in BoostTier]: ResourceConstant };
} = {
	attack: {
		T1: "UH",
		T2: "UH2O",
		T3: "XUH2O",
	},
	carry: {
		T1: "KH",
		T2: "KH2O",
		T3: "XKH2O",
	},
	ranged: {
		T1: "KO",
		T2: "KHO2",
		T3: "XKHO2",
	},
	heal: {
		T1: "LO",
		T2: "LHO2",
		T3: "XLHO2",
	},
	move: {
		T1: "ZO",
		T2: "ZHO2",
		T3: "XZHO2",
	},
	tough: {
		T1: "GO",
		T2: "GHO2",
		T3: "XGHO2",
	},
	harvest: {
		T1: "UO",
		T2: "UHO2",
		T3: "XUHO2",
	},
	construct: {
		T1: "LH",
		T2: "LH2O",
		T3: "XLH2O",
	},
	dismantle: {
		T1: "ZH",
		T2: "ZH2O",
		T3: "XZH2O",
	},
	upgrade: {
		T1: "GH",
		T2: "GH2O",
		T3: "XGH2O",
	},
};
// This inverts the second-level values from above, so you get an object that looks like:
// { attack: { UH: T1, UH2O: T2, XUH2O: T3 }, carry: { ... } ... }
export const _boostTypesTierLookup = _.mapValues(BOOST_TIERS, (boostType) =>
	_.invert(boostType)
) as {
	[boostType in BoostType]: { [resource in ResourceConstant]: BoostTier };
};

// This inverts the second-level values from above, so you get an object that looks like:
// { attack: { UH: T1, UH2O: T2, XUH2O: T3 }, carry: { ... } ... }
export const _boostTierLookupAllTypes: {
	[resource in ResourceConstant]: BoostTier;
} = _.extend({}, ..._.values(_boostTypesTierLookup));

export const COMMODITIES_ALL: ResourceConstant[] = [
	// Compressed mineral compounds
	RESOURCE_UTRIUM_BAR,
	RESOURCE_LEMERGIUM_BAR,
	RESOURCE_ZYNTHIUM_BAR,
	RESOURCE_KEANIUM_BAR,
	RESOURCE_GHODIUM_MELT,
	RESOURCE_OXIDANT,
	RESOURCE_REDUCTANT,
	RESOURCE_PURIFIER,
	RESOURCE_BATTERY,
	// Higher commodities
	RESOURCE_COMPOSITE,
	RESOURCE_CRYSTAL,
	RESOURCE_LIQUID,
	// Basic regional commodities
	RESOURCE_WIRE,
	RESOURCE_CELL,
	RESOURCE_ALLOY,
	RESOURCE_CONDENSATE,
	// Mechanical chain
	RESOURCE_TUBE,
	RESOURCE_FIXTURES,
	RESOURCE_FRAME,
	RESOURCE_HYDRAULICS,
	RESOURCE_MACHINE,
	// Biological chain
	RESOURCE_PHLEGM,
	RESOURCE_TISSUE,
	RESOURCE_MUSCLE,
	RESOURCE_ORGANOID,
	RESOURCE_ORGANISM,
	// Electronic chain
	RESOURCE_SWITCH,
	RESOURCE_TRANSISTOR,
	RESOURCE_MICROCHIP,
	RESOURCE_CIRCUIT,
	RESOURCE_DEVICE,
	// Mystical chain
	RESOURCE_CONCENTRATE,
	RESOURCE_EXTRACT,
	RESOURCE_SPIRIT,
	RESOURCE_EMANATION,
	RESOURCE_ESSENCE,
];
export const _commoditiesLookup: { [resource: string]: boolean | undefined } =
	_.zipObject(
		COMMODITIES_ALL,
		_.map(COMMODITIES_ALL, () => true)
	);

export const DEPOSITS_ALL: ResourceConstant[] = [
	RESOURCE_SILICON,
	RESOURCE_BIOMASS,
	RESOURCE_METAL,
	RESOURCE_MIST,
];

export const ALL_ZERO_ASSETS: StoreContents = _.zipObject(
	RESOURCES_ALL,
	_.map(RESOURCES_ALL, () => 0)
);
