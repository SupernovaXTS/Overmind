import { ReservingOverlord } from "overlords/colonization/reserver";
import { Colony, ColonyMemory, getAllColonies, isColony } from "../Colony";
import { Directive } from "../directives/Directive";
import {
	PortalInfo,
	ROOMINTEL_DEFAULT_VISUALS_RANGE,
	RoomIntel,
} from "../intel/RoomIntel";
import { Overlord } from "../overlords/Overlord";
import { ExpansionEvaluator } from "../strategy/ExpansionEvaluator";
import { Cartographer } from "../utilities/Cartographer";
import { EmpireAnalysis } from "../utilities/EmpireAnalysis";
import { alignedNewline, bullet } from "../utilities/stringConstants";
import { color, dump, maxBy, toColumns } from "../utilities/utils";
import { asciiLogoRL, asciiLogoSmall } from "../visuals/logos";
import { log } from "./log";
import { DirectiveOutpost } from "directives/colony/outpost";
import { TaskSignController } from "tasks/instances/signController";
import columnify from "columnify";
import { Zerg } from "zerg/Zerg";
import { RESOURCE_IMPORTANCE } from "resources/map_resources";
import { config } from "config";

type RecursiveObject = { [key: string]: number | RecursiveObject };

interface MemoryDebug {
	debug?: boolean;
}

interface ConsoleCommand {
	name: string;
	description: string;
	command: (...args: any[]) => any;
}

type ResourceTallyState = "!" | "-" | "~" | "+";
type ResourceTally = {
	resource: ResourceConstant;
	total: number;
	[colonyThreshold: `S-${string}`]: ResourceTallyState;
	[colonyTotal: `T-${string}`]: number;
};

/**
 * OvermindConsole registers a number of global methods for direct use in the Screeps console
 */
export class OvermindConsole {
	static commands: ConsoleCommand[] = [
		{
			name: "help",
			description: "show this message",
			command: () => OvermindConsole.help(),
		},
		{
			name: "info()",
			description: "display version and operation information",
			command: () => OvermindConsole.info(),
		},
		{
			name: "notifications()",
			description:
				"print a list of notifications with hyperlinks to the console",
			command: () => OvermindConsole.notifications(),
		},
		{
			name: "setMode(mode)",
			description:
				'set the operational mode to "manual", "semiautomatic", or "automatic"',
			command: OvermindConsole.setMode.bind(OvermindConsole),
		},
		{
			name: "setSignature(newSignature)",
			description:
				"set your controller signature; no argument sets to default",
			command: OvermindConsole.setSignature.bind(OvermindConsole),
		},
		{
			name: "print(...args[])",
			description: "log stringified objects to the console",
			command: OvermindConsole.print.bind(OvermindConsole),
		},
		{
			name: "debug(thing | ...things)",
			description: "enable debug logging for a game object or process",
			command: OvermindConsole.debug.bind(OvermindConsole),
		},
		{
			name: "stopDebug(thing | ...things)",
			description: "disable debug logging for a game object or process",
			command: OvermindConsole.debug.bind(OvermindConsole),
		},
		{
			name: "timeit(function, repeat=1)",
			description: "time the execution of a snippet of code",
			command: OvermindConsole.timeit.bind(OvermindConsole),
		},
		{
			name: "profileOverlord(overlord, ticks?)",
			description: "start profiling on an overlord instance or name",
			command: OvermindConsole.profileOverlord.bind(OvermindConsole),
		},
		{
			name: "finishProfilingOverlord(overlord)",
			description: "stop profiling on an overlord",
			command:
				OvermindConsole.finishProfilingOverlord.bind(OvermindConsole),
		},
		{
			name: "setLogLevel(int)",
			description: "set the logging level from 0 - 4",
			command: log.setLogLevel.bind(OvermindConsole),
		},
		{
			name: "suspendColony(roomName)",
			description: "suspend operations within a colony",
			command: OvermindConsole.suspendColony.bind(OvermindConsole),
		},
		{
			name: "unsuspendColony(roomName)",
			description: "resume operations within a suspended colony",
			command: OvermindConsole.unsuspendColony.bind(OvermindConsole),
		},
		{
			name: "listSuspendedColonies()",
			description: "Prints all suspended colonies",
			command:
				OvermindConsole.listSuspendedColonies.bind(OvermindConsole),
		},
		{
			name: "openRoomPlanner(roomName)",
			description: "open the room planner for a room",
			command: OvermindConsole.openRoomPlanner.bind(OvermindConsole),
		},
		{
			name: "closeRoomPlanner(roomName)",
			description: "close the room planner and save changes",
			command: OvermindConsole.closeRoomPlanner.bind(OvermindConsole),
		},
		{
			name: "cancelRoomPlanner(roomName)",
			description: "close the room planner and discard changes",
			command: OvermindConsole.cancelRoomPlanner.bind(OvermindConsole),
		},
		{
			name: "listActiveRoomPlanners()",
			description: "display a list of colonies with open room planners",
			command:
				OvermindConsole.listActiveRoomPlanners.bind(OvermindConsole),
		},
		{
			name: "destroyErrantStructures(roomName)",
			description:
				"destroys all misplaced structures within an owned room",
			command:
				OvermindConsole.destroyErrantStructures.bind(OvermindConsole),
		},
		{
			name: "destroyAllHostileStructures(roomName)",
			description: "destroys all hostile structures in an owned room",
			command:
				OvermindConsole.destroyAllHostileStructures.bind(
					OvermindConsole
				),
		},
		{
			name: "destroyAllBarriers(roomName)",
			description: "destroys all ramparts and barriers in a room",
			command: OvermindConsole.destroyAllBarriers.bind(OvermindConsole),
		},
		{
			name: "listConstructionSites(filter?)",
			description:
				"list all construction sites matching an optional filter",
			command:
				OvermindConsole.listConstructionSites.bind(OvermindConsole),
		},
		{
			name: "removeUnbuiltConstructionSites()",
			description: "removes all construction sites with 0 progress",
			command:
				OvermindConsole.removeUnbuiltConstructionSites.bind(
					OvermindConsole
				),
		},
		{
			name: "listDirectives(filter?)",
			description: "list directives, matching a filter if specified",
			command: OvermindConsole.listDirectives.bind(OvermindConsole),
		},
		{
			name: "listPersistentDirectives()",
			description: "print type, name, pos of every persistent directive",
			command:
				OvermindConsole.listPersistentDirectives.bind(OvermindConsole),
		},
		{
			name: "removeFlagsByColor(color, secondaryColor)",
			description: "remove flags that match the specified colors",
			command: OvermindConsole.removeFlagsByColor.bind(OvermindConsole),
		},
		{
			name: "removeErrantFlags()",
			description: "remove all flags which don't match a directive",
			command: OvermindConsole.removeErrantFlags.bind(OvermindConsole),
		},
		{
			name: "deepCleanMemory()",
			description:
				"deletes all non-critical portions of memory (be careful!)",
			command: OvermindConsole.deepCleanMemory.bind(OvermindConsole),
		},
		{
			name: "profileMemory(root=Memory, depth=1)",
			description:
				"scan through memory to get the size of various objects",
			command: OvermindConsole.profileMemory.bind(OvermindConsole),
		},
		{
			name: "startRemoteDebugSession()",
			description:
				"enables the remote debugger so Muon can debug your code",
			command:
				OvermindConsole.startRemoteDebugSession.bind(OvermindConsole),
		},
		{
			name: "cancelMarketOrders(filter?)",
			description:
				"cancels all market orders matching filter (if provided)",
			command: OvermindConsole.cancelMarketOrders.bind(OvermindConsole),
		},
		{
			name: "setRoomUpgradeRate(Colony|string, upgradeRate?)",
			description:
				"changes the rate which a room upgrades at, default is 1. Pass no rate to get the current value",
			command: OvermindConsole.setRoomUpgradeRate.bind(OvermindConsole),
		},
		{
			name: "getEmpireMineralDistribution()",
			description:
				"returns current census of colonies and mined sk room minerals",
			command:
				OvermindConsole.getEmpireMineralDistribution.bind(
					OvermindConsole
				),
		},
		{
			name: "listPortals(rangeFromColonies)",
			description: "returns active portals within colony range",
			command: OvermindConsole.listPortals.bind(OvermindConsole),
		},
		{
			name: "evaluateOutpostEfficiencies()",
			description: "prints all colony outposts efficiency",
			command:
				OvermindConsole.evaluateOutpostEfficiencies.bind(
					OvermindConsole
				),
		},
		{
			name: "evaluatePotentialOutpostEfficiencies()",
			description: "prints all nearby unmined outposts",
			command:
				OvermindConsole.evaluatePotentialOutpostEfficiencies.bind(
					OvermindConsole
				),
		},
		{
			name: "showRoomSafety(roomName?)",
			description: "show gathered safety data about rooms",
			command: OvermindConsole.showRoomSafety.bind(OvermindConsole),
		},
		{
			name: "spawnSummary(Colony | string)",
			description: "show all ongoing spawn requests",
			command: OvermindConsole.spawnSummary.bind(OvermindConsole),
		},
		{
			name: "idleCreeps(Colony | string)",
			description: "show all idle creeps",
			command: OvermindConsole.idleCreeps.bind(OvermindConsole),
		},
		{
			name: "visuals()",
			description: "enable/disable showing visuals",
			command: OvermindConsole.visuals.bind(OvermindConsole),
		},
		{
			name: "showIntelVisuals(ticks?, range?)",
			description:
				"show intel in range using visuals (ticks defaults to 100)",
			command: OvermindConsole.showIntelVisuals.bind(OvermindConsole),
		},
		{
			name: "showAssets()",
			description: "show all available resources across colonies",
			command: OvermindConsole.showAssets.bind(OvermindConsole),
		},
		{
			name: "toggleRoomActive(roomName, state?)",
			description: "activate or deactivate a given room",
			command: OvermindConsole.toggleRoomActive.bind(OvermindConsole),
		},
		{
			name: "listFactories()",
			description: "list all factories and their status",
			command: OvermindConsole.listFactories.bind(OvermindConsole),
		},
		{
			name: "resetFactories()",
			description: "reset all factories production queues",
			command: OvermindConsole.resetFactories.bind(OvermindConsole),
		},
		{
			name:"manualSpawn(room,role,number)",
			description:"manually adds spawns to hatchery queue",
			command: OvermindConsole.manualCreepSpawn.bind(OvermindConsole)
		},
	];

	static init() {
		for (const cmd of this.commands) {
			const para = cmd.name.indexOf("(");
			const funcName =
				para !== -1 ? cmd.name.substring(0, para) : cmd.name;
			// @ts-expect-error define commands on the global object
			global[funcName] = cmd.command;
		}
		this.generateHelp();
		// @ts-expect-error set this one directly so that the parsing happens once
		global.help = this.helpMsg;
	}

	// Help, information, and operational changes ======================================================================

	static helpMsg: string;

	static help() {
		if (!this.helpMsg) {
			this.generateHelp();
		}
		console.log(this.helpMsg);
	}

	static generateHelp() {
		let msg = '\n<font color="#ff00ff">';
		for (const line of asciiLogoSmall) {
			msg += line + "\n";
		}
		msg += "</font>";

		// Console list
		const descr: { [functionName: string]: string } = {};
		for (const cmd of this.commands) {
			if (!cmd.description) {
				continue;
			}
			descr[cmd.name] = cmd.description;
		}
		const descrMsg = toColumns(descr, { justify: true, padChar: "." });
		const maxLineLength = _.max(_.map(descrMsg, (line) => line.length)) + 2;
		msg +=
			"Console Commands: ".padEnd(maxLineLength, "=") +
			"\n" +
			descrMsg.join("\n");

		msg += "\n\nRefer to the repository for more information\n";

		this.helpMsg = msg;
	}

	static printUpdateMessage(aligned = false): void {
		const joinChar = aligned ? alignedNewline : "\n";
		const msg =
			`Codebase updated or global reset. Type "help" for a list of console commands.` +
			joinChar +
			color(asciiLogoSmall.join(joinChar), "#ff00ff") +
			joinChar +
			OvermindConsole.info(aligned);
		log.alert(msg);
	}

	static printTrainingMessage(): void {
		console.log("\n" + asciiLogoRL.join("\n") + "\n");
	}

	static info(aligned = false): string {
		const b = bullet;
		const checksum = Assimilator.generateChecksum();
		const clearanceCode = Assimilator.getClearanceCode(config.MY_USERNAME);
		const baseInfo = [
			`${b}Version:        Overmind v${__VERSION__}`,
			`${b}Checksum:       ${checksum}`,
			`${b}Assimilated:    ${
				clearanceCode ? "Yes" : "No"
			} (clearance code: ${clearanceCode}) [WIP]`,
			`${b}Operating mode: ${Memory.settings.operationMode}`,
		];
		const joinChar = aligned ? alignedNewline : "\n";
		return baseInfo.join(joinChar);
	}

	static notifications(): string {
		const notifications =
			Overmind.overseer.notifier.generateNotificationsList(true);
		return _.map(notifications, (msg) => bullet + msg).join("\n");
	}

	static setMode(mode: operationMode): void {
		if ("manual".startsWith(mode)) {
			Memory.settings.operationMode = "manual";
			console.log(
				`Operational mode set to manual. Only defensive directives will be placed automatically; ` +
					`remove harvesting, claiming, room planning, and raiding must be done manually.`
			);
		} else if ("semiautomatic".startsWith(mode)) {
			Memory.settings.operationMode = "semiautomatic";
			console.log(
				`Operational mode set to semiautomatic. Claiming, room planning, and raiding must be done ` +
					`manually; everything else is automatic.`
			);
		} else if ("automatic".startsWith(mode)) {
			Memory.settings.operationMode = "automatic";
			console.log(
				`Operational mode set to automatic. All actions are done automatically, but manually placed ` +
					`directives will still be responded to.`
			);
		} else {
			console.log(
				`Invalid mode: please specify 'manual', 'semiautomatic', or 'automatic'.`
			);
		}
	}

	static setSignature(signature: string | undefined): void {
		const sig = signature ? signature : config.DEFAULT_OVERMIND_SIGNATURE;
		if (sig.length > 100) {
			throw new Error(
				`Invalid signature: ${signature}; length is over 100 chars.`
			);
		} else if (
			!sig.toLowerCase().includes("overmind") &&
			!sig.includes(__DEFAULT_OVERMIND_SIGNATURE__)
		) {
			throw new Error(
				`Invalid signature: ${signature}; must contain the string "Overmind" or ` +
					`${__DEFAULT_OVERMIND_SIGNATURE__} (accessible on global with __DEFAULT_OVERMIND_SIGNATURE__)`
			);
		}

		Memory.settings.signature = sig;

		_.each(Overmind.colonies, (colony) => {
			const signer = _.sample(colony.getZergByRole("worker"));
			if (!signer) {
				log.warning(
					`${colony.print}: unable to find a random worker to re-sign the controller`
				);
				return;
			}
			signer.task = new TaskSignController(colony.controller);
		});

		_.filter(
			Overmind.directives,
			(directive) => directive instanceof DirectiveOutpost
		).forEach((directive) => {
			const overlord = <ReservingOverlord>directive.overlords.reserve;
			overlord.settings.resetSignature = true;
			if (overlord.reservers[0]) {
				overlord.reservers[0].task = null;
			}
		});
		console.log(`Controller signature set to ${sig}`);
	}

	// Debugging methods ===============================================================================================

	static debug(
		...things: {
			name?: string;
			ref?: string;
			print?: string;
			memory: MemoryDebug;
		}[]
	): void {
		let mode;
		const debugged = [];
		for (const thing of things) {
			const name = `${
				thing.print || thing.ref || thing.name || "(no name or ref)"
			}`;
			if (
				(thing.memory && thing.memory.debug && mode === undefined) ||
				mode === false
			) {
				mode = false;
				delete thing.memory.debug;
				debugged.push(name);
			} else if ((thing.memory && mode === undefined) || mode === true) {
				mode = true;
				thing.memory.debug = true;
				debugged.push(name);
			} else {
				log.info(`don't know what to do with ${thing}`);
				return;
			}
		}
		console.log(
			`${mode ? "Enabled" : "Disabled"} debugging for ${debugged.join(
				", "
			)}`
		);
	}

	static startRemoteDebugSession(): void {
		global.remoteDebugger.enable();
		console.log(`Started remote debug session.`);
	}

	static endRemoteDebugSession(): void {
		global.remoteDebugger.disable();
		console.log(`Ended remote debug session.`);
	}

	static print(...args: any[]): void {
		console.log(dump(args));
	}

	static timeit(callback: () => any, repeat = 1): void {
		const start = Game.cpu.getUsed();
		let i: number;
		for (i = 0; i < repeat; i++) {
			callback();
		}
		const used = Game.cpu.getUsed() - start;
		console.log(
			`CPU used: ${used}. Repetitions: ${repeat} (${used / repeat} each).`
		);
	}

	// Overlord profiling ==============================================================================================
	static profileOverlord(overlord: Overlord | string, ticks?: number): void {
		const overlordInstance =
			typeof overlord == "string" ?
				Overmind.overlords[overlord]
			:	(overlord as Overlord | undefined);
		if (!overlordInstance) {
			console.log(`No overlord found for ${overlord}!`);
		} else {
			overlordInstance.startProfiling(ticks);
			console.log(
				`Profiling ${overlordInstance.print} for ${
					ticks || "indefinite"
				} ticks.`
			);
		}
	}

	static finishProfilingOverlord(overlord: Overlord | string): void {
		const overlordInstance =
			typeof overlord == "string" ?
				Overmind.overlords[overlord]
			:	(overlord as Overlord | undefined);
		if (!overlordInstance) {
			console.log(`No overlord found for ${overlord}!`);
		} else {
			overlordInstance.finishProfiling();
			console.log(`Profiling ${overlordInstance.print} stopped.`);
		}
	}

	// Colony suspension ===============================================================================================

	static suspendColony(roomName: string): void {
		if (!Memory.colonies[roomName]) {
			console.log(`Colony ${roomName} is not a valid colony!`);
			return;
		}
		const colonyMemory = Memory.colonies[roomName] as
			| ColonyMemory
			| undefined;
		if (!colonyMemory) {
			console.log(`No colony memory for ${roomName}!`);
			return;
		}
		colonyMemory.suspend = true;
		Overmind.shouldBuild = true;
		console.log(`Colony ${roomName} suspended.`);
	}

	static unsuspendColony(roomName: string): void {
		if (!Memory.colonies[roomName]) {
			console.log(`Colony ${roomName} is not a valid colony!`);
			return;
		}
		const colonyMemory = Memory.colonies[roomName] as
			| ColonyMemory
			| undefined;
		if (!colonyMemory) {
			console.log(`No colony memory for ${roomName}!`);
			return;
		}
		delete colonyMemory.suspend;
		Overmind.shouldBuild = true;
		console.log(`Colony ${roomName} unsuspended.`);
	}

	static listSuspendedColonies(): Colony[] {
		const suspended = _.filter(
			Object.entries(Memory.colonies),
			([_name, mem]) => mem.suspend
		);

		let msg = "Colonies currently suspended: \n";
		for (const [name, _mem] of suspended) {
			msg += `Colony ${name}\n`;
		}
		console.log(msg);
		return suspended.map(([name, _mem]) => Overmind.colonies[name]);
	}

	// Room planner control ============================================================================================

	static openRoomPlanner(roomName: string): void {
		if (!Overmind.colonies[roomName]) {
			console.log(`Error: ${roomName} is not a valid colony!`);
			return;
		}
		if (Overmind.colonies[roomName].roomPlanner.active) {
			console.log(`RoomPlanner for ${roomName} is already active!`);
			return;
		}
		console.log(
			`Enabled RoomPlanner for ${Overmind.colonies[roomName].print}`
		);
		Overmind.colonies[roomName].roomPlanner.active = true;
	}

	static closeRoomPlanner(roomName: string): void {
		if (!Overmind.colonies[roomName]) {
			console.log(`Error: ${roomName} is not a valid colony!`);
			return;
		}
		if (!Overmind.colonies[roomName].roomPlanner.active) {
			console.log(`RoomPlanner for ${roomName} is not active!`);
			return;
		}
		console.log(
			`Closed RoomPlanner for ${Overmind.colonies[roomName].print}`
		);
		Overmind.colonies[roomName].roomPlanner.finalize();
	}

	static cancelRoomPlanner(roomName: string): void {
		if (!Overmind.colonies[roomName]) {
			console.log(`Error: ${roomName} is not a valid colony!`);
			return;
		}
		if (!Overmind.colonies[roomName].roomPlanner.active) {
			console.log(`RoomPlanner for ${roomName} is not active!`);
			return;
		}
		Overmind.colonies[roomName].roomPlanner.active = false;
		console.log(
			`RoomPlanner for ${Overmind.colonies[roomName].print} has been deactivated without saving changes`
		);
	}

	static listActiveRoomPlanners(): Colony[] {
		const coloniesWithActiveRoomPlanners: Colony[] = _.filter(
			_.map(
				_.keys(Overmind.colonies),
				(colonyName) => Overmind.colonies[colonyName]
			),
			(colony: Colony) => colony.roomPlanner.active
		);
		const names: string[] = _.map(
			coloniesWithActiveRoomPlanners,
			(colony) => colony.room.print
		);
		if (names.length > 0) {
			console.log(
				"Colonies with active room planners: " + names.toString()
			);
			return coloniesWithActiveRoomPlanners;
		} else {
			console.log(`No colonies with active room planners`);
			return [];
		}
	}

	static listConstructionSites(
		filter?: (site: ConstructionSite) => any
	): ConstructionSite[] {
		if (!filter) {
			filter = () => true;
		}
		const sites = _.filter(Game.constructionSites, filter);

		let msg = `${
			_.keys(Game.constructionSites).length
		} construction sites currently present: \n`;
		for (const site of sites) {
			msg +=
				`${bullet}Type: ${site.structureType}`.padEnd(20) +
				`Pos: ${site.pos.print}`.padEnd(65) +
				`Progress: ${site.progress} / ${site.progressTotal} \n`;
		}
		console.log(msg);
		return sites;
	}

	// Directive management ============================================================================================

	static listDirectives(
		filter?: string | ((dir: Directive) => boolean)
	): Directive[] {
		if (typeof filter === "string") {
			const match = filter;
			filter = (dir) => dir.name.startsWith(match);
		} else if (!filter) {
			filter = () => true;
		}

		const matches = _.filter(Overmind.directives, filter);
		let msg = "";
		for (const dir of matches) {
			msg +=
				`${bullet}Name: ${dir.print}`.padEnd(70) +
				`Colony: ${dir.colony.print}`.padEnd(55) +
				`Pos: ${dir.pos.print}\n`;
		}
		console.log(msg);
		return matches;
	}

	static removeAllLogisticsDirectives(): void {
		const logisticsFlags = _.filter(
			Game.flags,
			(flag) =>
				flag.color == COLOR_YELLOW &&
				flag.secondaryColor == COLOR_YELLOW
		);
		for (const dir of logisticsFlags) {
			dir.remove();
		}
		console.log(`Removed ${logisticsFlags.length} logistics directives.`);
	}

	static listPersistentDirectives(): Directive[] {
		const directives = _.filter(
			Overmind.directives,
			(dir) => dir.memory.persistent
		);
		let msg = "";
		for (const dir of directives) {
			msg +=
				`Type: ${dir.directiveName}`.padEnd(20) +
				`Name: ${dir.name}`.padEnd(15) +
				`Pos: ${dir.pos.print}\n`;
		}
		console.log(msg);
		return directives;
	}

	static removeFlagsByColor(
		color: ColorConstant,
		secondaryColor: ColorConstant
	): void {
		const removeFlags = _.filter(
			Game.flags,
			(flag) =>
				flag.color == color && flag.secondaryColor == secondaryColor
		);
		for (const flag of removeFlags) {
			flag.remove();
		}
		console.log(`Removed ${removeFlags.length} flags.`);
	}

	static removeErrantFlags(): void {
		// This may need to be be run several times depending on visibility
		if (config.USE_SCREEPS_PROFILER) {
			console.log(`ERROR: should not be run while profiling is enabled!`);
			return;
		}
		let count = 0;
		for (const name in Game.flags) {
			if (!Overmind.directives[name]) {
				Game.flags[name].remove();
				count += 1;
			}
		}
		console.log(`Removed ${count} flags.`);
	}

	// Structure management ============================================================================================

	static destroyErrantStructures(roomName: string): void {
		const colony = Overmind.colonies[roomName];
		if (!colony) {
			console.log(`${roomName} is not a valid colony!`);
			return;
		}
		const room = colony.room;
		const allStructures = room.find(FIND_STRUCTURES);
		let i = 0;
		for (const s of allStructures) {
			if (s.structureType == STRUCTURE_CONTROLLER) {
				continue;
			}
			if (
				!colony.roomPlanner.structureShouldBeHere(
					s.structureType,
					s.pos
				)
			) {
				const result = s.destroy();
				if (result == OK) {
					i++;
				}
			}
		}
		console.log(`Destroyed ${i} misplaced structures in ${roomName}.`);
	}

	static destroyAllHostileStructures(roomName: string): void {
		const room = Game.rooms[roomName];
		if (!room) {
			console.log(`${roomName} is undefined! (No vision?)`);
			return;
		}
		if (!room.my) {
			console.log(`${roomName} is not owned by you!`);
			return;
		}
		const hostileStructures = room.find(FIND_HOSTILE_STRUCTURES);
		for (const structure of hostileStructures) {
			structure.destroy();
		}
		console.log(
			`Destroyed ${hostileStructures.length} hostile structures.`
		);
	}

	static destroyAllBarriers(roomName: string): void {
		const room = Game.rooms[roomName];
		if (!room) {
			console.log(`${roomName} is undefined! (No vision?)`);
			return;
		}
		if (!room.my) {
			console.log(`${roomName} is not owned by you!`);
			return;
		}
		for (const barrier of room.barriers) {
			barrier.destroy();
		}
		console.log(`Destroyed ${room.barriers.length} barriers.`);
	}

	static removeUnbuiltConstructionSites(): void {
		let msg = "";
		for (const id in Game.constructionSites) {
			const csite = Game.constructionSites[id];
			if (csite.progress == 0) {
				const ret = csite.remove();
				msg +=
					`Removing construction site for ${csite.structureType} with 0% progress at ` +
					`${csite.pos.print}; response: ${ret}\n`;
			}
		}
		console.log(msg);
	}

	// Colony Management ===============================================================================================

	static setRoomUpgradeRate(
		colonySpec: Colony | string,
		rate?: number | null
	): void {
		const colony = this.resolveSingleColonySpec(colonySpec);
		const oldRate = colony.upgradeSite.memory.speedFactor;

		if (typeof rate === "number") {
			rate = Math.max(0, rate);
			colony.upgradeSite.memory.speedFactor = rate;

			console.log(
				`Colony ${colony.name} is now upgrading at a rate of ${rate} (previously ${oldRate}).`
			);
		} else if (rate === null) {
			delete colony.upgradeSite.memory.speedFactor;
		} else {
			const rate = colony.upgradeSite.memory.speedFactor;
			console.log(
				`Colony ${colony.name} currently upgrading at a rate of ${rate}.`
			);
		}
	}

	static getEmpireMineralDistribution(): void {
		const minerals = EmpireAnalysis.empireMineralDistribution();
		let msg = "Empire Mineral Distribution \n";
		for (const mineral in minerals) {
			msg += `${mineral}: ${minerals[mineral]} \n`;
		}
		console.log(msg);
	}

	static listPortals(
		rangeFromColonies: number = 5,
		includeIntershard: boolean = false
	): PortalInfo[] {
		const colonies = getAllColonies();
		const portalsByColony = colonies.map<
			[string, { [portalRoom: string]: PortalInfo[] }]
		>((colony) => [
			colony.name,
			RoomIntel.findPortalsInRange(
				colony.name,
				rangeFromColonies,
				includeIntershard
			),
		]);
		const allPortals = new Set<PortalInfo>();
		let msg = `Empire Portal Census\n`;
		const table = [];
		for (const [colonyName, portals] of portalsByColony) {
			for (const portalRoomName of _.keys(portals)) {
				for (const portal of portals[portalRoomName]) {
					let dest;
					if (portal.roomDestination) {
						dest = portal.roomDestination.print;
					} else {
						const { shard, room } = portal.shardDestination!;
						dest = `<a href="#!/room/${shard}/${room}">[${room}@${shard}]</a>`;
					}

					const data = {
						colony: colonyName,
						expiration:
							portal.expiration ?
								portal.expiration - Game.time
							:	"stable",
						portal: portal.pos.print,
						destination: dest,
					};

					table.push(data);

					allPortals.add(portal);
				}
			}
		}

		msg += columnify(table);
		console.log(msg);

		return [...allPortals];
	}

	static evaluateOutpostEfficiencies(): void {
		const outpostsPerColony: [Colony, string[]][] = getAllColonies()
			.filter((c) => c.bunker)
			.map((c) => [c, c.outposts.map((r) => r.name)]);

		console.log(
			OvermindConsole.reportOutpostEfficiency(
				outpostsPerColony,
				(avg, colonyAvg) => avg < colonyAvg * 0.75
			)
		);
	}

	static evaluatePotentialOutpostEfficiencies(): void {
		const outpostsPerColony: [Colony, string[]][] = getAllColonies()
			.filter((c) => c.bunker)
			.map((c) => {
				const outpostNames = c.outposts.map((room) => room.name);
				return [
					c,
					Cartographer.findRoomsInRange(c.name, 2).filter(
						(r) => !outpostNames.includes(r)
					),
				];
			});

		console.log(
			OvermindConsole.reportOutpostEfficiency(
				outpostsPerColony,
				(avg, colonyAvg) => avg > colonyAvg * 1.25 || avg > 20
			)
		);
	}

	static reportOutpostEfficiency(
		outpostsPerColony: [Colony, string[]][],
		selectionCallback: (avg: number, colonyAvg: number) => boolean
	): string {
		let msg = `Estimated outpost efficiency:\n`;
		for (const [colony, outposts] of outpostsPerColony) {
			let avgEnergyPerCPU = 0;
			const outpostAvgEnergyPerCPU = [];

			msg += ` • Colony at ${colony.room.name}:\n`;
			for (const outpost of outposts) {
				const d = ExpansionEvaluator.computeTheoreticalMiningEfficiency(
					colony.bunker!.anchor,
					outpost
				);

				msg += `\t - ${d.room} ${`(${d.type})`.padStart(6)}: `;
				msg += `${(
					(d.energyPerSource * d.sources) /
					ENERGY_REGEN_TIME
				).toFixed(2)} energy/source, `;
				msg += `Net income: ${d.netIncome.toFixed(2)}, `;
				msg += `Net energy/CPU: ${(d.netIncome / d.cpuCost).toFixed(
					2
				)}\n`;
				msg += `\t   Creep costs: ${d.creepEnergyCost.toFixed(
					2
				)} energy/tick, `;
				msg += `spawn time: ${d.spawnTimeCost.toFixed(
					2
				)}, CPU: ${d.cpuCost.toFixed(2)} cycles/tick\n`;
				if (d.unreachableSources || d.unreachableController) {
					const { unreachableSources: s, unreachableController: c } =
						d;
					msg += `\t   ${color("Unreachable:", "yellow")} `;
					if (s) {
						msg += `sources: ${s}`;
					}
					if (s && c) {
						msg += ", ";
					}
					if (c) {
						msg += `controller: ${c}`;
					}
					msg += `\n`;
				}

				outpostAvgEnergyPerCPU.push(d.avgEnergyPerCPU);
				avgEnergyPerCPU += d.avgEnergyPerCPU;
			}

			const bestOutposts = outpostAvgEnergyPerCPU
				.map((avg, idx) => {
					// 20E/cpu is a good guideline for an efficient room
					if (selectionCallback(avg, avgEnergyPerCPU)) {
						return idx + 1;
					}
					return undefined;
				})
				.filter((avg) => avg);

			msg += `\n   Outposts with above average efficiency of ${avgEnergyPerCPU.toFixed(
				2
			)}: `;
			msg += `${bestOutposts.join(", ")}\n`;
		}

		return msg;
	}
	// Manual hatchery commands
	static manualCreepSpawn (roomName: string,creepRole:string, spawnNum?: number): void {
		const colony = Overmind.colonies[roomName];
		if (!colony) {
			console.log(`${roomName} is not a valid colony!`);
			return;
		}
		if (!colony.hatchery) {
			console.log(`${roomName} does not have a hatchery`)
			return;
		}
	}
	// Memory management ===============================================================================================

	static deepCleanMemory(): void {
		// Clean colony memory
		const protectedColonyKeys = [
			"defcon",
			"roomPlanner",
			"roadPlanner",
			"barrierPlanner",
		];
		for (const colName in Memory.colonies) {
			for (const key in Memory.colonies[colName]) {
				if (!protectedColonyKeys.includes(key)) {
					// @ts-expect-error direct property access
					delete Memory.colonies[colName][key];
				}
			}
		}
		// Suicide any creeps which have no memory
		for (const i in Game.creeps) {
			if (_.isEmpty(Game.creeps[i].memory)) {
				Game.creeps[i].suicide();
			}
		}
		// Remove profiler memory
		delete Memory.screepsProfiler;
		// Remove overlords memory from flags
		for (const i in Memory.flags) {
			if (Memory.flags[i].overlords) {
				delete Memory.flags[i].overlords;
			}
		}
		// Clean creep memory
		for (const i in Memory.creeps) {
			// Remove all creep tasks to fix memory leak in 0.3.1
			if (Memory.creeps[i].task) {
				Memory.creeps[i].task = null;
			}
		}
		console.log(`Memory has been cleaned.`);
	}

	private static recursiveMemoryProfile(
		prefix: string,
		memoryObject: any,
		sizes: { [key: string]: number },
		currentDepth: number
	): number {
		let total = 0;
		for (const key in memoryObject) {
			const fullKey = `${prefix}.${key}`;
			if (
				currentDepth == 0 ||
				!_.keys(memoryObject[key]) ||
				_.keys(memoryObject[key]).length == 0
			) {
				let len = NaN;
				try {
					len = JSON.stringify(memoryObject[key]).length; // 2 for the brackets
				} catch (e) {
					if (memoryObject[key] !== undefined) {
						console.log(
							`failed to get JSON for ${fullKey}: ${memoryObject[key]}`
						);
					}
				}
				sizes[fullKey] = len;
				if (!isNaN(len)) {
					total += len;
				}
			} else {
				total += OvermindConsole.recursiveMemoryProfile(
					fullKey,
					memoryObject[key],
					sizes,
					currentDepth - 1
				);
				sizes[`${prefix}.TOTAL`] = total;
			}
		}
		return total;
	}

	static profileMemory(root = Memory, depth = 1): RecursiveObject {
		const sizes: { [key: string]: number } = {};
		console.log(`Profiling memory...`);
		const start = Game.cpu.getUsed();
		OvermindConsole.recursiveMemoryProfile("ROOT", root, sizes, depth);
		const sortedSizes = _.sortBy(Object.entries(sizes), (val) => -val[1]);
		console.log(`Time elapsed: ${Game.cpu.getUsed() - start}`);
		const maxKeyLen =
			maxBy(sortedSizes, ([k, _v]) => k.length)?.[0].length ?? 0;
		console.log(
			sortedSizes
				.map(
					([k, v]) => `${k}:${"".padStart(maxKeyLen - k.length)}${v}`
				)
				.join("\n")
		);
		return sizes;
	}

	static cancelMarketOrders(filter?: (order: Order) => boolean): void {
		const ordersToCancel =
			!!filter ?
				_.filter(Game.market.orders, (order) => filter(order))
			:	Game.market.orders;
		_.forEach(_.values(ordersToCancel), (order: Order) =>
			Game.market.cancelOrder(order.id)
		);
		console.log(`Canceled ${_.values(ordersToCancel).length} orders.`);
	}

	static showRoomSafety(roomName?: string): void {
		const names = roomName ? [roomName] : Object.keys(Memory.rooms);

		let msg = `Room Intelligence data for ${
			roomName ? `room ${roomName}` : "all rooms"
		}:\n`;
		const roomData = _.sortBy(
			names.map((n) => {
				const {
					threatLevel,
					safeFor,
					unsafeFor,
					invisibleFor,
					combatPotentials,
					numHostiles,
					numBoostedHostiles,
				} = RoomIntel.getSafetyData(n);

				function fmtThreat(lvl: number): string {
					let suffix = "";
					if (lvl < 0.1) {
						suffix = "---";
					} else if (lvl < 0.2) {
						suffix = " --";
					} else if (lvl < 0.4) {
						suffix = "  -";
					} else if (lvl < 0.6) {
						suffix = "   ";
					} else if (lvl < 0.8) {
						suffix = "  +";
					} else if (lvl < 0.9) {
						suffix = " ++";
					} else {
						suffix = "+++";
					}
					return lvl.toFixed(4) + " " + suffix;
				}

				const obj = {
					room: n,
					threatlevel: fmtThreat(threatLevel),
					safeFor: safeFor ?? 0,
					unsafeFor: unsafeFor ?? 0,
					invisibleFor: invisibleFor ?? 0,
					hostiles: numHostiles ?? 0,
					boostedHostiles: numBoostedHostiles ?? 0,
					ranged: combatPotentials?.r ?? 0,
					heal: combatPotentials?.h ?? 0,
					dismantle: combatPotentials?.d ?? 0,
				};
				return obj;
			}),
			(data) => data.room
		);

		msg += columnify(roomData);
		console.log(msg);
	}

	private static resolveColonySpec(colonySpec?: Colony | string) {
		let colonies;
		if (typeof colonySpec === "string") {
			if (!Overmind.colonies[colonySpec]) {
				throw new Error(`Unknown colony ${colonySpec}`);
			}
			colonies = [Overmind.colonies[colonySpec]];
		} else if (colonySpec instanceof Colony) {
			colonies = [colonySpec];
		} else if (typeof colonySpec === "undefined") {
			colonies = Object.values(Overmind.colonies);
		} else {
			throw new Error(`Don't know what to do with ${colonySpec}`);
		}
		return colonies;
	}

	private static resolveSingleColonySpec(colonySpec?: Colony | string) {
		const colonies = this.resolveColonySpec(colonySpec);
		if (colonies.length > 1) {
			throw new Error(`more than one colony matched ${colonySpec}`);
		}
		return colonies[0];
	}

	static spawnSummary(colonySpec?: Colony | string) {
		const colonies = this.resolveColonySpec(colonySpec);
		let msg = `Ongoing creep requests:\n`;
		for (const colony of colonies) {
			if (!colony.hatchery) {
				msg += `\n${bullet} ${colony.name} has no hatchery\n`;
				continue;
			}
			if (colony.hatchery?.spawnRequests.length === 0) {
				msg += `\n${bullet} ${colony.name} is idle\n`;
				continue;
			}
			msg += `\n${bullet} ${colony.name} has the following requests:\n`;
			const requestsByRole = _.groupBy(
				colony.hatchery?.spawnRequests,
				(req) => req.setup.role
			);
			for (const [role, requests] of Object.entries(requestsByRole)) {
				if (requests.length === 1) {
					const req = requests[0];
					msg += `\t\t- "${role}": ${req.overlord.print} at priority ${req.priority}\n`;
				} else {
					msg += `\t\t- "${role}":\n`;
					for (const req of requests) {
						msg += `\t\t\t${req.overlord.print} at priority ${req.priority}\n`;
					}
				}
			}
			msg += `\n`;
		}
		console.log(msg);
	}

	static idleCreeps(colonySpec?: Colony | string) {
		const colonies = this.resolveColonySpec(colonySpec);
		let idleCreeps: Zerg[] = [];
		let msg = "The following creeps are idle:\n";
		for (const colony of colonies) {
			const idle = colony.overlords.default.idleZerg;
			if (idle.length === 0) {
				continue;
			}

			msg += `\t${bullet} ${colony.name}: ${idle.map((z) => z.print)}\n`;
			idleCreeps = idleCreeps.concat(...idle);
		}
		if (idleCreeps.length === 0) {
			msg = "No idle creeps";
		}
		console.log(msg);
		return idleCreeps;
	}

	static visuals() {
		Memory.settings.enableVisuals = !Memory.settings.enableVisuals;
		console.log(
			`Visuals ${Memory.settings.enableVisuals ? "enabled" : "disabled"}.`
		);
	}

	static showIntelVisuals(ticks: number = 100, range?: number) {
		Memory.settings.intelVisuals.until = Game.time + ticks;
		Memory.settings.intelVisuals.range =
			range && range > 0 ? range : ROOMINTEL_DEFAULT_VISUALS_RANGE;
		RoomIntel.limitedRoomVisual = undefined;
		console.log(
			`Intel visuals enabled in range ${Memory.settings.intelVisuals.range} for the next ${ticks} ticks (until ${Memory.settings.intelVisuals.until}).`
		);
	}

	static showAssets(...args: (string | Colony)[]) {
		const colonyFilter = new Set();
		const resourceFilter = new Set();
		for (const arg of args) {
			if (typeof arg === "string" && RESOURCES_ALL.includes(arg)) {
				resourceFilter.add(arg);
			} else if (typeof arg === "string" && Overmind.colonies[arg]) {
				colonyFilter.add(arg);
			} else if (isColony(arg)) {
				colonyFilter.add(arg.name);
			}
		}

		let data: ResourceTally[] = [];
		const columnifyOpts: columnify.GlobalOptions = {
			config: { resource: { align: "right" }, total: { align: "right" } },
			headingTransform(header) {
				if (header.startsWith("S-")) {
					return "";
				} else if (header.startsWith("T-")) {
					return header.substring(2);
				} else {
					return header.toUpperCase();
				}
			},
		};
		for (const resourceType of RESOURCES_ALL) {
			if (resourceFilter.size > 0 && !resourceFilter.has(resourceType)) {
				continue;
			}
			let total = 0;
			const resourceTally: ResourceTally = {
				resource: resourceType,
				total: 0,
			};
			for (const colony of Object.values(Overmind.colonies)) {
				let count = 0;

				count += colony.storage?.store[resourceType] ?? 0;
				count += colony.terminal?.store[resourceType] ?? 0;
				count += colony.factory?.store[resourceType] ?? 0;
				total += count;

				const threshold = TerminalNetwork.thresholds(
					colony,
					resourceType
				);
				const min = threshold.target - threshold.tolerance;
				const max = threshold.target + threshold.tolerance;
				let status: ResourceTallyState = "~";
				if (count > 0 && count >= (threshold.surplus ?? Infinity)) {
					status = "!";
				} else if (count < min) {
					status = "-";
				} else if (count > max) {
					status = "+";
				}

				columnifyOpts.config![`T-${colony.name}`] ??= {};
				columnifyOpts.config![`T-${colony.name}`].align = "right";
				resourceTally[`S-${colony.name}`] = status;
				resourceTally[`T-${colony.name}`] = count;
			}
			resourceTally.total = total;
			// We only display the row if there's any stored amount, unless we're filtering
			if (
				total > 0 ||
				resourceFilter.has(resourceType) ||
				colonyFilter.size
			) {
				data.push(resourceTally);
			}
		}

		data = data.sort((a, b) => {
			const a_prio = RESOURCE_IMPORTANCE.indexOf(a.resource);
			const b_prio = RESOURCE_IMPORTANCE.indexOf(b.resource);
			if (a_prio === b_prio) {
				return b.total - a.total;
			}
			if (a_prio === -1) {
				return 1;
			}
			if (b_prio === -1) {
				return -1;
			}
			return a_prio - b_prio;
		});

		if (colonyFilter.size > 0) {
			data = data.map((tally) => {
				const filteredTally: ResourceTally = {
					resource: tally.resource,
					total: tally.total,
				};
				colonyFilter.forEach((name) => {
					filteredTally[`S-${name}`] = tally[`S-${name}`];
					filteredTally[`T-${name}`] = tally[`T-${name}`];
				});
				return filteredTally;
			});
		}

		let type = "all";
		if (colonyFilter.size || resourceFilter.size) {
			const filters = [
				...colonyFilter.values(),
				...resourceFilter.values(),
			];
			type = `filtered on ${filters.join(", ")}`;
		}
		const msg =
			`Reporting ${type} assets:\n` +
			`\tThresholds markers: <b>!</b> - surplus, <b>+</b> - above, <b>~</b> - between, <b>-</b> - under\n` +
			columnify(data, columnifyOpts);
		console.log(msg);
		return data;
	}

	static toggleRoomActive(roomName: string, state?: boolean) {
		const colonyName = Overmind.colonyMap[roomName];
		if (!colonyName) {
			log.error(`${roomName} is not a known outpost`);
			return;
		}

		const colony = Overmind.colonies[colonyName];
		if (state === undefined) {
			state = !colony.memory.outposts[roomName].active;
		}
		colony.memory.outposts[roomName].active = state;
		console.log(
			`Toggled room ${roomName} of colony ${colony.name} ${
				state ? "online" : "offline"
			}`
		);
	}

	static listFactories() {
		const status = getAllColonies()
			.filter((c) => c.infestedFactory)
			.map((c) => {
				return Object.assign(
					{ colony: c.name },
					c.infestedFactory?.memory.activeProduction,
					{ produced: c.infestedFactory?.memory.produced }
				);
			});
		log.info(`Factory status:\n${columnify(status)}`);
	}

	static resetFactories() {
		_.each(
			_.filter(Overmind.colonies, (c) => c.infestedFactory),
			(c) =>
				(c.infestedFactory!.memory.suspendProductionUntil = Game.time)
		);
	}
}
