export class DevicePointerEvent extends Event {
	constructor(
		public readonly pointer: DevicePointer,
		public readonly x: number,
		public readonly y: number
	) {
		super("point");
	}
}

export class DevicePointer extends EventTarget {
	
	#fixA = 0; // 0 - 360
	#fixB = 0; // -180 - 180
	#fixG = 0; // -90 - 90
	
	x = 0;
	y = 0;
	
	#lastData: [number, number, number] = [0, 0, 0]
	readonly #controlDeg: number;
	
	constructor(controlDeg = 30) {
		super();
		this.#controlDeg = controlDeg;
		window.addEventListener("deviceorientation", this.#handleEvent)
	}
	
	#handleEvent = (event: DeviceOrientationEvent) => {
		const alpha = event.alpha || 0;
		const beta = event.beta || 0;
		const gamma = event.gamma || 0;
		this.#lastData = [alpha, beta, gamma];
		this.#update();
	}
	
	reset([a, b, g] = this.#lastData) {
		this.#fixA = a;
		this.#fixB = b;
		this.#fixG = g;
		this.#update();
	}
	
	#update(){
		const [alpha, beta, gamma] = this.#lastData;
		let a = (alpha - this.#fixA + 360) % 360;
		const b = (beta - this.#fixB + 360 + 180) % 360 - 180;
		const g = (gamma - this.#fixG + 180 + 90) % 180 - 90;
		if (b < -90 || b > 90) a = (a + 180) % 360;
		let dx = (a + 180) % 360 - 180;
		if (dx < -this.#controlDeg) dx = -this.#controlDeg;
		if (dx > this.#controlDeg) dx = this.#controlDeg;
		let dy = b;
		if (dy < -this.#controlDeg) dy = -this.#controlDeg;
		if (dy > this.#controlDeg) dy = this.#controlDeg;
		const x = -dx / this.#controlDeg;
		const y = dy / this.#controlDeg;
		const hasChanges = this.x !== x || this.y !== y;
		this.x = x;
		this.y = y;
		if (hasChanges) this.dispatchEvent(new DevicePointerEvent(this, x, y));
	}
	
	declare addEventListener: (
		type: "point",
		callback: ((event: DevicePointerEvent) => void) | ({ handleEvent(object: DevicePointerEvent): void}) | null,
		options?: AddEventListenerOptions | boolean
	) => void
	
	dispose(){
		return this[Symbol.dispose]();
	}
	
	#disposed = false;
	
	get disposed() {
		return this.#disposed;
	}
	
	[Symbol.dispose](){
		window.removeEventListener("deviceorientation", this.#handleEvent);
		this.#disposed = true;
	}
}