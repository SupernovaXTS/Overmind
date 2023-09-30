import { deref, derefRoomPosition } from "utilities/utils";

global.__VERSION__ = '0.5.2';

// @ts-expect-error make available in global
global.deref = deref;
// @ts-expect-error make available in global
global.derefRoomPosition = derefRoomPosition;

// // Assign values to the memory key aliases declared in memory.d.ts
// global._TICK = 'T';
// global._EXPIRATION = 'X';
// global._COLONY = 'C';
// global._OVERLORD = 'O';
// global._DISTANCE = 'D';
// global._RM_AVOID = 'a';
// global._RM_SOURCE = 's';
// global._RM_CONTROLLER = 'c';
// global._RM_MINERAL = 'm';
// global._RM_SKLAIRS = 'k';
//
// global._RM_IMPORTANTSTRUCTURES = 'i';
// global._RM_IS_TOWERS = 't';
// global._RM_IS_SPAWNS = 'sp';
// global._RM_IS_STORAGE = 's';
// global._RM_IS_TERMINAL = 'e';
// global._RM_IS_WALLS = 'w';
// global._RM_IS_RAMPARTS = 'r';
//
// global._RM_EXPANSIONDATA = 'e';
// global._RM_INVASIONDATA = 'v';
// global._RM_HARVEST = 'h';
// global._RM_CASUALTIES = 'd';
// global.RMEM_SAFETY = 'f';
// global._RM_PREVPOSITIONS = 'p';
// global._RM_CREEPSINROOM = 'cr';
//
// global._AMOUNT = 'a';
// global._AVG10K = 'D';
// global._AVG100K = 'H';
// global._AVG1M = 'M';
//
// global._CTRL_LEVEL = 'l';
// global._CTRL_OWNER = 'o';
// global._CTRL_RESERVATION = 'r';
// global._CTRL_RES_USERNAME = 'u';
// global._CTRL_RES_TICKSTOEND = 't';
// global._CTRL_SAFEMODE = 's';
// global._CTRL_SAFEMODE_AVAILABLE = 'sa';
// global._CTRL_SAFEMODE_COOLDOWN = 'sc';
// global._CTRL_PROGRESS = 'p';
// global._CTRL_PROGRESSTOTAL = 'pt';
//
// global._MNRL_MINERALTYPE = 't';
// global._MNRL_DENSITY = 'd';

