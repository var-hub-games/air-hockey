import { FC, use, useEffect, useState, Suspense } from "react";
import { GameRPC } from "../types.js";
import { GamePixiApp} from "../GamePixiApp.js";

export type BoardProps = {
	rpc: GameRPC
}
export const Board: FC<BoardProps> = ({rpc}) => {
	const [appPromise] = useState(() => GamePixiApp(rpc));
	return <Suspense fallback="loading...">
		<BoardGraphics appPromise={appPromise}/>
	</Suspense>
}

export const BoardGraphics: FC<{appPromise: ReturnType<typeof GamePixiApp>}> = ({appPromise}) => {
	const app = use(appPromise);
	const [div, setDiv] = useState<HTMLDivElement|null>(null);
	useEffect(() => {
		void navigator.wakeLock.request("screen");
		if (div) div.appendChild(app.canvas);
	}, [div]);
	return <div className="canvas-box" ref={setDiv} />
}