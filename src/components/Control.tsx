import { FC, useEffect, useRef } from "react";
import { GameRPC, ROOM_EVENTS } from "../types.js";
import { DevicePointer } from "../utils/DevicePointer.js";

export type ControlProps = {
	team: 0 | 1,
	rpc: GameRPC
}
export const Control: FC<ControlProps> = ({rpc, team}) => {
	const pointerRef = useRef<DevicePointer|null>(null)
	
	useEffect(() => {
		void navigator.wakeLock.request("screen");
		const pointer = new DevicePointer(10);
		function onCollision(discTeam: number){
			if (discTeam !== team) return;
			navigator.vibrate(40);
		}
		rpc.on(ROOM_EVENTS.COLLISION, onCollision);
		pointerRef.current = pointer;
		pointer.addEventListener("point", ({x, y}) => {
			rpc.move.notify(team, x, -y);
		});
		return () => {
			pointer.dispose();
			rpc.off(ROOM_EVENTS.COLLISION, onCollision);
		}
	}, [team]);
	
	return <>
		<button onClick={() => pointerRef.current?.reset()}>RESET {team}</button>
	</>
}