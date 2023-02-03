import { BaseScene } from "./BaseScene";
import { Music } from "./../components/Music";
import { Node } from "./../components/Node";


const DRAG_LIMIT = 70;


export class GameScene extends BaseScene {
	// public bg: Phaser.GameObjects.Image;
	private dragGraphics: Phaser.GameObjects.Graphics;
	private rootsGraphics: Phaser.GameObjects.Graphics;
	private nodes: Phaser.GameObjects.Image[];

	private currentNode: Node | null;
	private debugText: Phaser.GameObjects.Text;


	constructor() {
		super({key: "GameScene"});
	}

	create(): void {
		this.cameras.main.setBackgroundColor(0x222222);
		this.fade(false, 200, 0x000000);


		// Graphics
		this.dragGraphics = this.add.graphics();
		this.rootsGraphics = this.add.graphics();

		// Root nodes
		this.currentNode = null;
		this.nodes = [];
		this.addNode(this.CX, 0, true);


		// Input
		this.input.on('pointerup', this.onPointerUp, this);
		this.input.on('pointermove', this.onPointerMove, this);

		this.debugText = this.add.text(0, 0, 'hello', { fontFamily: 'Arial', fontSize: 32, color: '#FFFFFF' });
		this.debugText.setOrigin(0.5, 2.0);
	}


	update(time: number, delta: number) {
		this.nodes.forEach(node => {
			node.update(time, delta);
		});


		// Check mouse dragging
		const pointer = this.input.activePointer;

		// this.debugText.setPosition(pointer.x, pointer.y);

		if (this.currentNode && pointer.isDown) {
			const distance = Phaser.Math.Distance.BetweenPoints(this.currentNode, pointer);
			const start = new Phaser.Math.Vector2(this.currentNode.x, this.currentNode.y);
			const vector = new Phaser.Math.Vector2(pointer);
			vector.subtract(this.currentNode).limit(DRAG_LIMIT);
			const end = start.clone().add(vector);

			// this.debugText.setText(distance);
			if (distance > DRAG_LIMIT) {
				this.addConnection(end);
			}

			this.dragGraphics.clear();
			this.dragGraphics.lineStyle(5, 0xFF0000, 1.0);
			this.dragGraphics.beginPath();
			this.dragGraphics.moveTo(start.x, start.y);
			this.dragGraphics.lineTo(end.x, end.y);
			this.dragGraphics.closePath();
			this.dragGraphics.strokePath();
		}
	}


	addNode(x: number, y: number, root: boolean=false): Node {
		let node = new Node(this, x, y, root);
		node.setDepth(100);

		node.on("dragStart", this.onNodeDragStart, this);

		this.nodes.push(node);

		return node;
	}

	addConnection(position: Phaser.Math.Vector2) {
		const oldNode = this.currentNode;
		const newNode = this.addNode(position.x, position.y);
		newNode.addParent(oldNode);

		// Add growth score
		oldNode.addScore();

		this.drawRoot(newNode);

		this.currentNode = newNode;
	}

	drawRoot(node: Node) {
		if (node.parent) {
			this.rootsGraphics.lineStyle(5+node.score, 0x795548, 1.0);
			this.rootsGraphics.beginPath();
			this.rootsGraphics.moveTo(node.parent.x, node.parent.y);
			this.rootsGraphics.lineTo(node.x, node.y);
			this.rootsGraphics.closePath();
			this.rootsGraphics.strokePath();

			this.drawRoot(node.parent);
		}
	}


	onNodeDragStart(node: Node) {
		this.currentNode = node;
	}

	onPointerMove(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {}

	onPointerUp(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void {
		this.currentNode = null;
		this.dragGraphics.clear();
	}
}