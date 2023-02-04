import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class Mineral extends Button {
	private image: Phaser.GameObjects.Image;
	private size: number;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);

		this.size = 80;

		const key = Phaser.Math.RND.pick(["bone", "apple"]);
		this.image = this.scene.add.image(x, y, key);
		this.image.setAngle(Phaser.Math.RND.between(0, 360));

		// this.bindInteractive(this.image, true);
		// const inputPadding = 40 / this.image.scaleX;
		// this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);
	}

	update(time: number, delta: number) {
		const scale = 1.0 - 0.1 * this.holdSmooth;
		this.image.setScale(scale * this.size / this.image.width);
	}
}