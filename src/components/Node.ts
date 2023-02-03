import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class Node extends Button {
	private image: Phaser.GameObjects.Image;

	public parent: Node | null;
	public score: number;

	constructor(scene: BaseScene, x: number, y: number, root: boolean=false) {
		super(scene, x, y);
		this.scene.add.existing(this);

		this.parent = null;
		this.score = 1;


		this.image = this.scene.add.image(x, y, "circle");
		this.setSize(root ? 40 : 10);

		this.bindInteractive(this.image, true);
		// const inputPadding = 1000;
		// this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);
		// this.scene.input.enableDebug(this.image);
	}

	update(time: number, delta: number) {
		this.image.setTint(this.hold ? 0xFF0000 : this.hover ? 0xFFFF00 : 0xFFFFFF);
	}


	setSize(size: number) {
		this.image.setScale(size / this.image.width);
	}

	addParent(node: Node) {
		this.parent = node;
	}

	addScore() {
		this.score += 1;
		if (this.parent) {
			this.parent.addScore();
		}
	}


	// onOut() {}
	// onOver() {}
	// onDown() {}
	// onUp() {}

	onDragStart(pointer, dragX, dragY) {
		this.emit("dragStart", this);
	}

	onDrag(pointer, dragX, dragY) {}

	onDragEnd(pointer, dragX, dragY, dropped) {}
}