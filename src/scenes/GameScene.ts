import { BaseScene } from "./BaseScene";
import { Music } from "./../components/Music";
import { Particles } from "./../components/Particles";
import { Node } from "./../components/Node";
import { Tree } from "./../components/Tree";
import { Underground } from "./../components/Underground";
import { Mineral } from "./../components/Mineral";
import { SurfaceButton } from "./../components/SurfaceButton";
import { HarvestButton } from "./../components/HarvestButton";
import GetShortestDistance from "phaser/src/geom/line/GetShortestDistance";
import { MiniButton } from "../components/MiniButton";
import { Shop, ItemType, ItemData } from "../components/Shop";
import { TextParticle, TextParticleEffects } from "../components/TextParticle";
import { HUD } from "../components/HUD";


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
	Shop,
	Jingle
}

enum InvalidNodeReason {
	ProgrammerGoofed = "golen or hex made an oopsie",
	AboveSurface = "Wrong way!",
	TooDeep = "Root is too deep!",
	TurnTooHarsh = "Root turns too harshly!",
	SelfIntersecting = "Root self intersects!",
	TooClose = "Roots are too close together!",
	ObstacleInTheWay = "Root is obstructed!",
	Unaffordable = "Not enough energy!"
}

interface CameraBounds {
	left: number;
	top: number;
	width: number;
	height: number;
}

const MUSIC_VOLUME = 0.4;

export class GameScene extends BaseScene {
	// Gameplay state, see enum above
	private state: GameState;

	private background: Phaser.GameObjects.Image;
	private overworld: Phaser.GameObjects.Image;
	private overworldBush: Phaser.GameObjects.Image;
	private undergroundEdge: Phaser.GameObjects.Image;

	// Tree
	private tree: Tree;
	private currentNode: Node | null;
	private nodes: Node[];
	private deepestNodeY: number;

	private dragPos: Phaser.Math.Vector2;
	private validDrawing: boolean;

	// Graphics for roots. Should be replaced as it's very inefficient.
	private dragGraphics: Phaser.GameObjects.Graphics;
	private rootsGraphics: Phaser.GameObjects.Graphics;

	// Manages item spawns underground
	private underground: Underground;
	private shop: Shop;
	private hud: HUD;
	public money: number;

	// UI
	private returnToSurfaceButton: SurfaceButton;
	private harvestButton: HarvestButton;
	private musicButton: MiniButton;
	private audioButton: MiniButton;
	private timeScrolling: number;
	private scrolling: boolean;

	// Debug
	private debugText: Phaser.GameObjects.Text;
	private cameraDragArea: Phaser.GameObjects.Rectangle;
	private cameraSmoothY: number;
	private cameraBounds: CameraBounds;

	// Particles
	public particles: Particles;
	public textParticles: TextParticle;

	// Music
	public musicMuted: boolean;
	public musicState: MusicState;
	public musicNormal: Music;
	public musicDrawing: Music;
	public musicJingle: Music;
	public musicShop: Music;
	public musicVolume: number;

	// Feel free to edit this ts declaration, it's supposed to be a k-v pair object
	private oneTimeEvents: Record<string, boolean>;

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.cameras.main.setBackgroundColor(0);
		this.fade(false, 200, 0x000000);

		this.state = GameState.GrowingRoots;


		// Camera management

		this.cameraDragArea = this.add.rectangle(this.CX, this.CY, this.W, this.H, 0xFF0000, 0.0);
		this.cameraDragArea.setScrollFactor(0);
		this.cameraDragArea.setInteractive({ cursor: "ns-resize", draggable: true });
		this.cameraDragArea.on('drag', this.onCameraDrag, this);

		this.setCameraBounds(0, 0, this.W, this.H);
		this.cameraSmoothY = 0;


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

		// Money
		this.money = 0;

		this.hud = new HUD(this);

		this.shop = new Shop(this, 0.2 * this.W, this.SURFACE_Y+192*this.SCALE);
		this.shop.on("open", () => {
			this.cameras.main.scrollY = 0;
			this.cameraSmoothY = 0;

			if (this.state == GameState.GrowingRoots) {
				this.shop.open();
				this.state = GameState.InsideShop;
				this.musicState = MusicState.Shop;
				this.musicNormal.stop();
				this.musicDrawing.stop();
				this.musicShop.play();
			}
		});
		this.shop.on("close", () => {
			this.state = GameState.GrowingRoots;
			
			this.musicShop.stop();
			this.sound.play("m_shop", {
				name: "shopEnding",
				start: 3308100/48000, // 495095
				duration: 1,
				config: { volume: this.musicShop.volume }
			})
			
			setTimeout(() => {
				this.musicState = MusicState.NormalLoop;
				this.musicNormal.play();
				this.musicDrawing.play();
			}, 1300);
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

		this.undergroundEdge = this.add.image(this.CX, this.cameraBounds.height, "underground_edge");
		this.undergroundEdge.setOrigin(0.5, 1.0);
		this.undergroundEdge.setScrollFactor(1);
		this.fitToScreen(this.undergroundEdge);


		// The underground mineral spawner
		this.underground = new Underground(this, this.SURFACE_Y, this.BEDROCK_Y);
		this.undergroundEdge.setDepth(this.underground.depth + 1)


		// Tree

		this.tree = new Tree(this, this.CX, this.SURFACE_Y);
		this.tree.on("levelUp", this.onTreeLevelUp, this);
		this.tree.on("click", this.onTreeClick, this);


		// Graphics

		this.rootsGraphics = this.add.graphics();
		this.dragGraphics = this.add.graphics();
		this.textParticles = new TextParticle(this);


		// Root nodes

		this.currentNode = null;
		this.deepestNodeY = 0;
		this.nodes = [];
		this.addNode(this.CX, this.SURFACE_Y + 10*this.SCALE, true);
		this.dragPos = new Phaser.Math.Vector2(this.nodes[0].x, this.nodes[0].y);

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
				this.musicShop.mute = !this.musicShop.mute;
			});

		this.audioButton = new MiniButton(this, this.W - buttonSize, 1.5 * buttonSize, "audio")
			.on("click", () => {
				this.audioButton.toggle();
				this.sound.mute = !this.audioButton.active;
			})

		this.scrolling = false;
		this.timeScrolling = 0;

		// Music

		this.musicMuted = false; // TODO: Link up to mute button
		this.sound.mute = false; // TODO: Link up to SFX button
		this.musicVolume = MUSIC_VOLUME;
		this.musicState = MusicState.Nothing;

		this.musicJingle?.stop()

		this.musicNormal = new Music(this, 'm_first', { volume: this.musicMuted ? 0 : this.musicVolume });
		this.musicDrawing = new Music(this, 'm_first_draw', { volume: 0 });
		this.musicJingle = new Music(this, 'm_first_end', { volume: this.musicMuted ? 0 : this.musicVolume });
		this.musicShop = new Music(this, 'm_shop', { volume: 0 });

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
		this.debugText.setVisible(false);


		// Events

		this.oneTimeEvents = {
			growthStage1Sound: false,
			growthStage2Sound: false,
			wrongPlacementSound: false,
			outOfEnergy: false,
			spawnShop: false,
		}


		this.updateScore()
	}


	update(time: number, delta: number) {

		// Smooth camera movement
		if (this.state == GameState.GrowingRoots) {
			this.cameras.main.scrollY += 0.3 * (this.cameraSmoothY - this.cameras.main.scrollY);
		}

		// Update game objects
		this.particles.update(time, delta);
		this.textParticles.update(time, delta);
		this.underground.update(time, delta);
		this.shop.update(time, delta);
		this.hud.update(time, delta, this.money, this.tree.energy, this.tree.maxEnergy);
		this.tree.update(time, delta);
		this.nodes.forEach(node => {
			node.update(time, delta);
		});
		this.returnToSurfaceButton.update(time, delta);
		this.updateMusic(time, delta);

		if(this.scrolling) {
			this.timeScrolling += delta;
		} else {
			this.timeScrolling = 0;
		}

		// Debug, move this to some ui thing
		this.debugText.setText(`State: ${this.state}\nEnergy: ${this.tree.energy}/${this.tree.maxEnergy}`);

		if (this.state == GameState.GrowingRoots) {
			// Move camera with mouse input
			this.handleCameraMovement();

			this.handleRootDrawing(delta);
		}
	}


	updateMusic(time, delta /* , newState?: MusicState */ ) {

		/* if (newState) this.musicState = newState; */

		switch (this.musicState) {
			case MusicState.NormalLoop:
			case MusicState.LayeredLoop:

				this.musicNormal.volume = this.musicMuted ? 0 : this.musicVolume;
				this.musicShop.volume = 0;

				// Update music based on if the player is drawing a line

				const targetVolume = this.musicMuted ? 0 : (
					(this.musicState == MusicState.LayeredLoop) ? this.musicVolume : 0.00001
				)

				const volumeSame = Math.abs(this.musicDrawing.volume - targetVolume) <= 1e-4;

				if (!volumeSame) {
					const volumeStep = (this.musicDrawing.volume < targetVolume) ? 1 : -1;
					this.musicDrawing.volume += (volumeStep / delta) / 5;
				}

				else if (this.musicDrawing.volume < 0) { this.musicDrawing.volume = 0; }

				// If the drawing music plays for a split second after starting the game, it's an autoplay issue	

				break;
		
			case MusicState.Shop:

				this.musicNormal.volume = 0;
				this.musicDrawing.volume = 0;
				this.musicShop.volume = this.musicMuted ? 0 : (this.musicVolume * 0.3);

				break;

			case MusicState.Jingle:
				break;

			case MusicState.Nothing:
			default:
				break;
		}
	}


	setCameraBounds(left: number, top: number, width: number, height: number) {
		this.cameraBounds = {
			left: left,
			top: top,
			width: width,
			height: height,
		};
		this.cameras.main.setBounds(left, top, width, height);
	}

	handleCameraMovement() {
		// Only allow touch camera movement during node drawing
		if (!this.currentNode) { return; }

		const pointer = this.input.activePointer;
		const upperArea = 0.10 * this.H; // Upper 10% of the screen
		const lowerArea = 0.70 * this.H; // Lower 40% of the screen
		const maxScrollSpeed = 20;

		const timeFactor = 1 - 1/(this.timeScrolling/1200+1);

		// If pointer at the top of the screen, move camera upwards
		if (pointer.y < upperArea && this.validDrawing) {
			const factor = 1 - pointer.y / upperArea;
			this.moveSmoothCamera(- maxScrollSpeed * factor * timeFactor * this.SCALE);
			this.scrolling = true;
		}
		// If pointer at the bottom of the screen, move camera downwards
		else if (pointer.y > lowerArea) { // this.validDrawing
			let factor = (pointer.y - lowerArea) / (this.H - lowerArea);
			factor = Math.pow(factor, 0.5);
			this.moveSmoothCamera(maxScrollSpeed * factor * timeFactor * this.SCALE);
			this.scrolling = true;
		}
		else {
			this.scrolling = false;
		}
	}

	moveSmoothCamera(dy: number) {
		this.cameraSmoothY += dy;
		this.cameraSmoothY = Phaser.Math.Clamp(this.cameraSmoothY, this.cameraBounds.top, this.cameraBounds.top + this.cameraBounds.height - this.H);
	}

	setDeepestNode(y: number) {
		if (y == 0) { this.deepestNodeY = 0; }
		this.deepestNodeY = Math.max(y, this.deepestNodeY);
		this.setCameraBounds(0, 0, this.W, this.deepestNodeY + 0.6 * this.H);
		// this.undergroundEdge.setY(this.cameraBounds.height);
		this.tweens.addCounter({
			from: this.undergroundEdge.y,
			to: Math.max(this.cameraBounds.height, 1.5*this.H),
			duration: 500,
			ease: "Quad",
			onUpdate: (tween) => this.undergroundEdge.setY(tween.getValue())
		});
		// this.setCameraBounds(0, 0, this.W, 100000);
		// this.cameras.main.setBounds(-0.5*this.W, -this.H, 2*this.W, 1000000);
	}

	returnToSurface() {
		this.state = GameState.ReturningToSurfaceCutscene;
		this.returnToSurfaceButton.hide();
		this.cameraSmoothY = 0;

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
		this.oneTimeEvents.growthStage1Sound = false;
		this.oneTimeEvents.growthStage2Sound = false;

		if (!this.oneTimeEvents.spawnShop) {
			this.oneTimeEvents.spawnShop = true;
			this.shop.activateOverworldShop();
		}

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
		this.underground.reset();
		this.updateScore();
	}

	handleMineralCollection(minerals: Mineral[]) {
		const collectibles = minerals.filter(mineral => mineral.collectible);
		this.underground.destroyMinerals(collectibles);

		collectibles.forEach(collectible => {
			this.textParticle(collectible.x, collectible.y-10, "Lime", `+1 ${collectible.properName}`, true,
			250*this.SCALE, 2, this.textParticles.DEAFULT_EFFECTS_HALF);
		});
	}

	textParticle(x: number, y: number, color: string, content: string, outline: boolean=true, size: number=40,
		duration: number=1.5, effects: TextParticleEffects={ wave: {enable: true}, fadeOut: {enable: true} }) {

		const text = this.createText(x, y, size*this.SCALE, color, content);
		if(outline) text.setStroke("rgba(0,0,0,0.5)", 30);

		// Prevent text from going too far right
		const right = text.getRightCenter().x;
		const diff = this.W - right - 20;
		if(diff < 0) text.setX(text.x+diff);

		this.textParticles.push(text, duration, effects);
	}

	/* Tree */

	handleRootDrawing(delta: number) {
		const pointer = new Phaser.Math.Vector2(this.input.activePointer.x, this.input.activePointer.y);
		pointer.y += this.cameras.main.scrollY;

		if (this.currentNode && this.input.activePointer.isDown) {
			const start = new Phaser.Math.Vector2(this.currentNode.x, this.currentNode.y);
			const nextPosResult = this.nextNodePos(pointer);
			const next = nextPosResult instanceof Phaser.Math.Vector2 ? nextPosResult : null;

			// Distance must be DRAG_LIMIT
			const distance = Phaser.Math.Distance.BetweenPoints(this.currentNode, pointer);
			const canDraw = distance >= this.DRAG_LIMIT;

			const end = next ? next : start.clone().add(pointer.clone().subtract(this.currentNode).limit(this.DRAG_LIMIT));
			const extended = end.distance(this.dragPos) < 4;

			// Check minerals
			const line = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);
			const mineralIntersects = this.underground.getIntersectedMinerals(line);
			const touchingObstacle = mineralIntersects.some(mineral => mineral.obstacle);
			const canAfford = this.tree.energy > this.currentNode.cost;
			this.validDrawing = !!next && !touchingObstacle && canAfford;

			const invalidReason = nextPosResult instanceof Phaser.Math.Vector2
				? touchingObstacle
					? InvalidNodeReason.ObstacleInTheWay
					: canAfford
						? InvalidNodeReason.ProgrammerGoofed // shouldn't get here
						: InvalidNodeReason.Unaffordable
				: nextPosResult;

			this.dragPos = this.dragPos.lerp(end, delta/100);

			if (this.tree.energy > this.currentNode.cost) {
				if (next && this.validDrawing && canDraw) {
					this.addConnection(next);
					this.dragPos = new Phaser.Math.Vector2(next.x, next.y);
					this.handleMineralCollection(mineralIntersects);
				}
			}
			else if (!this.oneTimeEvents.outOfEnergy) {
				this.oneTimeEvents.outOfEnergy = true;
				this.returnToSurfaceButton.show();
			}

			const limitReached = !this.validDrawing && canDraw;

			if (limitReached && !this.oneTimeEvents.wrongPlacementSound) {
				this.oneTimeEvents.wrongPlacementSound = true;
				this.sound.play("r_place_error", { volume: 0.25 });

				this.textParticle(pointer.x, pointer.y-10, "OrangeRed", invalidReason,
					undefined, 200 * this.SCALE, 3, this.textParticles.DEAFULT_EFFECTS_HALF);

			} else if (!limitReached) {
				this.oneTimeEvents.wrongPlacementSound = false;
			}

			this.dragGraphics.clear();
			this.dragGraphics.lineStyle(5*this.SCALE, this.validDrawing ? 0x00FF00 : 0xFF0000, 1.0);
			this.dragGraphics.beginPath();
			this.dragGraphics.moveTo(start.x, start.y);
			this.dragGraphics.lineTo(this.dragPos.x, this.dragPos.y);
			this.dragGraphics.closePath();
			this.dragGraphics.strokePath();
		}
	}

	// Returns the position of next node to be created given the pointer's position
	// If one can't be created, null is returned
	nextNodePos(pointer: Phaser.Math.Vector2): Phaser.Math.Vector2 | InvalidNodeReason {
		if (!this.currentNode) return InvalidNodeReason.ProgrammerGoofed;

		// Can't be above ground very far
		if (pointer.y < this.SURFACE_Y) return InvalidNodeReason.AboveSurface;

		const start = new Phaser.Math.Vector2(this.currentNode.x, this.currentNode.y);
		const vector = new Phaser.Math.Vector2(pointer);
		vector.subtract(this.currentNode).limit(this.DRAG_LIMIT);

		// Check angles
		const grandparent = this.currentNode.parent;
		if (grandparent) {
			const prev = new Phaser.Math.Vector2(grandparent.x, grandparent.y);
			prev.subtract(this.currentNode).negate();

			const cos = prev.dot(vector) / (prev.length() * vector.length());

			if (cos < Math.cos(this.ANGLE_LIMIT)) return InvalidNodeReason.TurnTooHarsh;
		}

		const end = start.clone().add(vector);

		// Check intersections
		const line = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);

		const intersecting = this.nodes.some(node => {
			if (!node.parent || node == this.currentNode || node.parent == this.currentNode) return false;

			const otherLine = new Phaser.Geom.Line(node.parent.x, node.parent.y, node.x, node.y);

			return Phaser.Geom.Intersects.LineToLine(line, otherLine);
		});

		if (intersecting) return InvalidNodeReason.SelfIntersecting;

		// Check proximity
		const tooClose = this.nodes.some(node => {
			if (!node.parent || node == this.currentNode) return false;

			const otherLine = new Phaser.Geom.Line(node.parent.x, node.parent.y, node.x, node.y);
			const distances = otherLine.getPoints(0, 0.25).map(point => new Phaser.Math.Vector2(point.x, point.y).distance(end));

			const dist = distances.reduce((a,c) => Math.min(a,c), Infinity);

			return dist <= this.PROXIMITY_LIMIT;
		});

		if (tooClose) return InvalidNodeReason.TooClose;

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

		this.textParticle(newNode.x+5, newNode.y-5, "Yellow", `-${newNode.rootDepth}`, undefined, 150 * this.SCALE);

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
		if (this.state == GameState.GrowingRoots || this.state == GameState.HarvestingTree) {
			this.moveSmoothCamera(-this.cameraSmoothY);

			this.tree.harvestCount -= 1;
			this.money += this.totalScore;

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
		this.dragPos = new Phaser.Math.Vector2(node.x, node.y);
		this.musicState = MusicState.LayeredLoop;
		this.oneTimeEvents.wrongPlacementSound = false;
	}

	onPointerUp(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void {
		this.currentNode = null;
		this.dragGraphics.clear();
		if (this.state != GameState.InsideShop) this.musicState = MusicState.NormalLoop;
	}

	onScroll(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) {
		if (this.state != GameState.GrowingRoots) { return; }

		this.moveSmoothCamera(deltaY * this.SCALE);
	}

	onCameraDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) {
		if (this.state != GameState.GrowingRoots) { return; }

		this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
		this.moveSmoothCamera(-(pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom);

	}


	get SCALE() {
		return this.H / 1080;
	}

	get DRAG_LIMIT() {
		return 0.1 * this.H;
	}

	get ANGLE_LIMIT() {
		return 0.7*Math.PI;
	}

	get PROXIMITY_LIMIT() {
		return this.DRAG_LIMIT/4;
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