import { BaseScene } from "./BaseScene";
import { Music } from "./../components/Music";
import { Particles } from "./../components/Particles";
import { Node } from "./../components/Node";
import { Tree } from "./../components/Tree";
import { Underground, MineralType, ComboClass } from "./../components/Underground";
import { Mineral } from "./../components/Mineral";
import { SurfaceButton } from "./../components/SurfaceButton";
import { HarvestButton } from "./../components/HarvestButton";
import { LimitBreakButton } from "./../components/LimitBreakButton";
import { ZombieButton } from "./../components/ZombieButton";
import GetShortestDistance from "phaser/src/geom/line/GetShortestDistance";
import { MiniButton } from "../components/MiniButton";
import { Shop, ItemType, ItemData } from "../components/Shop";
import { TextParticle, TextParticleEffects } from "../components/TextParticle";
import { HUD } from "../components/HUD";


enum GameState {
	None = "None",

	Overworld = "Overworld",
	GrowingRoots = "Growing roots",
	HarvestingTree = "Harvesting tree",
	InsideShop = "Inside shop",

	CutsceneToSurface = "Cutscene to surface",
	CutsceneToUnderground = "Cutscene to underground",

	EndGame = "A winner is you"
}

enum MusicState {
	Nothing = "Initial",
	NormalLoop = "Overground",
	LayeredLoop = "Drawing roots",
	Shop = "Shop",
	Jingle = "Jingle",
}

enum InvalidNodeReason {
	ProgrammerGoofed = "golen or hex made an oopsie",
	AboveSurface = "Wrong way!",
	TooDeep = "Root is too deep!",
	TurnTooHarsh = "Root turns too harshly!",
	SelfIntersecting = "Root self intersects!",
	TooClose = "Roots are too close together!",
	ObstacleInTheWay = "Root is obstructed!",
	Unaffordable = "Not enough resources!"
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
	private _state: GameState;

	private overworld: Phaser.GameObjects.Image;
	private overworldBush: Phaser.GameObjects.Image;

	public backgrounds: Phaser.GameObjects.Image[];
	// private background: Phaser.GameObjects.Image;
	private undergroundEdge: Phaser.GameObjects.Image;

	// Tree
	public tree: Tree;
	private firstNode: Node | null;
	private secondNode: Node | null;
	private currentNode: Node | null;
	private nodes: Node[];
	private deepestNodeY: number;

	private dragPos: Phaser.Math.Vector2;
	private validDrawing: boolean;

	// Graphics for roots. Should be replaced as it's very inefficient.
	private dragGraphics: Phaser.GameObjects.Graphics;
	private rootsBackGraphics: Phaser.GameObjects.Graphics;
	private rootsFrontGraphics: Phaser.GameObjects.Graphics;

	// Manages item spawns underground
	private underground: Underground;
	private shop: Shop;
	private hud: HUD;
	public money: number;
	public score: number;

	// UI
	private surfaceButton: SurfaceButton;
	private limitBreakButton: LimitBreakButton;
	private zombieButton: ZombieButton;
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

	public titleMusic: Music;

	// Feel free to edit this ts declaration, it's supposed to be a k-v pair object
	private oneTimeEvents: Record<string, boolean>;

	constructor() {
		super({ key: "GameScene" });
	}

	init(previousMusic): void {
		this.titleMusic = previousMusic;
	}

	create(): void {
		this.cameras.main.setBackgroundColor(0);
		this.fade(false, 200, 0x000000);


		// Camera management

		this.cameraDragArea = this.add.rectangle(this.CX, this.CY, this.W, this.H, 0xFF0000, 0.0);
		this.cameraDragArea.setScrollFactor(0);
		this.cameraDragArea.setInteractive({ cursor: "pointer", draggable: true });
		this.cameraDragArea.on('drag', this.onCameraDrag, this);

		this.cameraSmoothY = 0;


		// Background

		this.overworld = this.add.image(this.CX, 0, "overworld");
		this.overworld.setOrigin(0.5, 0.0);
		this.overworld.setScrollFactor(0.1);
		this.fitToScreen(this.overworld);

		this.overworldBush = this.add.image(this.CX, this.SURFACE_Y - 50*this.SCALE, "overworld_bush");
		this.overworldBush.setOrigin(0.5);
		this.overworldBush.setAlpha(0.8);
		this.overworldBush.setScrollFactor(0.5);
		this.containToScreen(this.overworldBush);

		// this.fitToScreen(this.background);

		// Money
		this.money = 0;
		this.score = 0;

		this.hud = new HUD(this);
		//this.hud.on("limitbreakend", this.hud.toggleShadow, this);


		this.shop = new Shop(this, 0.2 * this.W, this.SURFACE_Y+192*this.SCALE);
		this.shop.on("open", () => {
			// Only allow shop to be opened during overworld scene
			if (this.state == GameState.Overworld) {
				// Ensure camera is at 0, since shop is an overlay
				this.cameras.main.scrollY = 0;
				this.cameraSmoothY = 0;

				this.shop.open();
				this.state = GameState.InsideShop;
				this.limitBreakButton.hide();
				this.zombieButton.hide();
				this.hud.hideScore();
				this.hud.hideBombs();

				this.musicState = MusicState.Shop;
				this.musicNormal.stop();
				this.musicDrawing.stop();
				this.musicJingle.stop();
				this.musicShop.play();
			}
		});
		this.shop.on("close", () => {
			this.state = GameState.Overworld;
			this.hud.showScore();
			this.hud.showBombs();
			if(this.tree.limitBreak)
			{
				this.limitBreakButton.show();
			}
			if(this.tree.canZombie)
			{
				this.zombieButton.show();
			}
			// this.hud.showEnergy();

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
			///clear chains if you buy stuff
			this.tree.clearActiveChains();
			this.parseItemFunction(itemData);
			// Add more shop item mechanics...
			// Or break up into more emits
		});


		// Underground
		this.backgrounds = [
			this.add.image(this.CX, this.CY, "underground"),
			this.add.image(this.CX, this.CY, "underground_2"),
			this.add.image(this.CX, this.CY, "underground_3"),
			this.add.image(this.CX, this.CY, "underground_4"),
		]; this.backgrounds.forEach((background, i) => {
			const bgScale = 2 * this.W / background.width;
			background.setOrigin(0.5, 0);
			background.setScale(bgScale);
			background.setY(this.SURFACE_Y - 20*this.SCALE + (background.height * bgScale) * i);
		})

		this.undergroundEdge = this.add.image(this.CX, 1.5*this.H, "underground_edge");
		this.undergroundEdge.setOrigin(0.5, 1.0);
		this.undergroundEdge.setScrollFactor(1);
		this.fitToScreen(this.undergroundEdge);


		// The underground mineral spawner
		this.underground = new Underground(this, this.SURFACE_Y, this.BELOW_SURFACE_Y, this.BEDROCK_Y);
		this.undergroundEdge.setDepth(this.underground.depth + 1)


		// Tree

		this.tree = new Tree(this, this.TREE_X, this.SURFACE_Y);
		this.tree.on("levelUp", this.onTreeLevelUp, this);
		this.tree.on("click", this.onTreeClick, this);


		// Graphics

		this.rootsBackGraphics = this.add.graphics();
		this.rootsFrontGraphics = this.add.graphics();
		this.dragGraphics = this.add.graphics();
		this.rootsBackGraphics.setAlpha(0.8);
		// this.rootsBackGraphics.setBlendMode(Phaser.BlendModes.ADD);

		this.textParticles = new TextParticle(this);


		// Root nodes

		this.currentNode = null;
		this.deepestNodeY = 0;
		this.nodes = [];


		// Particles

		this.particles = new Particles(this);
		this.particles.setDepth(100);


		// UI

		this.surfaceButton = new SurfaceButton(this);
		this.surfaceButton.on("click", () => {
			if (this.state == GameState.GrowingRoots) {
				this.startCutsceneToSurface();
			}
			else if (this.state == GameState.Overworld) {
				this.startCutsceneToUnderground();
			}
		}, this);
		this.surfaceButton.show(false, true);


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
				this.sound.play("s_click");
			});

		this.audioButton = new MiniButton(this, this.W - buttonSize, 1.5 * buttonSize, "audio")
			.on("click", () => {
				this.audioButton.toggle();
				this.sound.mute = !this.audioButton.active;
			})

		this.limitBreakButton = new LimitBreakButton(this, this.W*0.95, this.H*0.75);
		this.limitBreakButton.on("click", this.toggleLimitBreak, this);

		this.zombieButton = new ZombieButton(this, this.W*0.95, this.H*0.6);
		this.zombieButton.on("click", this.toggleZombie, this);

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

		if ("titleMusic" in this.scene.settings.data) {
			// @ts-ignore-start
			const titleMusic: Music = this.scene.settings.data.titleMusic;
			this.musicNormal.setSeek(titleMusic.currentTime);
			this.musicDrawing.setSeek(titleMusic.currentTime);
			titleMusic.stop();
			// @ts-ignore-end
		}


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
			wrongPlacementSound: false,
			outOfEnergy: false,
			spawnShop: false,
		}


		// Init

		this.state = GameState.Overworld;
		this.updateScore();

		this.addFirstNode();
		this.dragPos = new Phaser.Math.Vector2(this.nodes[0].x, this.nodes[0].y);
	}


	update(time: number, delta: number) {

		// This is actually possible now. Could be optimized if it's called whenever camera is moved. Still, it's cheap enough now.
		this.drawAllRoots();

		// Debug
		this.debugText.setText(`${this.state}`);

		// Smooth camera movement
		if (this.state == GameState.GrowingRoots || this.state == GameState.Overworld) {
			this.cameras.main.scrollY += 0.3 * (this.cameraSmoothY - this.cameras.main.scrollY);
		}
		this.undergroundEdge.y = Math.max(this.undergroundEdge.y, this.cameras.main.scrollY + this.H);


		// Update game objects
		this.particles.update(time, delta);
		this.textParticles.update(time, delta);
		this.underground.update(time, delta);
		this.shop.update(time, delta);
		this.hud.update(time, delta, this.money, this.tree.energy, this.tree.maxEnergy, this.score, this.tree.bruteness, this.tree.persistence);
		this.tree.update(time, delta);
		if (this.tree.updateLimitBreak(delta) == 2)
		{
			this.hud.toggleShadow();
			this.limitBreakButton.advance();
			this.sound.play("r_unlimitbreak");
		} //extreme hax
		this.nodes.forEach(node => {
			node.update(time, delta);
		});
		this.surfaceButton.update(time, delta);
		this.limitBreakButton.update(time, delta, this.tree.percent);
		this.zombieButton.update(this.score);
		this.updateMusic(time, delta);

		if(this.scrolling) {
			this.timeScrolling += delta;
		} else {
			this.timeScrolling = 0;
		}

		// Debug, move this to some ui thing

		if (this.state == GameState.GrowingRoots) {
			// Move camera with mouse input
			this.handleCameraMovement();

			this.handleRootDrawing(delta);
			this.debugText.setText(`State: ${this.state}`);

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
				[this.musicNormal, this.musicDrawing].forEach(music => {
					music.volume -= (1 / delta) / 2;
					if (music.volume <= 0) {
						music.volume = 0;
						music.stop();
					}
				})
				break;

			case MusicState.Nothing:
			default:
				break;
		}
	}


	updateCameraBounds() {
		let left, top, width, height;

		left = 0;
		top = 0;
		width = this.W;
		height = this.H;

		if (this.state == GameState.GrowingRoots) {
			top = this.BELOW_SURFACE_Y;
			// height = this.deepestNodeY + 0.6 * this.H;
			height = this.deepestNodeY + 1 * this.H;
		}
		else if (this.state == GameState.Overworld) {
			top = 0;
			height = this.H;
		}
		else if (this.state == GameState.CutsceneToSurface || this.state == GameState.CutsceneToUnderground) {
			top = 0;
			height = 100000000;
		}
		// else if (this.state == GameState.) {
		// }

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
		this.updateCameraBounds();

		if (this.state == GameState.GrowingRoots) {
			this.surfaceButton.show(true, false);
		}
	}

	startCutsceneToSurface() {
		this.sound.play("s_click");
		this.state = GameState.CutsceneToSurface;
		this.surfaceButton.hide();
		this.cameraSmoothY = 0;

		// Smooth camera transition
		this.tweens.addCounter({
			from: this.cameras.main.scrollY,
			to: 0,
			duration: 1000 + this.deepestNodeY/100,
			ease: 'Quad.easeInOut',
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

	startCutsceneToUnderground() {
		this.sound.play("s_click");
		this.state = GameState.CutsceneToUnderground;
		this.surfaceButton.hide();
		this.cameraSmoothY = this.BELOW_SURFACE_Y;

		// Smooth camera transition
		this.tweens.addCounter({
			from: this.cameras.main.scrollY,
			to: this.BELOW_SURFACE_Y,
			delay: 500,
			duration: 1500,
			ease: 'Quad.easeInOut',
			onUpdate: (tween) => {
				this.cameras.main.scrollY = tween.getValue();
			},
			onComplete: () => {
				this.state = GameState.GrowingRoots;
			}
		});

		if (this.secondNode) {
			this.tweens.add({
				targets: this.secondNode,
				y: { from: this.secondNode.y, to: this.BELOW_SURFACE_Y + 0.25 * this.H },
				duration: 1500,
				ease: 'Quad',
			});
		}
	}

	onHarvestComplete() {
		this.state = GameState.Overworld;
		this.oneTimeEvents.outOfEnergy = false;

		this.surfaceButton.show(false, true);

		// Set to whatever the lowest priced item is
		if (this.money >= 150) {
			if (!this.oneTimeEvents.spawnShop) {
				this.oneTimeEvents.spawnShop = true;
				this.shop.activateOverworldShop();
				this.musicState = MusicState.Jingle;
				// this.musicNormal.stop();
				// this.musicDrawing.stop();
				this.musicJingle.play();
				setTimeout(() => {
					this.musicNormal = new Music(this, 'm_first', { volume: this.musicMuted ? 0 : this.musicVolume });
					this.musicDrawing = new Music(this, 'm_first_draw', { volume: 0 });
					if (this.musicState == MusicState.Jingle) {
						this.musicState = MusicState.NormalLoop;
						this.musicNormal.play();
						this.musicDrawing.play();
					}
				}, this.musicJingle.duration * 1000);
			}
		}

		// Add current score to growth
		// Should be a whole sequence here instead and the shop thing, etc
		//this.tree.addMaxEnergy(this.score);
		this.score = 0;

		// Destroy all nodes
		this.currentNode = null;
		this.nodes.forEach(node => {
			node.destroy();
		});
		this.nodes = [];

		this.setDeepestNode(0);
		this.undergroundEdge.y = 1.5 * this.H;

		this.dragGraphics.clear();
		this.rootsBackGraphics.clear();
		this.rootsFrontGraphics.clear();
		this.harvestButton.hide();


		// Restart tree
		this.addFirstNode();
		this.tree.reset();
		this.underground.reset();
		this.updateScore();
	}

	toggleLimitBreak()
	{
		let r = this.tree.toggleLimitBreak();
		if (r == 1) {
			this.sound.play("r_limitbreak");
		} else if (r == 2) {
			this.sound.play("r_unlimitbreak");
		}
		this.hud.toggleShadow();
		this.limitBreakButton.advance();
		
	}

	toggleZombie()
	{
		if(this.score > 100 && !this.tree.isZombie)
		{
			let m = this.tree.toggleZombie(this.score);
			this.zombieButton.advance(this.score, m);
			this.judgeNodes();
		} else if (this.tree.isZombie){
			this.tree.untoggleZombie();
			this.zombieButton.advance(0,1);
			this.judgeNodes();
		}
	}

	resetLimitBreak()
	{
		this.tree.resetLimitBreak();
		if(this.hud.cancelShadow())
		{
			this.sound.play("r_unlimitbreak");
			this.limitBreakButton.setWaitTimer(this.hud.shiftTime);
		}
		this.limitBreakButton.resetButtonState();
	}

	parseItemFunction(itemData:ItemData)
	{
		this.tree.clearActiveChains();
		switch(itemData.type){
			case ItemType.TreeEnergy: {
				this.tree.addMaxEnergy(itemData.value[itemData.iteration-1]);
				this.tree.energy = this.tree.maxEnergy;
				break;
			} case ItemType.RockBreak : {
				this.tree.strength = itemData.value[itemData.iteration-1];
				break;
			} case ItemType.FruitUpgrade: {
				this.tree.upgradeFruit(itemData);
				break;
			} case ItemType.ChainUpgrade: {
				this.tree.unlockChain(itemData.value[itemData.iteration-1]);
				break;
			} 
			case ItemType.TreeEfficiency: {
				this.tree.energyMitigation = itemData.value[itemData.iteration-1];
				break;
			} case ItemType.SuperChain: {
				this.tree.superChains = true;
				break;
			} case ItemType.BombUpgrade: {
				this.tree.bruteStrength = true;
				this.tree.bruteChance = itemData.value[itemData.iteration-1];
				this.hud.showBombs();
				break;
			} case ItemType.MemoryChain: {
				this.tree.unlockChain(itemData.value[itemData.iteration-1]);
				break;
			} case ItemType.LimitBreak: {
				this.tree.limitBreak = true;
				this.resetLimitBreak();
				break;
			} case ItemType.ZombieMode: {
				this.tree.canZombie = true;
				this.resetZombie();
				break;
			} default: {
				break;
			}
		}
	}

	getSuperChain(): number
	{
		let r = Math.random()*200;
		if(this.tree.transcending)
		{
			return 99;
		}
		if(r <= 100) {
			return 0.01;
		} else if (r <= 150) {
			return 0.1;
		} else if (r <= 176) {
			return 1;
		} else if (r <= 190) {
			return 2;
		} else if (r <= 199) {
			return 3.5;
		} else {
			return 99;
		}
	}

	prettifyNumber(input: number): string
	{
		if(input < 10)
		{
			return input.toFixed(2);
		} else if (input < 20) {
			return input.toFixed(1);
		} else {
			return Math.round(input).toString();
		}
	}

	handleMineralCollection(minerals: Mineral[]) {
		const collectibles = minerals.filter(mineral => mineral.collectible);
		this.underground.destroyMinerals(collectibles);
		let bcheck = false;
		collectibles.forEach(collectible => {
			this.tree.updateChainList(collectible.type, collectible.itemclass);
			//get multiplier and advance chains
			let scoremultiplier = 1;
			scoremultiplier = this.tree.updateChainStatus(collectible.type, collectible.itemclass);
			if(this.tree.superChains)
			{
				scoremultiplier += this.getSuperChain();
			}
			//did we contact a normally indestructible object
			if(collectible.hardness > this.tree.strength)
			{
				bcheck = true;
				scoremultiplier+=5;
			}
			let tPoints = Math.round(collectible.points*scoremultiplier);
			let color = "Lime";
			let pColor = "Lime"
			let tScale=200;
			let pScale=150;
			if(tPoints > 9000)
			{
				color = "red"
				tScale = 450;
			} else if (tPoints > 1000) {
				color = "fuchsia"
				tScale = 275
			} else if (tPoints > 500) {
				color = "aqua"
				tScale = 250
			} else if (tPoints > 250) {
				color = "yellow";
				tScale = 225
			}

			if(scoremultiplier >= 99) {
				pColor = "red"
				pScale = 425
			} else if (scoremultiplier > 20) {
				pColor = "fuchsia"
				pScale = 225
			} else if (scoremultiplier > 10) {
				pColor = "aqua"
				pScale = 200
			} else if (scoremultiplier > 5) {
				pColor = "yellow";
				pScale = 175
			}

			let treefund=Math.round(this.tree.refundValue*scoremultiplier);
			if(this.tree.refundValue>0){
				if(this.tree.maxEnergy-this.tree.energy>treefund){
					this.tree.energy+=treefund;
				} else {
					treefund=this.tree.maxEnergy-this.tree.energy;
					this.tree.energy=this.tree.maxEnergy;
				}
				this.textParticle(collectible.x-35, collectible.y+5, "Green", `+${treefund} Energy!`, undefined, (pScale-25)/4 * this.SCALE);
			}
			this.textParticle(collectible.x, collectible.y-10, color, `${collectible.properName} +${tPoints}!`, true,
			tScale/4*this.SCALE, 2, this.textParticles.DEAFULT_EFFECTS_HALF);
			if(scoremultiplier > 1) {
				this.textParticle(collectible.x, collectible.y+20, pColor, `Combo x${this.prettifyNumber(scoremultiplier)}!!!`, true,
				pScale/4*this.SCALE, 2, this.textParticles.DEAFULT_EFFECTS_HALF);
			}

			if (this.currentNode && collectible.points) {
				this.currentNode.addScore();
				this.score += Math.round(collectible.points*scoremultiplier);
			}
			this.sound.play("r_collect");
			if(scoremultiplier > 99) {
				this.sound.play("r_bigfire");
			}

			// Create sparkle effect
			if (collectible.type == MineralType.applecore) {

				this.particles.createGreenMagic(collectible.x, collectible.y, (collectible.collisionRadius/35)*0.9, 1.0, false);
			}
			else if (collectible.type == MineralType.emerald || collectible.type == MineralType.ruby || collectible.type == MineralType.diamond || collectible.type == MineralType.ancient_diamond)
			{
				this.particles.createBlueSparkle(collectible.x, collectible.y, (collectible.collisionRadius/50), 1.0, false);	
			}
			else if (collectible.type == MineralType.demon_rock || collectible.type == MineralType.curse_rock)
			{
				this.particles.createExplosion(collectible.x, collectible.y, (collectible.collisionRadius/50), 1.0, false);	
			}
			else
			{
				this.particles.createDustExplosion(collectible.x, collectible.y, (collectible.collisionRadius/45), 1.0, false);
			}

			if(scoremultiplier >= 99)
			{
				this.particles.createFire(collectible.x, collectible.y-55, 0.45, 0.6, false);	
			}
			
		});

		//end cherry bomb status if destroyed hard stuff
		if(bcheck && this.tree.bruteStrength)
		{
			if(this.tree.bruteness > 0) {
				this.tree.bruteness = 0;
				this.tree.persistence = 0;
				this.particles.createExplosion(this.currentNode!.x, this.currentNode!.y, 0.5, 1.0, false);	
			}
		}
		//clean persisting chains if you collected minerals, otherwise only clear the default "any chain"
		if(collectibles.length > 0)
		{
			this.tree.updateMineralTracking();
			if(!this.tree.transcending) {
				this.tree.cleanChains();
			}	
		} else {
			if(!this.tree.transcending) {
				this.tree.cleanSelectedChain(this.tree.ANY_CHAIN_ID);
			}
		}
		this.tree.clearMineralMap();

	}

	textParticle(x: number, y: number, color: string, content: string, outline: boolean=true, size: number=40,
		duration: number=1.5, effects: TextParticleEffects={ wave: {enable: true}, fadeOut: {enable: true} }) {

		const text = this.createText(x, y, size, color, content);
		if(outline) text.setStroke("rgba(0,0,0,0.5)", 120*this.SCALE);

		// Prevent text from going too far right
		const right = text.getRightCenter().x;
		const diff = this.W - right - 80 * this.SCALE;
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
			let str = this.tree.strength;
			if(this.tree.bruteStrength && str < this.tree.maxBruteness)
			{
				str+=this.tree.bruteness;
				if(str > this.tree.maxBruteness)
				{
					str = this.tree.maxBruteness;
				}
			}
			const touchingObstacle = mineralIntersects.some((mineral => mineral.hardness > str));
			let canEnergy = ((this.tree.energy >= Math.round(this.currentNode.cost*this.tree.energyMitigation)) && !(this.tree.isZombie) || this.tree.isZombie);
			let canZombie = this.getZombiness();

			const canAfford = ( canEnergy && canZombie );
			this.validDrawing = !!next && !touchingObstacle && canAfford;

			const invalidReason = nextPosResult instanceof Phaser.Math.Vector2
				? touchingObstacle
					? InvalidNodeReason.ObstacleInTheWay
					: canAfford
						? InvalidNodeReason.ProgrammerGoofed // shouldn't get here
						: InvalidNodeReason.Unaffordable
				: nextPosResult;

			this.dragPos = this.dragPos.lerp(end, delta/100);

			if (canEnergy && canZombie) {
				if (next && this.validDrawing && canDraw) {
					this.addConnection(next);
					this.dragPos = new Phaser.Math.Vector2(next.x, next.y);
					//handling cherry bomb explosions
					this.handleMineralCollection(mineralIntersects);
							// add or remove bombs
					if(this.tree.isZombie){
						this.zombieButton.advancePercent(this.score, this.tree.popZombieNumber())
					}
					if(this.tree.bruteStrength && this.tree.persistence <= 0)
					{
						if((Math.random()*1000) > (1000-(this.tree.bruteChance*1000)))
						{
							if(this.tree.bruteness < this.tree.maxBruteness)
							{
								this.tree.bruteness++;
								this.tree.persistence = this.tree.maxPersistence;
							}
						} else {
							if(this.tree.bruteness > 0) {
								this.tree.bruteness--;
							}
						}
					} else if (this.tree.persistence > 0) {
						this.tree.persistence--;
					}
				}
			}
			else if (!this.oneTimeEvents.outOfEnergy) {
				this.oneTimeEvents.outOfEnergy = true;
				this.surfaceButton.show(true, true);
			}

			const limitReached = !this.validDrawing && canDraw;

			if (limitReached && !this.oneTimeEvents.wrongPlacementSound) {
				this.oneTimeEvents.wrongPlacementSound = true;
				this.sound.play("r_place_error", { volume: 0.25 });

				this.textParticle(pointer.x, pointer.y-10, "OrangeRed", invalidReason,
					undefined, 50 * this.SCALE, 3, this.textParticles.DEAFULT_EFFECTS_HALF);

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

	getZombiness(): boolean
	{
		if(this.tree.isZombie)	{
			if(this.score > this.tree.popZombieNumber()) {
				return true;
			} else {
				return false;
			}
		} else {
			return true;
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

	addFirstNode() {
		this.firstNode = this.addNode(
			this.TREE_X,
			this.SURFACE_Y + 40*this.SCALE,
			false,
			48);

		this.secondNode = this.addNode(
			this.TREE_X,
			this.firstNode.y,
			true);
		this.secondNode.addParent(this.firstNode);
	}

	addNode(x: number, y: number, enabled: boolean = true, size: number = 24): Node {
		// let size = (root ? 96 : 24);
		// let texture = (!enabled ? "seed" : "circle");
		// let texture = "circle";

		let node = new Node(this, x, y, size, enabled);
		node.setDepth(100);

		node.on("dragStart", this.onNodeDragStart, this);

		this.nodes.push(node);
		this.setDeepestNode(node.y);

		// if (root) {
			// node.disable();
		// }

		return node;
	}

	addConnection(position: Phaser.Math.Vector2) {
		if (!this.currentNode) { return; }

		const oldNode = this.currentNode;
		const newNode = this.addNode(position.x, position.y);
		newNode.addParent(oldNode);

		// Add growth score
		oldNode.addScore();
		this.score += 1;
		if(!this.tree.isZombie){
			this.tree.energy -= Math.round(oldNode.cost*this.tree.energyMitigation);
		} else if (this.tree.isZombie)
		{
			this.score -= this.tree.popZombieNumber();
			this.textParticle(newNode.x-15, newNode.y-5, "Red", `-${this.tree.popZombieNumber()}`, undefined, 40 * this.SCALE);
			this.tree.advanceZombie();
		}
		// old stuff for refreshing energy on root growth
		/*
		if(this.tree.refundValue > 0)
		{
			if (this.tree.maxEnergy-this.tree.energy > this.tree.refundValue) {
				this.textParticle(newNode.x-15, newNode.y-5, "Green", `+${this.tree.refundValue}`, undefined, 150 * this.SCALE);
				this.tree.energy += this.tree.refundValue;
			} else {
				this.textParticle(newNode.x-15, newNode.y-5, "Green", `+${this.tree.maxEnergy-this.tree.energy}`, undefined, 150 * this.SCALE);
				this.tree.energy = this.tree.maxEnergy;
			}
		} 
		*/
		this.judgeNodes();

		this.sound.play("r_place", { volume: 0.3, rate: 1 + Math.random() * 0.1 });

		this.textParticle(newNode.x+5, newNode.y-5, "Yellow", `-${oldNode.cost}`, undefined, 40 * this.SCALE);
		this.currentNode = newNode;

		this.updateScore();
	}

	judgeNodes() {
		this.nodes.forEach(node => {
			if (((node.cost > this.tree.energy) && !this.tree.isZombie) || (this.tree.isZombie && (this.score < this.tree.popZombieNumber()))) {
				node.disable();
			} else if (((node.cost <= this.tree.energy) && !this.tree.isZombie) || (this.tree.isZombie && (this.score > this.tree.popZombieNumber()))) {
				if (node.children.length < 2) {
					node.enable();
				}
			}
		});
	}

	drawAllRoots() {
		if (this.nodes.length == 0) { return; }

		this.rootsBackGraphics.clear();
		this.rootsFrontGraphics.clear();

		if (this.firstNode) {
			const thickness = (this.firstNode.size+2) * this.SCALE;
			const border = 16 * this.SCALE;
			this.rootsBackGraphics.fillStyle(0x3e2723, 1.0);
			this.rootsBackGraphics.fillCircle(Math.round(this.firstNode.x), Math.round(this.firstNode.y), (thickness + border)/2);
			this.rootsFrontGraphics.fillStyle(0x795548, 1.0);
			this.rootsFrontGraphics.fillCircle(this.firstNode.x, this.firstNode.y, thickness/2);
		}


		this.nodes.forEach(node => {
			this.drawRoot(node);
		});
	}

	drawRoot(node: Node): void {
		if (!node.parent) { return; }

		// Culling check
		const parentY = node.parent.y;
		const currentY = node.y;
		const topY    = this.cameras.main.scrollY - 0.2 * this.H;
		const bottomY = this.cameras.main.scrollY + 1.2 * this.H;
		if (topY < parentY && topY < currentY && bottomY > parentY && bottomY > currentY) {

			// https://www.desmos.com/calculator/s0kxcaovyr
			let minSize = 3;
			let thickness = 30 * Math.log10(0.2 * node.score + Math.exp(1/minSize));
			thickness *= this.SCALE;
			let circleRadius = Math.max(thickness, node.size * this.SCALE);
			// const thickness = (3 + 4 * Math.sqrt(node.score)) * this.SCALE;


			// Hahaha, more drawing complexity!

			const border = 16 * this.SCALE;
			this.rootsBackGraphics.lineStyle(thickness + border, 0x3e2723, 1.0);
			this.rootsBackGraphics.beginPath();
			this.rootsBackGraphics.moveTo(node.parent.x, node.parent.y);
			this.rootsBackGraphics.lineTo(node.x, node.y);
			this.rootsBackGraphics.closePath();
			this.rootsBackGraphics.strokePath();

			this.rootsBackGraphics.fillStyle(0x3e2723, 1.0);
			this.rootsBackGraphics.fillCircle(node.x, node.y, (circleRadius + border)/2);

			this.rootsFrontGraphics.lineStyle(thickness, 0x795548, 1.0);
			this.rootsFrontGraphics.beginPath();
			this.rootsFrontGraphics.moveTo(node.parent.x, node.parent.y);
			this.rootsFrontGraphics.lineTo(node.x, node.y);
			this.rootsFrontGraphics.closePath();
			this.rootsFrontGraphics.strokePath();

			this.rootsFrontGraphics.fillStyle(0x795548, 1.0);
			this.rootsFrontGraphics.fillCircle(node.x, node.y, circleRadius/2);
		}


		// this.drawRoot(node.parent);
	}

	onTreeLevelUp(level: number) {
		// if (level == 1) {
		// 	this.sound.play("r_grow", { volume: 0.3, rate: 1.25 });
		// }

		// if (level == 2) {
		// 	this.sound.play("r_grow", { volume: 0.4, rate: 1.00 });
		// }
	}

	onTreeClick() {
		if (this.state == GameState.HarvestingTree || (this.state == GameState.GrowingRoots && this.score > 10)) {
			this.moveSmoothCamera(-this.cameraSmoothY);

			this.tree.clearActiveChains();
			this.resetLimitBreak();
			this.resetZombie();
			this.tree.harvest();
			this.money += this.score + ((this.score > this.tree.basevalue) ? this.tree.basevalue : (this.tree.basevalue*this.score/this.tree.basevalue));

			this.particles.createGreenMagic(this.tree.x, this.tree.y - 150*this.SCALE, 3*this.SCALE, 1.0, false);

			if (this.tree.harvestCount <= 0) {
				this.particles.createExplosion(this.tree.x, this.tree.y - 100*this.SCALE, 2*this.SCALE, 1.0, false);
				this.sound.play("t_chop_plant", {rate: 1 + 0.1 * Math.random()});
				if (this.tree.level > 0) {
					this.sound.play("t_branch_snap", {rate: 1 + 0.1 * Math.random()});
				}
				this.onHarvestComplete();
			} else {
				this.sound.play("t_rustle", {rate: 1 + 0.1 * Math.random()});
			}
		}
	}

	resetZombie()
	{
		this.tree.resetZombie();
		this.zombieButton.resetButtonState();
	}

	updateScore() {
		// Pass score to tree
		this.tree.updateTreeScore(this.score);
	}


	/* Input */

	onNodeDragStart(node: Node) {
		this.currentNode = node;
		this.dragPos = new Phaser.Math.Vector2(node.x, node.y);
		if (this.musicState == MusicState.NormalLoop) this.musicState = MusicState.LayeredLoop;
		this.oneTimeEvents.wrongPlacementSound = false;
	}

	onPointerUp(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void {
		this.currentNode = null;
		this.dragGraphics.clear();
		if (this.musicState == MusicState.LayeredLoop) this.musicState = MusicState.NormalLoop;
	}

	onScroll(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) {
		if (this.state != GameState.GrowingRoots && this.state != GameState.Overworld) { return; }

		this.moveSmoothCamera(deltaY * this.SCALE);
	}

	onCameraDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) {
		if (this.state != GameState.GrowingRoots && this.state != GameState.Overworld) { return; }

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


	get TREE_X() {
		return 0.495 * this.W;
	}

	get SURFACE_Y() {
		return 0.75 * this.H;
	}

	get BELOW_SURFACE_Y() {
		return 0.85 * this.H;
	}

	get BEDROCK_Y() {
		return 10000; // Fix
	}

	get state(): GameState {
		return this._state;
	}

	set state(value: GameState) {
		this._state = value;

		this.updateCameraBounds();

		if (this.state == GameState.Overworld) {
			this.shop.checkIfAnyItemsAreAfforable(this.money);
		}
		else {
			this.shop.checkIfAnyItemsAreAfforable(0);
		}
	}
}
