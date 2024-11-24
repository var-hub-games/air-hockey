/// <reference types="react/experimental" />
import type * as VM from "./vm/index.js";
import type {RPCChannel} from "@flinbein/varhub-web-client"
import type { ROOM_EVENTS } from "./vm/types.js";

export { ROOM_EVENTS } from "./vm/types.js";
export type GameRPC = RPCChannel<{
	methods: typeof VM,
	events: {[ROOM_EVENTS.COLLISION]: [number]},
	state:[number, number]
}>;