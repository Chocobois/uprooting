import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class HarvestButton extends Button {
	private image: Phaser.GameObjects.Image;
	private text: Phaser.GameObjects.Text;

	private size: number;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene.add.existing(this);
		this.setDepth(1000);
		this.setScrollFactor(0);

		this.size = 0.2 * this.scene.W;

		// this.image = this.scene.add.image(0, 0, "surface_button");
		// this.image.setScale(this.size / this.image.width);
		// this.image.setTint(0x66BB6A);
		// this.image.setScrollFactor(0);
		// this.add(this.image);

		this.text = this.scene.createText(0, 0, 50, "#111", "Click the tree to harvest it");
		this.text.setOrigin(0.5);
		this.add(this.text);

		// this.bindInteractive(this.image, true);
		// const inputPadding = 40 / this.image.scaleX;
		// this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);

		this.hide();
	}

	update(time: number, delta: number) {
		// this.setScale(1.0 - 0.1 * this.holdSmooth);
	}


	show() {
		this.setVisible(true);
	}

	hide() {
		this.setVisible(false);
	}
}