import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class Node extends Button {
	private image: Phaser.GameObjects.Image;

	public parent: Node | null;
	public children: Node[];
	public score: number;

	constructor(scene: BaseScene, x: number, y: number, root: boolean=false) {
		super(scene, x, y);
		this.scene.add.existing(this);

		this.parent = null;
		this.children = [];
		this.score = 1;


		this.image = this.scene.add.image(x, y, "circle");
		this.image.setScale((root ? 25 : 15) / this.image.width);

		this.bindInteractive(this.image, true);
		const inputPadding = 40 / this.image.scaleX;
		this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);
		// this.scene.input.enableDebug(this.image);
	}

	update(time: number, delta: number) {
		if (this.image.input.enabled) {
			this.image.setTint(this.hold ? 0xFF0000 : this.hover ? 0xFF7700 : 0xFFFFFF);
		}
	}


	// setSize(size: number): void {
		// this.image.setScale(size / this.image.width);
	// }

	addParent(node: Node) {
		this.parent = node;
		this.parent.addChild(node);
	}

	addChild(node: Node) {
		this.children.push(node);

		// If a node has more than 2 children, disable node interaction
		if (this.children.length >= 2) {
			this.image.input.enabled = false;
			this.image.setTint(0xFFFFFF);
			this.image.setAlpha(0.3);
		}
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