import { createRoot } from 'react-dom/client';
import { App } from "./components/App.js";
import { Varhub } from "@flinbein/varhub-web-client";

import * as roomData from "./vm?varhub-bundle";

const hub = new Varhub("https://varhub.flinbein.ru");

(window as any)["createRoom"] = async () => {
	try {
		const roomInfo = await hub.createRoom("ivm", {...roomData});
		console.log("room created", roomInfo);
		const client = hub.join(roomInfo.id, {
			integrity: roomData.integrity,
		});
		client.on("message", console.log);
	} catch (error) {
		console.error("room error", error);
	}
	
}

console.log(roomData);


const root = createRoot(document.getElementById('root')!);
root.render(<App />);
