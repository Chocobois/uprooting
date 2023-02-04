import { BaseScene } from "./BaseScene";
import { Music } from "./../components/Music";
import { Node } from "./../components/Node";
import GetShortestDistance from "phaser/src/geom/line/GetShortestDistance";

const DRAG_LIMIT = 100;
const ANGLE_LIMIT = Math.PI/2;
const PROXIMITY_LIMIT = DRAG_LIMIT/5;

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

		this.tree = this.add.image(this.CX, this.CY+20, "sapling");
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
		const totalScore = this.nodes[0].score
		const treeSize = 100 + 1 * totalScore;
		this.tree.setScale(treeSize / this.tree.width);
		if (totalScore > 80) this.tree.setTexture("tree")
		else if (totalScore > 20) this.tree.setTexture("tree_little")


		// Check mouse dragging
		const pointer = new Phaser.Math.Vector2(this.input.activePointer.x, this.input.activePointer.y);
		pointer.y += this.cameras.main.scrollY;

		// this.debugText.setPosition(pointer.x, pointer.y);

		if (this.currentNode && this.input.activePointer.isDown) {
			const start = new Phaser.Math.Vector2(this.currentNode.x, this.currentNode.y);
			const next = this.nextNodePos(pointer);
			
			if (next) {
				this.addConnection(next);
			}

			const end = next ? next : start.clone().add(pointer.clone().subtract(this.currentNode).limit(DRAG_LIMIT));

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

	// Returns the position of next node to be created given the pointer's position
	// If one can't be created, null is returned
	nextNodePos(pointer: Phaser.Math.Vector2): Phaser.Math.Vector2 | null {
		if(!this.currentNode) return null;

		// Distance must be DRAG_LIMIT
		// Also, don't create anything if cursor is too far,
		// to prevent placing extra segments accidentally
		const distance = Phaser.Math.Distance.BetweenPoints(this.currentNode, pointer);
		if(distance < DRAG_LIMIT || distance >= DRAG_LIMIT*2) return null;


		const start = new Phaser.Math.Vector2(this.currentNode.x, this.currentNode.y);
		const vector = new Phaser.Math.Vector2(pointer);
		vector.subtract(this.currentNode).limit(DRAG_LIMIT);

		// Check angles
		const grandparent = this.currentNode.parent;
		if (grandparent) {
			const prev = new Phaser.Math.Vector2(grandparent.x, grandparent.y);
			prev.subtract(this.currentNode).negate();

			const cos = prev.dot(vector)/(prev.length()*vector.length());

			if(cos < Math.cos(ANGLE_LIMIT)) return null;
		}

		const end = start.clone().add(vector);

		// Check intersections and proximity (latter is not implemented yet)
		const line = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);

		const anyEncroaching = this.nodes.some(node => {
			if(!node.parent || node == this.currentNode || node.parent == this.currentNode) return false;

			const otherLine = new Phaser.Geom.Line(node.parent.x, node.parent.y, node.x, node.y);

			const intersects = Phaser.Geom.Intersects.LineToLine(line, otherLine);
			//const tooClose = GetShortestDistance(otherLine, end) <= PROXIMITY_LIMIT;

			return intersects;
		});

		if(anyEncroaching) return null;

		return end;
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