import { FC, experimental_useEffectEvent as useEffectEvent, useState } from "react";
import { GameRPC } from "../types.js";
import { Board } from "./Board.js";
import { Control } from "./Control.js";

async function getPermissions(){
	if ((DeviceMotionEvent as any)?.requestPermission) {
		await (DeviceMotionEvent as any).requestPermission();
	}
}

export type GameProps = {
	roomId: string,
	rpc: GameRPC
}
export const Game: FC<GameProps> = ({rpc, roomId}) => {
	const [team, setTeam] = useState<null | 0 | 1 | 2>(null);
	const [gameBoard, setGameBoard] = useState<null | InstanceType<GameRPC["GameBoard"]>>(null);
	
	const joinRed = useEffectEvent(async () => {
		await getPermissions();
		setTeam(0);
	})
	
	const joinBlue = useEffectEvent(async () => {
		await getPermissions();
		setTeam(1);
	})
	
	const joinBoard = useEffectEvent(() => {
		setTeam(2);
	})
	
	if (team === 2) return <Board rpc={rpc} />
	if (team != null) return <Control team={team} rpc={rpc} />
	
	return <>
		roomId = {roomId}
		<br/>
		<button onClick={joinRed}>JOIN AS RED</button>
		<br/>
		<br/>
		<button onClick={joinBlue}>JOIN AS BLUE</button>
		<br/>
		<br/>
		<button onClick={joinBoard}>SHOW BOARD</button>
	</>
}