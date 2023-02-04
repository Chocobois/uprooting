import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class Node extends Button {
	private image: Phaser.GameObjects.Image;

	public parent: Node | null;
	public children: Node[];
	public score: number;
	public rootDepth: number; // Distance from roots (number of linked parents)

	constructor(scene: BaseScene, x: number, y: number, root: boolean=false) {
		super(scene, x, y);
		this.scene.add.existing(this);

		this.parent = null;
		this.children = [];
		this.score = 1;
		this.rootDepth = 0;


		this.image = this.scene.add.image(0, 0, "circle");
		this.image.setScale((root ? 25 : 15)*this.scene.SCALE / this.image.width);
		this.add(this.image);

		this.bindInteractive(this.image, true);
		const inputPadding = 40*this.scene.SCALE / this.image.scaleX;
		this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);
		// this.scene.input.enableDebug(this.image);
	}

	update(time: number, delta: number) {
		if (this.image.input.enabled) {
			this.image.setTint(this.hover ? 0xFF7700 : 0xB99578);
		}
	}


	// setSize(size: number): void {
		// this.image.setScale(size / this.image.width);
	// }

	addParent(node: Node) {
		this.parent = node;
		this.parent.addChild(node);

		this.rootDepth = this.parent.rootDepth + 1; // Determine depth
	}

	addChild(node: Node) {
		this.children.push(node);

		// If a node has more than 2 children, disable node interaction
		if (this.children.length >= 2) {
			this.image.input.enabled = false;
			this.image.setTint(0xB99578);
			this.image.setAlpha(0.1);
		}
	}

	// Recursively add +1 to every parent node. Return total sum.
	addScore(): void {
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


	// How much does this node cost to expand from
	get cost() {
		return this.rootDepth;
	}
}