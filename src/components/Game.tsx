import { FC, experimental_useEffectEvent as useEffectEvent, useState } from "react";
import { type VarhubClient } from "@flinbein/varhub-web-client";
import { GameRPC } from "../types.js";
import { Board } from "./Board.js";
import { Control } from "./Control.js";

navigator.wakeLock.request("screen");

async function getPermissions(){
	if ( typeof( DeviceMotionEvent ) !== "undefined" && typeof( (DeviceMotionEvent as any).requestPermission ) === "function" ) {
		// (optional) Do something before API request prompt.
		return (DeviceMotionEvent as any).requestPermission();
	}
}

export type GameProps = {
	roomId: string,
	rpc: GameRPC
}
export const Game: FC<GameProps> = ({rpc, roomId}) => {
	const [team, setTeam] = useState<null | 0 | 1>(null);
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
		setGameBoard(() => new rpc.GameBoard);
	})
	
	if (gameBoard) return <Board gameBoard={gameBoard} />
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