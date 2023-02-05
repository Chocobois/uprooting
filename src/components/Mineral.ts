import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";
import { MineralType } from "./Underground";

export class Mineral extends Button {
	private image: Phaser.GameObjects.Image;
	private size: number;
	public spacingRadius: number; // Personal space
	public collisionRadius: number; // Personal space

	constructor(scene: BaseScene, x: number, y: number, type: MineralType, spacingRadius: number, collisionRadius: number) {
		super(scene, x, y);
		this.spacingRadius = spacingRadius;
		this.collisionRadius = collisionRadius;

		this.size = Phaser.Math.RND.between(60, 120) * this.scene.SCALE;
		// console.log(size);
		// this.size = size;

		// const key = Phaser.Math.RND.pick(["bone", "apple"]);
		// const key = Phaser.Math.RND.pick(["circle"]);
		this.image = this.scene.add.image(0, 0, type);
		this.image.setScale(this.size / this.image.width);
		this.image.setAngle(Phaser.Math.RND.between(0, 360));
		this.add(this.image);
		// this.scene.input.enableDebug(this.image);

		// this.bindInteractive(this.image, true);
		// const inputPadding = 40 / this.image.scaleX;
		// this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);
	}

	update(time: number, delta: number) {
		this.setScale(1.0 - 0.1 * this.holdSmooth);
	}
}