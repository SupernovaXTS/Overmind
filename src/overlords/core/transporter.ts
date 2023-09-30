import columnify from 'columnify';
import {Colony} from '../../Colony';
import {log} from '../../console/log';
import {Roles, Setups} from '../../creepSetups/setups';
import {isResource, isRuin, isTombstone} from '../../declarations/typeGuards';
import {ALL_RESOURCE_TYPE_ERROR, BufferTarget, LogisticsNetwork, LogisticsRequest, RESOURCE_ALL} from '../../logistics/LogisticsNetwork';
import {Pathing} from '../../movement/Pathing';
import {OverlordPriority} from '../../priorities/priorities_overlords';
import {profile} from '../../profiler/decorator';
import {Tasks} from '../../tasks/Tasks';
import {Zerg} from '../../zerg/Zerg';
import {Overlord, OverlordMemory} from '../Overlord';
import { deref, ema, minBy } from 'utilities/utils';
import { Stats } from 'stats/stats';

const MAX_TRANSPORTERS = 10;

export const enum TRANSPORT_MEM {
	DOWNTIME = 'd',
}

interface TransporterMemory extends OverlordMemory {
	[TRANSPORT_MEM.DOWNTIME]: number;
}

/**
 * The transport overlord handles energy transport throughout a colony
 */
@profile
export class TransportOverlord extends Overlord {

	memory: TransporterMemory;
	transporters: Zerg[];

	constructor(colony: Colony, priority = OverlordPriority.ownedRoom.transport) {
		super(colony, 'logistics', priority);
		this.transporters = this.zerg(Roles.transport);
	}

	private neededTransportPower(): number {

		if (!this.colony.storage
			&& !(this.colony.hatchery && this.colony.hatchery.batteries)
			&& !this.colony.upgradeSite.battery) {
			return 0;
		}

		let transportPower = 0;
		const scaling = 2; // this.colony.stage == ColonyStage.Larva ? 1.5 : 2.0; // aggregate round-trip multiplier

		// Add contributions to transport power from hauling energy from mining sites
		for (const flagName in this.colony.miningSites) {
			const o = this.colony.miningSites[flagName].overlords.mine;
			if (!o.isSuspended && o.miners.length > 0) {
				// Only count sites which have a container output and which have at least one miner present
				// (this helps in difficult "rebooting" situations)
				if ((o.container && !o.link) || o.allowDropMining) {
					transportPower += o.energyPerTick * scaling * o.distance;
				}
			}
		}

		// Add transport power needed to move to upgradeSite
		if (this.colony.upgradeSite.battery) {
			transportPower += UPGRADE_CONTROLLER_POWER * this.colony.upgradeSite.upgradePowerNeeded * scaling *
							  (Pathing.distance(this.colony.pos, this.colony.upgradeSite.battery.pos) ?? 0);
		}


		if (this.colony.state.lowPowerMode) {
			// Reduce needed transporters when colony is in low power mode
			transportPower *= 0.5;
		}

		return transportPower / CARRY_CAPACITY;
	}

	init() {
		const ROAD_COVERAGE_THRESHOLD = 0.75; // switch from 1:1 to 2:1 transporters above this coverage threshold
		const setup = this.colony.roomPlanner.roadPlanner.roadCoverage < ROAD_COVERAGE_THRESHOLD
					  ? Setups.transporters.early : Setups.transporters.default;

		const transportPowerEach = setup.getBodyPotential(CARRY, this.colony);
		const neededTransportPower = this.neededTransportPower();
		let numTransporters = 0;
		if (transportPowerEach !== 0) {
			numTransporters = Math.ceil(neededTransportPower / transportPowerEach);
		}

		numTransporters = Math.min(numTransporters, MAX_TRANSPORTERS);

		this.debug(`requesting ${numTransporters} (${this.transporters.length}) because of ${neededTransportPower} needed by ${transportPowerEach}`);
		if (this.transporters.length == 0) {
			this.wishlist(numTransporters, setup, {priority: OverlordPriority.ownedRoom.firstTransport});
		} else {
			this.wishlist(numTransporters, setup);
		}
	}

	private handleTransporter(transporter: Zerg, request: LogisticsRequest | undefined) {
		let prefix = `${transporter.print}`;
		if (request) {
			const choices = this.colony.logisticsNetwork.bufferChoices(transporter, request);
			const bestChoice = _.last(_.sortBy(choices, choice => request.multiplier * choice.dQ
																  / Math.max(choice.dt, 0.1)));
			let task = null;
			const amount = this.colony.logisticsNetwork.predictedRequestAmount(transporter, request);
			prefix = `${transporter.print}: request ${LogisticsNetwork.logRequest(request)}, predicted: ${amount}`;
			this.debug(() => `${prefix} buffer choices:\n` + + columnify(choices));
			// Target is requesting input
			if (amount > 0) {
				if (isResource(request.target) || isTombstone(request.target) || isRuin(request.target)) {
					log.warning(`Improper logistics request: should not request input for resource, tombstone or ruin!`);
					return;
				} else if (request.resourceType === RESOURCE_ALL) {
					log.error(`${this.print}: cannot request 'all' as input!`);
					return;
				} else {
					task = Tasks.transfer(<TransferrableStoreStructure>request.target, request.resourceType);
				}
				if (bestChoice.targetRef != request.target.ref) {
					// If we need to go to a buffer first to get more stuff
					const buffer = deref(bestChoice.targetRef) as BufferTarget;
					const withdrawAmount = Math.min(buffer.store[request.resourceType] || 0,
													transporter.store.getFreeCapacity(request.resourceType), amount);
					this.debug(() => `${prefix}: going to ${buffer.print} to collect before dropping off`);
					task = task.fork(Tasks.withdraw(buffer, request.resourceType, withdrawAmount));
					if (transporter.hasMineralsInCarry && request.resourceType == RESOURCE_ENERGY) {
						task = task.fork(Tasks.transferAll(buffer));
					}
				}
			} else if (amount < 0) {
				// Target is requesting output
				if (isResource(request.target)) {
					this.debug(() => `${prefix}: picking up resource`);
					task = Tasks.pickup(request.target);
				} else if (request.resourceType === RESOURCE_ALL) {
					if (isResource(request.target)) {
						log.error(`${this.print} ${ALL_RESOURCE_TYPE_ERROR}`);
						return;
					}
					this.debug(() => `${prefix}: withdrawing everything`);
					task = Tasks.withdrawAll(request.target);
				} else {
					this.debug(() => `${prefix}: withdrawing`);
					task = Tasks.withdraw(request.target, request.resourceType);
				}
				if (bestChoice.targetRef != request.target.ref) {
					// If we need to go to a buffer first to deposit stuff
					const buffer = deref(bestChoice.targetRef) as BufferTarget;
					this.debug(() => `${prefix}: needs a buffer first, using ${buffer.print}`);
					task = task.fork(Tasks.transferAll(buffer));
				}
			} else {
				this.debug(() => `${prefix}: no resources expected, parking`);
				transporter.park();
			}
			// Assign the task to the transporter
			transporter.task = task;
			this.colony.logisticsNetwork.invalidateCache(transporter, request);
		} else {
			// If nothing to do, put everything in a store structure
			if (transporter.store.getUsedCapacity() > 0) {
				if (transporter.hasMineralsInCarry) {
					const target = this.colony.terminal || this.colony.storage;
					if (target) {
						this.debug(() => `${prefix}: nothing to do, dropping off `
							+ `everything to ${target}@${target.pos.print}`);
						transporter.task = Tasks.transferAll(target);
					}
				} else {
					const dropoffPoints = _.compact<StructureLink | StructureStorage>([this.colony.storage!, ...this.colony.links]);

					const bestDropoffPoint = minBy(dropoffPoints, (dropoff) => {
						const range = transporter.pos.getMultiRoomRangeTo(dropoff.pos);
						if (dropoff instanceof StructureLink) {
							return Math.max(range, this.colony.linkNetwork.getDropoffAvailability(dropoff));
						} else {
							return range;
						}
					});

					// const bestDropoffPoint: StructureLink | StructureStorage | undefined
					// 	= transporter.pos.findClosestByMultiRoomRange(dropoffPoints);

					if (bestDropoffPoint) {
						this.debug(() => `${prefix}: nothing to do, dropping off to `
							+ `${bestDropoffPoint}@${bestDropoffPoint.pos.print}`);
						transporter.task = Tasks.transfer(bestDropoffPoint);
					}
				}
			} else {
				let parkingSpot = transporter.pos;
				if (this.colony.storage) {
					parkingSpot = this.colony.storage.pos;
				} else if (this.colony.roomPlanner.storagePos) {
					parkingSpot = this.colony.roomPlanner.storagePos;
				}
				this.debug(() => `${prefix}: nothing to do and empty, parking to ${parkingSpot}`);
				transporter.park(parkingSpot);
			}
		}
	}

	retarget() {
		this.transporters.forEach(t => t.task = null);
		this.run();
	}

	run() {
		this.autoRun(this.transporters,
			transporter => {
				const request = this.colony.logisticsNetwork.bestRequestForTransporter(transporter);
				this.handleTransporter(transporter, request);
			},
			transporter => transporter.avoidDanger({ timer: 5, dropEnergy: true })
		);

		this.stats();
	}

	stats() {
		const idleTransporters = this.transporters.filter(t => !t.isIdle).length;
		const downtime = ema(idleTransporters / this.transporters.length,
			this.memory[TRANSPORT_MEM.DOWNTIME] ?? 0,
			CREEP_LIFE_TIME
		);

		this.memory[TRANSPORT_MEM.DOWNTIME] = downtime;
		Stats.log(`colonies.${this.colony.name}.transportNetwork.downtime`, downtime);
	}
}
