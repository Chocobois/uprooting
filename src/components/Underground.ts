import { BaseScene } from "../scenes/BaseScene";
import { Mineral } from "./Mineral";
import Perlin from 'phaser3-rex-plugins/plugins/perlin.js';


export enum MineralType {
	Apple = "apple",
	Applecore = "applecore",
	Banana = "banana",
	Bone = "bone",
	Bones = "bones",
	Cherry = "cherry",
	Diamond = "diamond",
	Dragondragonfruit = "dragondragonfruit",
	Dragonfruit = "dragonfruit",
	Emerald = "emerald",
	Hasty_rock = "hasty_rock",
	Orange = "orange",
	Pear = "pear",
	Platinum = "platinum",
	Ruby = "ruby",
	Sapphire = "sapphire",
	Stone = "stone",
	Watercave = "watercave",
}

export interface MineralRange {
	type: MineralType; // Which item to spawn
	properName: String; // Name for the item
	centerDepth: number; // Y-coord where spawns are at max
	centerRadius: number; // Y-distance from center. Odds reduces the further away from center they are.
	odds: number; // Chance of attempted spawning
	collisionRadius: number; // Radius for collision
	spacingRadius: number; // Personal space radius needed to stay away from other items
	collectible: boolean; // Is this collectible by dragging a branch on it?
	obstacle: boolean; // Does it block growth?
}

const MINERALS: MineralRange[] = [
	{
		type: MineralType.Applecore,
		properName: "Apple Core",
		centerDepth: 2000,
		centerRadius: 3000,
		odds: 0.01,
		collisionRadius: 250,
		spacingRadius: 300,
		collectible: false,
		obstacle: true
	},
	{
		type: MineralType.Applecore,
		properName: "Apple Core",
		centerDepth: 2000,
		centerRadius: 3000,
		odds: 0.04,
		collisionRadius: 70,
		spacingRadius: 200,
		collectible: true,
		obstacle: false
	},
	{
		type: MineralType.Bones,
		properName: "Bones",
		centerDepth: 5000,
		centerRadius: 4000,
		odds: 0.02,
		collisionRadius: 70,
		spacingRadius: 100,
		collectible: false,
		obstacle: true
	},
	{
		type: MineralType.Ruby,
		properName: "Ruby",
		centerDepth: 8000,
		centerRadius: 4000,
		odds: 0.06,
		collisionRadius: 60,
		spacingRadius: 250,	
		collectible: true,
		obstacle: false
	},
];


export class Underground extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private items: Mineral[];

	private noise: Perlin;

	private gridSteps: number;
	private gridSize: number;
	private blueRadius: number;
	private left: number;
	private right: number;
	private top: number;
	private bottom: number;

	private currentY: number;
	private deltaY: number;


	constructor(scene: BaseScene, surfaceY: number, bedrockY: number) {
		super(scene);
		this.scene = scene;
		this.scene.add.existing(this);

		this.items = [];


		const padding = 50 * this.scene.SCALE;
		this.left = padding;
		this.right = this.scene.W - padding;
		this.top = surfaceY + 5*padding;
		this.bottom = bedrockY - padding;

		this.gridSteps = 1000;
		this.gridSize = (this.right - this.left) / this.gridSteps;
		const gridStepsHeight = (this.bottom - this.top) / this.gridSize;

		this.currentY = this.top;
		this.deltaY = 1 * this.scene.SCALE;


		MINERALS.forEach(mineralRange => {
			mineralRange.centerDepth *= this.scene.SCALE;
			mineralRange.centerRadius *= this.scene.SCALE;
			mineralRange.collisionRadius *= this.scene.SCALE;
			mineralRange.spacingRadius *= this.scene.SCALE;
		});
	}

	update(time: number, delta: number, ) {
		this.items.forEach(item => {
			item.update(time, delta);
		});

		let camY = this.scene.cameras.main.scrollY + 1.5*this.scene.H;
		while (camY > this.currentY) {
			this.currentY += this.deltaY;
			this.attemptSpawningItem();
		}
	}


	reset() {
		this.items.forEach(item => {
			item.destroy();
		});
		this.items = [];

		this.currentY = this.top;
	}


	attemptSpawningItem() {
		MINERALS.forEach(mineralRange => {
			let centerDepth = this.top + mineralRange.centerDepth;
			let spawnHeight = mineralRange.centerRadius;
			// Funny triangle formula. Peak 1 at center. 0 at edges. Negative outside.
			let odds = mineralRange.odds * Math.pow((spawnHeight - Math.abs(this.currentY - centerDepth)) / spawnHeight, 1.5);

			if (Math.random() < odds) {
				this.addMineral(
					mineralRange,
					this.left + (this.right - this.left) * Math.random(),
					this.currentY
				);
			}
		});

	}

	addMineral(params: MineralRange, x: number, y: number) {
		if (this.hasFreeSpace(x, y, params.spacingRadius)) {
			let mineral = new Mineral(this.scene, params, x, y);

			this.add(mineral);
			this.items.push(mineral);
		}
	}

	hasFreeSpace(x: number, y: number, myRadius: number) {
		for (let item of this.items) {
			if (Phaser.Math.Distance.Between(x, y, item.x, item.y) < myRadius + item.spacingRadius) {
				return false;
			}
		}
		return true;
	}

	getIntersectedMinerals(line: Phaser.Geom.Line): Mineral[] {
		return this.items.filter(item => {
			const circle = new Phaser.Geom.Circle(item.x, item.y, item.collisionRadius);
			return Phaser.Geom.Intersects.LineToCircle(line, circle);
		});
	}

	destroyMinerals(minerals: Mineral[]) {
		const other = this.items.filter(item => minerals.indexOf(item) == -1);
		minerals.forEach(mineral => mineral.destroy());
		this.items = other;
	}
}