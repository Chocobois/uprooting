import { BaseScene } from "../scenes/BaseScene";
import { Mineral } from "./Mineral";

export class Underground extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private items: Mineral[];


	constructor(scene: BaseScene, surfaceY: number, bedrockY: number) {
		super(scene);
		this.scene = scene;
		this.scene.add.existing(this);

		this.items = [];


		const padding = 100;
		const left = padding;
		const right = this.scene.W - padding;
		const top = surfaceY + padding;
		const bottom = bedrockY - padding;

		for (let i = 0; i < 50; i += 1) {
			this.addMineral(
				left + (right - left) * Math.random(),
				top + (bottom - top) * Math.random(),
			);
		}
	}

	update(time: number, delta: number) {
		this.items.forEach(item => {
			item.update(time, delta);
		});
	}


	addMineral(x: number, y: number) {
		let mineral = new Mineral(this.scene, x, y);

		this.add(mineral);
		this.items.push(mineral);
	}
}