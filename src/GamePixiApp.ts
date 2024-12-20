/// <reference path="../node_modules/vite/client.d.ts" />

import { Application, Container, Graphics, Ticker, Text, TextStyle } from 'pixi.js';
import { GameRPC, ROOM_EVENTS } from "./types.js";
import coinSoundSrc from "./res/coin.wav?url";
import tapSoundSrc from "./res/tap.wav?url";
import drumSoundSrc from "./res/drum.wav?url";

const SCALE = 10;
export async function GamePixiApp (rpc: GameRPC){
	const app = new Application();
	await app.init({ background: '#1099bb', width: 130 * SCALE, height: 63 * SCALE });
	const gameBoard = new rpc.GameBoard();
	
	const field = new Container({x: 65 * SCALE, y: 31 * SCALE});
	const ballContainer = new Container();
	const redDiscContainer = new Container();
	const blueDiscContainer = new Container();
	ballContainer.addChild(
		new Graphics().circle(0, 0, 2.5 * SCALE).fill("#80ff80").stroke({ width: 0.5 * SCALE, color: "#008000" }),
		new Graphics().circle(10, 10, 0.5 * SCALE).fill("#008000"),
	);
	redDiscContainer.addChild(
		new Graphics().circle(0, 0, 3 * SCALE).fill("#ff8080").stroke({ width: 0.5 * SCALE, color: "#800000" }),
		new Graphics().circle(0, 0, 2 * SCALE).fill("#800000")
	);
	blueDiscContainer.addChild(
		new Graphics().circle(0, 0, 3 * SCALE).fill("#8080ff").stroke({ width: 0.5 * SCALE, color: "#000080" }),
		new Graphics().circle(0, 0, 2 * SCALE).fill("#000080"),
	);
	
	const textStyle = new TextStyle({
		align: "left",
		fontSize: 10 * SCALE,
		fill: "#ffffff",
		stroke: { color: '#ccc', width: 2, join: 'round' },
		fontFamily: "monospace"
	})
	const redText = new Text({
		text: String(rpc.state[0]),
		style: textStyle,
		x: -30 * SCALE,
		y: -30 * SCALE,
		anchor: {x: 0.5, y: 0},
	});
	
	const blueText = new Text({
		text: String(rpc.state[0]),
		style: textStyle,
		x: 30 * SCALE,
		y: -30 * SCALE,
		anchor: {x: 0.5, y: 0},
	});
	
	rpc.on("state", () => {
		redText.text = String(rpc.state[0]);
		blueText.text = String(rpc.state[1]);
	})
	
	field.addChild(
		new Graphics().rect(-60 * SCALE, -30 * SCALE, 120 * SCALE, 60 * SCALE).stroke({ width: 2, color: "#000000" }), // border
		new Graphics().rect(-60 * SCALE, -30 * SCALE, 60 * SCALE, 60 * SCALE).fill("#ffd0d0"), // field-red
		new Graphics().rect(0, -30 * SCALE, 60 * SCALE, 60 * SCALE).fill("#d0d0ff"), // field-blue
		new Graphics().rect(-65 * SCALE, -10 * SCALE, 5 * SCALE, 20 * SCALE).fill("#ffffff"), // goal-red
		new Graphics().rect(60 * SCALE, -10 * SCALE, 5 * SCALE, 20 * SCALE).fill("#ffffff"), // goal-blue
		redText,
		blueText,
		ballContainer,
		redDiscContainer,
		blueDiscContainer,
	);
	app.stage.addChild(field);
	
	gameBoard.on(ROOM_EVENTS.COLLISION, (ballWithDisc) => {
		const audio  = new Audio(ballWithDisc ? drumSoundSrc : tapSoundSrc);
		audio.play();
		console.log("collision", {interactive: ballWithDisc});
	});
	
	gameBoard.on(ROOM_EVENTS.SCORE, (team) => {
		const audio  = new Audio(coinSoundSrc);
		audio.play();
		console.log("score", {team});
	});
	
	gameBoard.on("state", ([ballX, ballY, _ballVelX, _ballVelY, ballAngle, _ballAngleVel, redX, redY, blueX, blueY]) => {
		ballContainer.x = ballX * SCALE;
		ballContainer.y = ballY * SCALE;
		ballContainer.rotation = ballAngle;
		redDiscContainer.x = redX * SCALE;
		redDiscContainer.y = redY * SCALE;
		blueDiscContainer.x = blueX * SCALE;
		blueDiscContainer.y = blueY * SCALE;
	});
	
	Ticker.shared.add((ticker) => {
		const d = ticker.deltaTime/200;
		ballContainer.x += gameBoard.state[2]*SCALE * d;
		ballContainer.y += gameBoard.state[3]*SCALE * d;
		ballContainer.rotation += gameBoard.state[5] * d;
	});
	
	app.stage.on("destroyed", () => gameBoard.close())
	
	return app;
}