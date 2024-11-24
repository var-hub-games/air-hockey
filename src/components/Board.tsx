import { FC, use, useEffect, useState, Suspense } from "react";
import { GameRPC } from "../types.js";
import { GamePixiApp} from "../GamePixiApp.js";

export type BoardProps = {
	gameBoard: InstanceType<GameRPC["GameBoard"]>
}
export const Board: FC<BoardProps> = ({gameBoard}) => {
	const [appPromise] = useState(() => GamePixiApp(gameBoard));
	return <Suspense fallback="loading...">
		<BoardGraphics appPromise={appPromise}/>
	</Suspense>
}

export const BoardGraphics: FC<{appPromise: ReturnType<typeof GamePixiApp>}> = ({appPromise}) => {
	const app = use(appPromise);
	const [div, setDiv] = useState<HTMLDivElement|null>(null);
	useEffect(() => {
		if (div) div.appendChild(app.canvas);
	}, [div]);
	return <div className="canvas-box" ref={setDiv} />
}