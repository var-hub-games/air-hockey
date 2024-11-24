import RPCSource from "varhub:rpc";
import * as RAPIER from "https://cdn.skypack.dev/@dimforge/rapier2d-compat";
import { ROOM_EVENTS } from "./types.js";

//   ,----------------------,    field:  120 cm х 60 cm (20+20+20)
//   |          |           |    ball:   R = 5cm
// ,-|          |           |-,  disc:    R = 6cm
// | |          +           | |  disc move: x = 3..57 (+-30, dif 27), y= -27..27 (0, dif 27)
// `-|          |           |-`
//   |          |           |
//   `----------------------`

/////////////////////

export type BoardState = [
	ballX: number, ballY: number,
	ballVelX: number, ballVelY: number,
	ballAngle: number,
	ballAngleVel: number,
	redDiscRelX: number, redDiscRelY: number,
	blueDiscRelX: number, blueDiscRelY: number,
]
export class Board extends RPCSource.with({}, [0,0,0,0,0,0,-30,0,30,0] as BoardState)<{[ROOM_EVENTS.COLLISION]: [boolean]}> {
	world: RAPIER.World;
	ball: RAPIER.RigidBody;
	redDisc: RAPIER.RigidBody;
	blueDisc: RAPIER.RigidBody;
	redPoint: RAPIER.RigidBody;
	bluePoint: RAPIER.RigidBody;
	ballColliderHandle: number;
	redColliderHandle: number;
	blueColliderHandle: number;

	private constructor() {
		super();
		
		// world
		const world = this.world = new RAPIER.World({x: 0, y: 0});
		
		// colliders
		world.createCollider(RAPIER.ColliderDesc.cuboid(2000, 200).setTranslation(0, -230).setRestitution(1).setFriction(0))
		world.createCollider(RAPIER.ColliderDesc.cuboid(2000, 200).setTranslation(0, 230).setRestitution(1).setFriction(0))
		world.createCollider(RAPIER.ColliderDesc.cuboid(200, 2000).setTranslation(-260, 2000+10).setRestitution(1).setFriction(0))
		world.createCollider(RAPIER.ColliderDesc.cuboid(200, 2000).setTranslation(-260, -2000-10).setRestitution(1).setFriction(0))
		world.createCollider(RAPIER.ColliderDesc.cuboid(200, 2000).setTranslation(260, 2000+10).setRestitution(1).setFriction(0))
		world.createCollider(RAPIER.ColliderDesc.cuboid(200, 2000).setTranslation(260, -2000-10).setRestitution(1).setFriction(0))
		
		const jointData = RAPIER.JointData.rope(0.1, {x: 0, y: 0}, {x: 0, y: 0});
		
		// ball
		this.ball = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0).setCcdEnabled(true));
		const ballCollider = world.createCollider(RAPIER.ColliderDesc.ball(5 / 2).setMass(5).setRestitution(1).setFriction(0), this.ball)
		ballCollider.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS);
		this.ballColliderHandle = ballCollider.handle;
		
		// redDisc
		this.redDisc = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-20, 0).setCcdEnabled(true));
		const redCollider = world.createCollider(RAPIER.ColliderDesc.ball(6 / 2).setMass(15).setRestitution(0.7), this.redDisc);
		redCollider.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS );
		this.redColliderHandle = redCollider.handle;
		
		const redPoint = this.redPoint = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-20, 20).setAdditionalMass(Number.MAX_SAFE_INTEGER));
		world.createImpulseJoint(jointData, this.redDisc, redPoint, true);
		
		// blueDisc
		this.blueDisc = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(20, 0).setCcdEnabled(true));
		const blueCollider = world.createCollider(RAPIER.ColliderDesc.ball(6 / 2).setMass(15).setRestitution(0.7), this.blueDisc)
		blueCollider.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS );
		this.blueColliderHandle = blueCollider.handle
		
		const bluePoint = this.bluePoint = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(20, 20).setAdditionalMass(Number.MAX_SAFE_INTEGER));
		world.createImpulseJoint(jointData, bluePoint, this.blueDisc, true);
		
		// start
		this.loop();
	}
	
	move(team: 0 | 1, dx: number, dy: number) {
		if (dx < -1 || dx > 1 || dy < -1 || dy > 1) throw new Error("wrong position");
		const point = team ? this.bluePoint : this.redPoint;
		const x = (27 * dx) + (30 * (team ? 1 : -1));
		const y = dy * 27;
		const stateCopy = this.state.slice(0) as BoardState;
		if (team) {
			stateCopy[8] = x;
			stateCopy[9] = y;
		} else {
			stateCopy[6] = x;
			stateCopy[7] = y;
		}
		this.setState(stateCopy);
		point.setTranslation({x, y}, true);
	}
	
	loop() {
		if (this.disposed) return;
		let eventQueue = new RAPIER.EventQueue(true);
		this.world.step(eventQueue);
		eventQueue.drainContactForceEvents((event) => {
			const handle1 = event.collider1();
			const handle2 = event.collider2();
			const {x, y} = event.totalForce();
			const forcePow = x*x + y*y;
			if (forcePow < 1000000) return;
			const handles = [handle1, handle2];
			const gameColliders = [this.ballColliderHandle, this.redColliderHandle, this.blueColliderHandle];
			const ballCollision = handles.includes(this.ballColliderHandle);
			if (gameColliders.includes(handle1) || gameColliders.includes(handle2)) {
				this.emit(ROOM_EVENTS.COLLISION, ballCollision);
			}
			if (handles.includes(this.redColliderHandle)) {
				(RPCSource.default as any).emit(ROOM_EVENTS.COLLISION, 0)
			}
			if (handles.includes(this.blueColliderHandle)) {
				(RPCSource.default as any).emit(ROOM_EVENTS.COLLISION, 1)
			}
		})
		this.updateBallState();
		this.checkWin();
		setTimeout(() => this.loop(), 10);
	}
	
	checkWin(){
		const {x} = this.ball.translation();
		if (x < -62 || x > 62) {
			let [redScore, blueScore] = RPCSource.default.state;
			if (x < -62) blueScore = (blueScore ?? 0) + 1;
			if (x > 62) redScore = (redScore ?? 0) + 1;
			RPCSource.default.setState([redScore ?? 0, blueScore ?? 0]);
			this.ball.setTranslation({x: 0, y: -10000}, true);
			this.ball.setLinvel({x: 0, y: 0}, true);
			this.ball.setAngvel(0, true);
			setTimeout(() => {
				this.ball.setTranslation({x: 0, y: -10 + 20*Math.random() }, true);
			}, 3000);
		}
	}
	
	updateBallState() {
		const {x, y} = this.ball.translation();
		const {x: velX, y: velY} = this.ball.linvel();
		const rot = this.ball.rotation();
		const angVel = this.ball.angvel();
		const stateSlice = this.state.slice(6);
		this.setState([x, y, velX, velY, rot, angVel, ...stateSlice] as BoardState);
	}
	
	dispose(reason?: any) {
		super.dispose(reason);
		this.world.free();
	}
	
	static async init(){
		await RAPIER.init();
		return new Board();
	}
}