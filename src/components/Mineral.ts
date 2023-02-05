import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";
import { MineralType, MineralRange } from "./Underground";

export class Mineral extends Button {
	private image: Phaser.GameObjects.Image;
	private size: number;
	public type: MineralType;
	public properName: String;
	public spacingRadius: number; // Personal space
	public collisionRadius: number; // Personal space
	public collectible: boolean;
	public obstacle: boolean;
	public hardness: number;
	public points: number;

	constructor(scene: BaseScene, params: MineralRange, x: number, y: number) {
		super(scene, x, y);
		this.type = params.type;
		this.properName = params.properName;
		this.spacingRadius = params.spacingRadius;
		this.collisionRadius = params.collisionRadius;
		this.collectible = params.collectible;
		this.obstacle = false;
		this.hardness = params.hardness
		this.points = params.points || Math.round(params.centerDepth/100);

		this.size = params.collisionRadius*2;
		// console.log(size);
		// this.size = size;

		// const key = Phaser.Math.RND.pick(["bone", "apple"]);
		// const key = Phaser.Math.RND.pick(["circle"]);
		this.image = this.scene.add.image(0, 0, params.type);
		this.image.setScale(this.size / this.image.width);
		this.add(this.image);
		// this.scene.input.enableDebug(this.image);

		if (!params.noRotation) {
			this.image.setAngle(Phaser.Math.RND.between(0, 360));
		}

		// this.bindInteractive(this.image, true);
		// const inputPadding = 40 / this.image.scaleX;
		// this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);
	}

	update(time: number, delta: number) {
		this.setScale(1.0 - 0.1 * this.holdSmooth);
	}
}