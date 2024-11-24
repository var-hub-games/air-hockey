import { FC, experimental_useEffectEvent as useEffectEvent, useEffect, useState } from "react";
import { Varhub, RPCChannel, type VarhubClient } from "@flinbein/varhub-web-client";
import { integrity } from "../vm?varhub-bundle";
import { GameRPC } from "../types.js";
import { Game } from "./Game.js";

const varhub = new Varhub("https://varhub.dpohvar.ru/");

export const App: FC = () => {
	const [foundRooms, setFoundRooms] = useState<null | Record<string, string>>(null);
	const [data, setData] = useState<null | [string, VarhubClient, GameRPC]>(null)
	
	const createRoom = useEffectEvent(async () => {
		const roomOptions = await import("../vm?varhub-bundle");
		const { id } = await varhub.createRoom("ivm", {...roomOptions, message: ""});
		void joinRoom(id);
	});
	
	const joinRoom = useEffectEvent(async (id: string) => {
		const client = varhub.join(id, {integrity});
		const rpc = new RPCChannel(client) as any as GameRPC;
		rpc.on("state", (state: any) => console.log("::state", state));
		await rpc.promise;
		console.log("::state", rpc.state);
		setData([id, client, rpc]);
	})
	
	useEffect(() => {
		varhub.findRooms(integrity).then(setFoundRooms);
	}, []);
	
	if (data) {
		const [roomId, _client, rpc] = data;
		return <Game roomId={roomId} rpc={rpc} />
	}
	
	return <>
		<button onClick={createRoom}>CREATE</button>
		<hr />
		{foundRooms && Object.entries(foundRooms).map(([roomId, desc]) => (
			<button key={roomId} onClick={() => joinRoom(roomId)}>{roomId} - {desc}</button>
		))}
	</>;
}