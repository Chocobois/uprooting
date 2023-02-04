import { BaseScene } from "./BaseScene";
import { Music } from "./../components/Music";
import { Particles } from "./../components/Particles";
import { Node } from "./../components/Node";
import { Tree } from "./../components/Tree";
import { Underground } from "./../components/Underground";
import { SurfaceButton } from "./../components/SurfaceButton";
import { HarvestButton } from "./../components/HarvestButton";
import GetShortestDistance from "phaser/src/geom/line/GetShortestDistance";
import { MiniButton } from "../components/MiniButton";
import { Shop, ItemType, ItemData } from "../components/Shop";


enum GameState {
	None = "None",
	GrowingRoots = "Growing roots",
	ReturningToSurfaceCutscene = "Returning to surface cutscene",
	HarvestingTree = "Harvesting tree",
	HarvestCompleteCutscene = "Harvest complete cutscene",
	SomeOtherCutsceneIdk = "Some other cutscene idk",
	InsideShop = "Inside shop",
}

enum MusicState {
	Nothing,
	NormalLoop,
	LayeredLoop,
	Jingle
}

const MUSIC_VOLUME = 0.4;

export class GameScene extends BaseScene {
	// Gameplay state, see enum above
	private state: GameState;

	private background: Phaser.GameObjects.Image;
	private overworld: Phaser.GameObjects.Image;
	private overworldBush: Phaser.GameObjects.Image;

	// Tree
	private tree: Tree;
	private currentNode: Node | null;
	private nodes: Node[];
	private deepestNodeY: number;

	private lastPos: Phaser.Math.Vector2;

	// Graphics for roots. Should be replaced as it's very inefficient.
	private dragGraphics: Phaser.GameObjects.Graphics;
	private rootsGraphics: Phaser.GameObjects.Graphics;

	// Manages item spawns underground
	private underground: Underground;
	private shop: Shop;

	// UI
	private returnToSurfaceButton: SurfaceButton;
	private harvestButton: HarvestButton;
	private musicButton: MiniButton;
	private audioButton: MiniButton;

	// Debug
	private debugText: Phaser.GameObjects.Text;
	private cameraDragArea: Phaser.GameObjects.Rectangle;

	// Particles
	public particles: Particles;

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
		super({ key: "GameScene" });
	}

	create(): void {
		this.cameras.main.setBackgroundColor(0x4FC3F7);
		this.fade(false, 200, 0x000000);

		this.state = GameState.GrowingRoots;


		// Camera management

		this.cameras.main.setBounds(0, 0, this.W, this.H);
		this.cameraDragArea = this.add.rectangle(this.CX, this.CY, this.W, this.H, 0xFF0000, 0.0);
		this.cameraDragArea.setScrollFactor(0);
		this.cameraDragArea.setInteractive({ useHandCursor: true, draggable: true });
		this.cameraDragArea.on('drag', this.onCameraDrag, this);


		// Background

		this.overworld = this.add.image(this.CX, this.SURFACE_Y + 10*this.SCALE, "overworld");
		this.overworld.setOrigin(0.5, 1.0);
		this.overworld.setScrollFactor(0.3);
		this.fitToScreen(this.overworld);

		this.overworldBush = this.add.image(this.CX, this.SURFACE_Y + 10*this.SCALE, "overworld_bush");
		this.overworldBush.setOrigin(0.5, 1.0);
		this.overworldBush.setScrollFactor(0.8);
		this.fitToScreen(this.overworldBush);

		// this.fitToScreen(this.background);

		this.underground = new Underground(this, this.SURFACE_Y, this.BEDROCK_Y);

		this.shop = new Shop(this, 0.2 * this.W, this.SURFACE_Y+192*this.SCALE );
		this.shop.on("open", () => {
			this.cameras.main.scrollY = 0;

			if (this.state == GameState.GrowingRoots) {
				this.shop.open();
				this.state = GameState.InsideShop;
			}
		});
		this.shop.on("close", () => {
			this.state = GameState.GrowingRoots;
		});
		this.shop.on("buy", (itemData: ItemData) => {
			if (itemData.type == ItemType.TreeEnergy) {
				this.tree.addMaxEnergy(100);
			}
			// Add more shop item mechanics...
			// Or break up into more emits
		});


		// Underground
		this.background = this.add.image(this.CX, this.SURFACE_Y - 20*this.SCALE, "underground");
		this.background.setOrigin(0.5, 0);
		this.background.setScale(2 * this.W / this.background.width);

		// Tree

		this.tree = new Tree(this, this.CX, this.SURFACE_Y);
		this.tree.on("levelUp", this.onTreeLevelUp, this);
		this.tree.on("click", this.onTreeClick, this);


		// Graphics

		this.rootsGraphics = this.add.graphics();
		this.dragGraphics = this.add.graphics();


		// Root nodes

		this.currentNode = null;
		this.deepestNodeY = 0;
		this.nodes = [];
		this.addNode(this.CX, this.SURFACE_Y + 10*this.SCALE, true);
		this.lastPos = new Phaser.Math.Vector2(this.nodes[0].x, this.nodes[0].y);

		// Particles

		this.particles = new Particles(this);
		this.particles.setDepth(100);


		// UI

		this.returnToSurfaceButton = new SurfaceButton(this, this.CX, .1 * this.H);
		this.returnToSurfaceButton.on("click", this.returnToSurface, this);

		this.harvestButton = new HarvestButton(this, this.CX, 0.4*this.H);
		// this.harvestButton.on("click", this.onHarvestComplete, this);

		const buttonSize = 35*this.SCALE;
		this.musicButton = new MiniButton(this, this.W - 3.5 * buttonSize, 1.5 * buttonSize, "music")
			.on("click", () => {
				this.musicButton.toggle();
				this.musicMuted = !this.musicMuted;
				this.musicNormal.mute = !this.musicNormal.mute;
				this.musicDrawing.mute = !this.musicDrawing.mute;
				this.musicJingle.mute = !this.musicJingle.mute;
			});

		this.audioButton = new MiniButton(this, this.W - buttonSize, 1.5 * buttonSize, "audio")
			.on("click", () => {
				this.audioButton.toggle();
				this.sound.mute = !this.audioButton.active;
			})


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

		this.debugText = this.createText(0, 0, 60*this.SCALE, "#000", "Debug text");
		// this.debugText.setStroke("#000", 1*this.SCALE);
		this.debugText.setLineSpacing(0);
		this.debugText.setScrollFactor(0);
		this.debugText.setDepth(1000000);


		// Events

		this.oneTimeEvents = {
			growthStage1Sound: false,
			growthStage2Sound: false,
			wrongPlacementSound: false,
			outOfEnergy: false,
		}


		this.updateScore()
	}


	update(time: number, delta: number) {

		// Update game objects
		this.particles.update(time, delta);
		this.underground.update(time, delta);
		this.shop.update(time, delta);
		this.tree.update(time, delta);
		this.nodes.forEach(node => {
			node.update(time, delta);
		});
		this.returnToSurfaceButton.update(time, delta);

		// Debug, move this to some ui thing
		this.debugText.setText(`State: ${this.state}\nEnergy: ${this.tree.energy}/${this.tree.maxEnergy}`);


		if (this.state == GameState.GrowingRoots) {
			// Move camera with mouse input
			this.moveCamera();

			this.handleRootDrawing(delta);
		}

		// Update music based on if the player is drawing a line

		const targetVolume = this.musicMuted ? 0 : (
			(this.musicState == MusicState.LayeredLoop) ? this.musicVolume : 0.00001
		)

		const volumeSame = Math.abs(this.musicDrawing.volume - targetVolume) <= 1e-4;

		if (!volumeSame) {
			const volumeStep = (this.musicDrawing.volume < targetVolume) ? 1 : -1;
			this.musicDrawing.volume += (volumeStep / delta) / 5;
		}
		
		else if (this.musicDrawing.volume < 0) this.musicDrawing.volume = 0;

		// If the drawing music plays for a split second after starting the game, it's an autoplay issue
	}


	moveCamera() {
		// Only allow touch camera movement during node drawing
		if (!this.currentNode) { return; }

		const pointer = this.input.activePointer;
		const upperArea = 0.10 * this.H; // Upper 10% of the screen
		const lowerArea = this.H - 0.30 * this.H; // Lower 30% of the screen
		const maxScrollSpeed = 20;

		// If pointer at the top of the screen, move camera upwards
		if (pointer.y < upperArea) {
			const factor = 1 - pointer.y / upperArea;
			this.cameras.main.scrollY -= maxScrollSpeed * factor * this.SCALE;
		}
		// If pointer at the bottom of the screen, move camera downwards
		if (pointer.y > lowerArea) {
			const factor = (pointer.y - lowerArea) / (this.H - lowerArea);
			this.cameras.main.scrollY += maxScrollSpeed * factor * this.SCALE;
		}
	}

	setDeepestNode(y: number) {
		if (y == 0) { this.deepestNodeY = 0; }
		this.deepestNodeY = Math.max(y, this.deepestNodeY);
		this.cameras.main.setBounds(0, 0, this.W, this.deepestNodeY + 0.6 * this.H);
	}

	returnToSurface() {
		this.state = GameState.ReturningToSurfaceCutscene;
		this.returnToSurfaceButton.hide();

		// Smooth camera transition
		this.tweens.addCounter({
			from: this.cameras.main.scrollY,
			to: 0,
			duration: 1000,
			ease: 'Quad',
			onUpdate: (tween) => {
				this.cameras.main.scrollY = tween.getValue();
			},
			onComplete: () => {
				this.state = GameState.HarvestingTree;

				// Reset camera limits
				this.setDeepestNode(0);

				this.harvestButton.show();
			}
		});
	}

	onHarvestComplete() {
		this.state = GameState.GrowingRoots;
		this.oneTimeEvents.outOfEnergy = false;

		// Add current score to growth
		// Should be a whole sequence here instead and the shop thing, etc
		this.tree.addMaxEnergy(this.totalScore);

		// Destroy all nodes
		this.currentNode = null;
		this.nodes.forEach(node => {
			node.destroy();
		});
		this.nodes = [];

		this.dragGraphics.clear();
		this.rootsGraphics.clear();
		this.harvestButton.hide();


		// Restart tree
		this.addNode(this.CX, this.SURFACE_Y + 10, true);
		this.tree.reset();
		this.updateScore();
	}


	/* Tree */

	handleRootDrawing(delta: number) {
		const pointer = new Phaser.Math.Vector2(this.input.activePointer.x, this.input.activePointer.y);
		pointer.y += this.cameras.main.scrollY;

		if (this.currentNode && this.input.activePointer.isDown) {
			const start = new Phaser.Math.Vector2(this.currentNode.x, this.currentNode.y);
			const next = this.nextNodePos(pointer);

			if( next ) {
				const nextPos = new Phaser.Math.Vector2(next.x, next.y);
				this.lastPos = this.lastPos.lerp(nextPos, delta/100);
			}

			// Distance must be DRAG_LIMIT
			// Also, don't create anything if cursor is too far,
			// to prevent placing extra segments accidentally
			const distance = Phaser.Math.Distance.BetweenPoints(this.currentNode, pointer);
			const canDraw = distance >= this.DRAG_LIMIT;

			this.dragGraphics.clear();
			this.dragGraphics.lineStyle(5*this.SCALE, next ? 0x00FF00 : 0xFF0000, 1.0);

			const end = next ? next : start.clone().add(pointer.clone().subtract(this.currentNode).limit(this.DRAG_LIMIT));
			const extended = end.distance(this.lastPos) < 4;

			if (this.tree.energy > this.currentNode.cost) {
				if (next && canDraw) {
					this.addConnection(next);
					this.lastPos = new Phaser.Math.Vector2(next.x, next.y);
				}
			}
			else if (!this.oneTimeEvents.outOfEnergy) {
				this.oneTimeEvents.outOfEnergy = true;
				this.returnToSurfaceButton.show();
			}

			const limitReached = !next && Math.abs(start.distance(end) - this.DRAG_LIMIT) < 1e-10;

			if (limitReached && !this.oneTimeEvents.wrongPlacementSound) {
				this.oneTimeEvents.wrongPlacementSound = true;
				this.sound.play("r_place_error", { volume: 0.25 });
			} else if (!limitReached) {
				this.oneTimeEvents.wrongPlacementSound = false;
			}

			this.dragGraphics.beginPath();
			this.dragGraphics.moveTo(start.x, start.y);
			this.dragGraphics.lineTo(this.lastPos.x, this.lastPos.y);
			this.dragGraphics.closePath();
			this.dragGraphics.strokePath();
		}
	}

	// Returns the position of next node to be created given the pointer's position
	// If one can't be created, null is returned
	nextNodePos(pointer: Phaser.Math.Vector2): Phaser.Math.Vector2 | null {
		if (!this.currentNode) return null;

		// Can't be above ground very far
		if (pointer.y < this.SURFACE_Y) return null;

		const start = new Phaser.Math.Vector2(this.currentNode.x, this.currentNode.y);
		const vector = new Phaser.Math.Vector2(pointer);
		vector.subtract(this.currentNode).limit(this.DRAG_LIMIT);

		// Check angles
		const grandparent = this.currentNode.parent;
		if (grandparent) {
			const prev = new Phaser.Math.Vector2(grandparent.x, grandparent.y);
			prev.subtract(this.currentNode).negate();

			const cos = prev.dot(vector) / (prev.length() * vector.length());

			if (cos < Math.cos(this.ANGLE_LIMIT)) return null;
		}

		const end = start.clone().add(vector);

		// Check intersections and proximity (latter is not implemented yet)
		const line = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);

		const anyEncroaching = this.nodes.some(node => {
			if (!node.parent || node == this.currentNode || node.parent == this.currentNode) return false;

			const otherLine = new Phaser.Geom.Line(node.parent.x, node.parent.y, node.x, node.y);

			const intersects = Phaser.Geom.Intersects.LineToLine(line, otherLine);
			//const tooClose = GetShortestDistance(otherLine, end) <= PROXIMITY_LIMIT;

			return intersects;
		});

		if (anyEncroaching) return null;

		return end;
	}

	addNode(x: number, y: number, root: boolean = false): Node {
		let node = new Node(this, x, y, root);
		node.setDepth(100);

		node.on("dragStart", this.onNodeDragStart, this);

		this.nodes.push(node);
		this.setDeepestNode(node.y);

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

		this.updateScore();
	}

	drawRoot(node: Node) {
		if (!node.parent) { return; }

		const thickness = (3 + 4 * Math.sqrt(node.score)) * this.SCALE;
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

	onTreeClick() {
		if (this.state == GameState.HarvestingTree) {
			this.tree.harvestCount -= 1;

			this.particles.createGreenMagic(this.tree.x, this.tree.y - 150*this.SCALE, 3*this.SCALE, 1.0, false);

			if (this.tree.harvestCount <= 0) {
				this.particles.createExplosion(this.tree.x, this.tree.y - 100*this.SCALE, 2*this.SCALE, 1.0, false);
				this.onHarvestComplete();
			}
		}
	}

	updateScore() {
		// Pass score to tree
		this.tree.setTreeScore(this.totalScore);
	}


	/* Input */

	onNodeDragStart(node: Node) {
		this.currentNode = node;
		this.lastPos = new Phaser.Math.Vector2(node.x, node.y);
		this.musicState = MusicState.LayeredLoop;
		this.oneTimeEvents.wrongPlacementSound = false;
	}

	onPointerUp(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void {
		this.currentNode = null;
		this.dragGraphics.clear();
		this.musicState = MusicState.NormalLoop;
	}

	onScroll(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) {
		if (this.state != GameState.GrowingRoots) { return; }

		this.cameras.main.scrollY += deltaY * this.SCALE;
	}

	onCameraDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) {
		if (this.state != GameState.GrowingRoots) { return; }

		this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
		this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;

	}


	get SCALE() {
		return this.H / 1080;
	}

	get DRAG_LIMIT() {
		return 0.1 * this.H;
	}

	get ANGLE_LIMIT() {
		return Math.PI / 2;
	}

	get PROXIMITY_LIMIT() {
		return this.DRAG_LIMIT / 5;
	}


	get SURFACE_Y() {
		return 0.8 * this.H;
	}

	get BEDROCK_Y() {
		return 10000; // Fix
	}

	get totalScore() {
		return this.nodes[0].score;
	}
}