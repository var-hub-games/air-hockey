import { Board } from "./Board.js";
import RPCSource from "varhub:rpc";
import Players, { Player } from "varhub:players";
import room from "varhub:room";


const players = new Players(room, (con, ...args) => String(args[0]));

players.get("DPOHVAR")?.setTeam("red");
updateTeamsState();

function updateTeamsState(){
	const teamData = {} as Record<string, string>;
	for (let player of players) {
		if (player.team) teamData[player.name] = player.team;
	}
	RPCSource.default.setState(state => ({...state, teamData}))
}

//   ,----------------------,    field:  120 cm х 60 cm (20+20+20)
//   |          |           |    ball:   R = 5cm
// ,-|          |           |-,  disc:   R = 6cm
// | |          +           | |  disc move: x = 3..57 (+-30, dif 27), y= -27..27 (0, dif 27)
// `-|          |           |-`
//   |          |           |
//   `----------------------`
RPCSource.default.setState([0,0]);

export const GameBoard = Board.init();

export async function move(team: 0|1, x: number, y: number){
	(await GameBoard).move(team, x, y);
}
export const enum EVENTS {COLLISION}