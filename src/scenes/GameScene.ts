import { BaseScene } from "./BaseScene";
import { Music } from "./../components/Music";
import { Node } from "./../components/Node";
import { Tree } from "./../components/Tree";
import GetShortestDistance from "phaser/src/geom/line/GetShortestDistance";

const DRAG_LIMIT = 100;
const ANGLE_LIMIT = Math.PI/2;
const PROXIMITY_LIMIT = DRAG_LIMIT/5;
const MIN_Y = 590;

enum MusicState {
	Nothing,
	NormalLoop,
	LayeredLoop,
	Jingle
}

const MUSIC_VOLUME = 0 * 0.4;

export class GameScene extends BaseScene {
	private background: Phaser.GameObjects.Image;

	private tree: Tree;

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

	// Feel free to edit this ts declaration, it's supposed to be a k-v pair object
	private oneTimeEvents: Record<string, boolean>;

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

		this.tree = new Tree(this, this.CX, this.CY+20);
		this.tree.on("levelUp", this.onTreeLevelUp, this);


		// Graphics

		this.rootsGraphics = this.add.graphics();
		this.dragGraphics = this.add.graphics();


		// Root nodes

		this.currentNode = null;
		this.nodes = [];
		this.addNode(this.CX, this.CY+30, true);


		// Music

		this.musicMuted = false; // TODO: Link up to mute button
		this.sound.mute = false; // TODO: Link up to SFX button
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


		// Debug

		this.debugText = this.createText(0, 0, 40, "#000", "Debug text");
		this.debugText.setStroke("#FFF", 5);
		this.debugText.setScrollFactor(0);


		// Events

		this.oneTimeEvents = {
			growthStage1Sound: false,
			growthStage2Sound: false,
			wrongPlacementSound: false,
		}
	}


	update(time: number, delta: number) {

		// Update game objects
		this.tree.update(time, delta);
		this.nodes.forEach(node => {
			node.update(time, delta);
		});

		// Pass score to tree
		this.tree.setTreeScore(this.totalScore);
		this.debugText.setText(`Energy: ${this.tree.energy}`);


		// Check mouse dragging
		const pointer = new Phaser.Math.Vector2(this.input.activePointer.x, this.input.activePointer.y);
		pointer.y += this.cameras.main.scrollY;

		// this.debugText.setPosition(pointer.x, pointer.y);

		if (this.currentNode && this.input.activePointer.isDown) {
			const start = new Phaser.Math.Vector2(this.currentNode.x, this.currentNode.y);
			const next = this.nextNodePos(pointer);

			// Distance must be DRAG_LIMIT
			// Also, don't create anything if cursor is too far,
			// to prevent placing extra segments accidentally
			const distance = Phaser.Math.Distance.BetweenPoints(this.currentNode, pointer);
			const canDraw = distance >= DRAG_LIMIT && distance <DRAG_LIMIT*2;

			this.dragGraphics.clear();
			this.dragGraphics.lineStyle(5, next ? 0x00FF00 : 0xFF0000, 1.0);
			
			if (this.tree.energy > this.currentNode.cost) {
				if (next && canDraw) {
					this.addConnection(next);
				}
			}

			const end = next ? next : start.clone().add(pointer.clone().subtract(this.currentNode).limit(DRAG_LIMIT));

			const limitReached = !next && Math.abs(start.distance(end) - DRAG_LIMIT) < 1e-10;

			if (limitReached && !this.oneTimeEvents.wrongPlacementSound) {
				this.oneTimeEvents.wrongPlacementSound = true;
				this.sound.play("r_place_error", { volume: 0.25 });
			} else if (!limitReached) {
				this.oneTimeEvents.wrongPlacementSound = false;
			}

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

		// Can't be above ground very far
		if(pointer.y < MIN_Y) return null;

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
		this.tree.energy -= newNode.rootDepth;

		this.drawRoot(newNode);

		this.sound.play("r_place", { volume: 0.3, rate: 1 + Math.random() * 0.1 });

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

	onTreeLevelUp(level: number) {
		if (level == 1) {
			if (!this.oneTimeEvents.growthStage1Sound) {
				this.oneTimeEvents.growthStage1Sound = true;
				this.sound.play("r_grow", { volume: 0.3, rate: 1.25 });
			}
		}

		if (level == 2) {
			if (!this.oneTimeEvents.growthStage2Sound) {
				this.oneTimeEvents.growthStage2Sound = true;
				this.sound.play("r_grow", { volume: 0.4, rate: 1.00 });
			}
		}
	}


	onNodeDragStart(node: Node) {
		this.currentNode = node;
		this.musicState = MusicState.LayeredLoop;
		this.oneTimeEvents.wrongPlacementSound = false;
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


	get totalScore() {
		return this.nodes[0].score;
	}
}