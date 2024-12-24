/**
 * Default ordering for processing spawning requests and prioritizing overlords
 */
export const OverlordPriority = {
	emergency: {
		// Colony-wide emergencies such as a catastrohic crash
		bootstrap: 0,
	},
	core: {
		// Functionality related to spawning more creeps
		queen: 100,
		manager: 101,
	},
	manual: {
		//Manual creep spawn
		manualSpawn:102,
		manualUpgrade:103
	},
	powerCreeps: {
		default: 150,
	},

	defense: {
		// Defense of local and remote rooms
		meleeDefense: 200,
		rangedDefense: 201,
	},

	outpostDefense: {
		outpostDefense: 250,
		guard: 251,
		reserve: 252,
	},

	scouting: {
		stationary: 290,
		randomWalker: 291,
	},

	warSpawnCutoff: 299, // Everything past this is non-critical and won't be spawned in case of emergency

	offense: {
		// Offensive operations like raids or sieges
		destroy: 300,
		healPoint: 301,
		siege: 302,
		controllerAttack: 399,
	},

	priorityOwnedRoom: {
		// Situationally prioritized in-room operations
		priorityUpgrade: 450,
		priorityTransport: 451,
		prioritySKReaper: 452,
	},

	ownedRoom: {
		// Operation of an owned room
		firstTransport: 500, // High priority to spawn the first transporter
		mine: 501,
		work: 502,
		mineralRCL8: 503,
		transport: 504, // Spawn the rest of the transporters
		mineral: 505,
	},

	/**
	 * Operation of a remote room. Allows colonies to restart one room at a time.
	 * The increment is such that 510 + 2 * (number of rooms at range 2 = 24) = 558
	 */
	remoteRoom: {
		mine: 510,
		reserve: 511,
		transport: 513,
		roomIncrement: 2,
	},

	/** Everything past this will be ignored when incubating another colony */
	incubationThreshold: 550,

	/** Spawning upgraders */
	upgrading: {
		upgrade: 506,
		additional: 560,
	},

	throttleThreshold: 599, // Everything past this may be throttled in the event of low CPU

	outpostOffense: {
		harass: 600,
		roomPoisoner: 601,
	},

	collectionUrgent: {
		// Collecting resources that are time sensitive, like decaying resources on ground
		haul: 700,
	},

	colonization: {
		// Colonizing new rooms
		claim: 850,
		pioneer: 851,
		remoteUpgrading: 860,
	},

	remoteSKRoom: {
		sourceReaper: 1000,
		mineral: 1001,
		mine: 1002,
		roomIncrement: 5,
	},

	powerMine: {
		cool: 1050,
		drill: 1051,
		roomIncrement: 2,
	},

	deposit: {
		gatherer: 1080,
	},

	tasks: {
		// Non-urgent tasks, such as collection from a deserted storage
		haul: 1100,
		dismantle: 1101,
	},

	default: 99999, // Default overlord priority to ensure it gets run last
};
