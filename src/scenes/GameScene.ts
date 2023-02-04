import { BaseScene } from "./BaseScene";
import { Music } from "./../components/Music";
import { Node } from "./../components/Node";


const DRAG_LIMIT = 150;

enum MusicState {
	Nothing,
	NormalLoop,
	LayeredLoop,
	Jingle
}

const MUSIC_VOLUME = 0.4;


export class GameScene extends BaseScene {
	private background: Phaser.GameObjects.Image;
	private tree: Phaser.GameObjects.Image;

	private dragGraphics: Phaser.GameObjects.Graphics;
	private rootsGraphics: Phaser.GameObjects.Graphics;
	private nodes: Node[];

	private currentNode: Node | null;
	private debugText: Phaser.GameObjects.Text;
	private cameraDragArea: Phaser.GameObjects.Rectangle;

	// Music

	public musicMuted: boolean;
	public musicState: MusicState;
	public musicNormal: Music;
	public musicDrawing: Music;
	public musicJingle: Music;
	public musicVolume: number;

	constructor() {
		super({key: "GameScene"});
	}

	create(): void {
		this.cameras.main.setBackgroundColor(0x4FC3F7);
		this.fade(false, 200, 0x000000);


		// Camera management

		this.cameras.main.setBounds(0, 0, this.W, 10000);
		// this.cameras.main.setZoom(4);
		// this.cameras.main.centerOn(0, 0);

		this.cameraDragArea = this.add.rectangle(this.CX, this.CY, this.W, this.H, 0xFF0000, 0.0);
		this.cameraDragArea.setScrollFactor(0);
		this.cameraDragArea.setInteractive({ useHandCursor: true, draggable: true });
		// this.cameraDragArea.on('dragend', this.onDragEnd, this);
		this.cameraDragArea.on('drag', this.onDrag, this);
		// this.cameraDragArea.on('dragstart', this.onDragStart, this);


		// Background

		this.background = this.add.image(this.CX, this.CY, "underground");
		this.background.setOrigin(0.5, 0);
		this.background.setScale(1*this.W / this.background.width);
		// this.fitToScreen(this.background);

		this.tree = this.add.image(this.CX, this.CY+20, "tree");
		this.tree.setOrigin(0.5, 1.0);
		this.tree.setScale(100 / this.tree.width);


		// Graphics

		this.dragGraphics = this.add.graphics();
		this.rootsGraphics = this.add.graphics();


		// Root nodes

		this.currentNode = null;
		this.nodes = [];
		this.addNode(this.CX, this.CY+30, true);

		// Music
		this.musicMuted = false; // TODO: Link up to mute button
		this.musicVolume = MUSIC_VOLUME;
		this.musicState = MusicState.Nothing;
		
		this.musicJingle?.stop()

		this.musicNormal = new Music(this, 'm_first', { volume: this.musicMuted ? 0 : this.musicVolume });
		this.musicDrawing = new Music(this, 'm_first_draw', { volume: 0 });
		this.musicJingle = new Music(this, 'm_first_end', { volume: this.musicMuted ? 0 : this.musicVolume });
		
		this.musicNormal.play();
		this.musicDrawing.play();
		this.musicState = MusicState.NormalLoop;

		// Input

		this.input.on("pointerup", this.onPointerUp, this);
		this.input.on("wheel", this.onScroll, this);

		this.debugText = this.add.text(0, 0, "hello", { fontFamily: "Arial", fontSize: "32px", color: "#FFFFFF" });
		// this.debugText.setOrigin(0.5, 2.0);
	}


	update(time: number, delta: number) {
		this.nodes.forEach(node => {
			node.update(time, delta);
		});

		// Todo: Move this elsewhere
		const treeSize = 100 + 1 * this.nodes[0].score;
		this.tree.setScale(treeSize / this.tree.width);


		// Check mouse dragging
		const pointer = new Phaser.Math.Vector2(this.input.activePointer.x, this.input.activePointer.y);
		pointer.y += this.cameras.main.scrollY;

		// this.debugText.setPosition(pointer.x, pointer.y);

		if (this.currentNode && this.input.activePointer.isDown) {
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

		// Update music based on if the player is drawing a line

		this.musicDrawing.volume = this.musicMuted ? 0 : (
			(this.musicState == MusicState.LayeredLoop) ? this.musicVolume : 0.00001
		)
	}


	addNode(x: number, y: number, root: boolean=false): Node {
		let node = new Node(this, x, y, root);
		node.setDepth(100);

		node.on("dragStart", this.onNodeDragStart, this);

		this.nodes.push(node);

		return node;
	}

	addConnection(position: Phaser.Math.Vector2) {
		if (!this.currentNode) { return; }

		const oldNode = this.currentNode;
		const newNode = this.addNode(position.x, position.y);
		newNode.addParent(oldNode);

		// Add growth score
		oldNode.addScore();

		this.drawRoot(newNode);

		this.currentNode = newNode;
	}

	drawRoot(node: Node) {
		if (!node.parent) { return; }

		const thickness = 3 + 4 * Math.sqrt(node.score);
		this.rootsGraphics.lineStyle(thickness, 0x795548, 1.0);
		this.rootsGraphics.beginPath();
		this.rootsGraphics.moveTo(node.parent.x, node.parent.y);
		this.rootsGraphics.lineTo(node.x, node.y);
		this.rootsGraphics.closePath();
		this.rootsGraphics.strokePath();

		this.drawRoot(node.parent);
	}


	onNodeDragStart(node: Node) {
		this.currentNode = node;
		this.musicState = MusicState.LayeredLoop;
	}

	onPointerUp(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void {
		this.currentNode = null;
		this.dragGraphics.clear();
		this.musicState = MusicState.NormalLoop;
	}

	onScroll(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) {
		this.cameras.main.scrollY += deltaY;
	}

	// onDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {}
	onDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) {
		this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
		this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
	}
	// onDragStart(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {}
}