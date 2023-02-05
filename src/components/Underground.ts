import { BaseScene } from "../scenes/BaseScene";
import { Mineral } from "./Mineral";
import Perlin from 'phaser3-rex-plugins/plugins/perlin.js';


export enum MineralType {
	apple = "apple",
	applecore = "applecore",
	banana = "banana",
	bone = "bone",
	bones = "bones",
	cherry = "cherry",
	diamond = "diamond",
	dragondragonfruit = "dragondragonfruit",
	dragonfruit = "dragonfruit",
	emerald = "emerald",
	badrock = "badrock",
	gray_badrock = "gray_badrock",
	ylw_badrock="ylw_badrock",
	demon_rock="demon_rock",
	curse_rock="curse_rock",
	orange = "orange",
	pear = "pear",
	ancient_diamond = "ancient_diamond",
	ruby = "ruby",
	sapphire = "sapphire",
	stone = "stone",
	watercave = "watercave",
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
	hardness: number; // How cool your tree needs to be to break this? Blocks growth if > tree strength.
	noRotation?: boolean;
	points?: number;
}

const MINERALS: MineralRange[] = [
	{
		type: MineralType.curse_rock,
		properName: "Banished Rock",
		centerDepth: 20000,
		centerRadius: 1500,
		odds: 0.15,
		collisionRadius: 300,
		spacingRadius: 165,
		collectible: true,
		hardness: 9
	},
	{
		type: MineralType.applecore,
		properName: "Apple Core",
		centerDepth: 2000,
		centerRadius: 6000,
		odds: 0.01,
		collisionRadius: 120,
		spacingRadius: 300,
		collectible: true,
		hardness: 1
	},
	{
		type: MineralType.applecore,
		properName: "Apple Core",
		centerDepth: 2000,
		centerRadius: 3000,
		odds: 0.04,
		collisionRadius: 70,
		spacingRadius: 100,
		collectible: true,
		hardness: 1
	},
	{
		type: MineralType.bones,
		properName: "Bone Deposit",
		centerDepth: 5000,
		centerRadius: 7500,
		odds: 0.065,
		collisionRadius: 70,
		spacingRadius: 65,
		collectible: true,
		hardness: 2
	},
	{
		type: MineralType.bones,
		properName: "Large Bone Deposit",
		centerDepth: 9500,
		centerRadius: 7500,
		odds: 0.065,
		collisionRadius: 135,
		spacingRadius: 125,
		collectible: true,
		hardness: 2
	},
	{
		type: MineralType.ylw_badrock,
		properName: "Rock",
		centerDepth: 3500,
		centerRadius: 3500,
		odds: 0.075,
		collisionRadius: 90,
		spacingRadius: 55,
		collectible: true,
		hardness: 3
	},
	{
		type: MineralType.ylw_badrock,
		properName: "Large Rock",
		centerDepth: 4500,
		centerRadius: 3500,
		odds: 0.06,
		collisionRadius: 160,
		spacingRadius: 7,
		collectible: true,
		hardness: 3
	},
	{
		type: MineralType.demon_rock,
		properName: "Hot Rock",
		centerDepth: 18000,
		centerRadius: 2400,
		odds: 0.1,
		collisionRadius: 195,
		spacingRadius: 70,
		collectible: true,
		hardness: 8
	},

	{
		type: MineralType.badrock,
		properName: "Hard Rock",
		centerDepth: 8000,
		centerRadius: 4500,
		odds: 0.065,
		collisionRadius: 70,
		spacingRadius: 55,
		collectible: true,
		hardness: 4
	},
	{
		type: MineralType.demon_rock,
		properName: "Mini Hot Rock",
		centerDepth: 19000,
		centerRadius: 1600,
		odds: 0.05,
		collisionRadius: 45,
		spacingRadius: 10,
		collectible: true,
		hardness: 8
	},
	{
		type: MineralType.gray_badrock,
		properName: "Bedrock",
		centerDepth: 17500,
		centerRadius: 3500,
		odds: 0.125,
		collisionRadius: 200,
		spacingRadius: 60,
		collectible: true,
		hardness: 6
	},
	{
		type: MineralType.badrock,
		properName: "Large Hard Rock",
		centerDepth: 10000,
		centerRadius: 5000,
		odds: 0.065,
		collisionRadius: 160,
		spacingRadius: 70,
		collectible: true,
		hardness: 4
	},
	{
		type: MineralType.badrock,
		properName: "Mini Hard Rock",
		centerDepth: 14000,
		centerRadius: 6500,
		odds: 0.055,
		collisionRadius: 50,
		spacingRadius: 10,
		collectible: true,
		hardness: 4
	},
	{
		type: MineralType.gray_badrock,
		properName: "Mini Bedrock",
		centerDepth: 15500,
		centerRadius: 4500,
		odds: 0.055,
		collisionRadius: 80,
		spacingRadius: 35,
		collectible: true,
		hardness: 6
	},

	{
		type: MineralType.applecore,
		properName: "Apple Core",
		centerDepth: 2000,
		centerRadius: 3000,
		odds: 0.04,
		collisionRadius: 70,
		spacingRadius: 100,
		collectible: true,
		hardness: 1
	},
	{
		type: MineralType.emerald,
		properName: "Emerald",
		centerDepth: 8000,
		centerRadius: 3000,
		odds: 0.025,
		collisionRadius: 60,
		spacingRadius: 10,	
		collectible: true,
		hardness: 5
	},
	{
		type: MineralType.ruby,
		properName: "Ruby",
		centerDepth: 13000,
		centerRadius: 3000,
		odds: 0.025,
		collisionRadius: 60,
		spacingRadius: 10,	
		collectible: true,
		hardness: 5
	},
	{
		type: MineralType.diamond,
		properName: "Raw Diamond",
		centerDepth: 16500,
		centerRadius: 3000,
		odds: 0.025,
		collisionRadius: 60,
		spacingRadius: 5,	
		collectible: true,
		hardness: 5
	},
	{
		type: MineralType.ancient_diamond,
		properName: "Ancient Diamond",
		centerDepth: 16500,
		centerRadius: 3000,
		odds: 0.06,
		collisionRadius: 60,
		spacingRadius: 5,	
		collectible: true,
		hardness: 7
	},
	{
		type: MineralType.ancient_diamond,
		properName: "Ancient Diamond",
		centerDepth: 19000,
		centerRadius: 3000,
		odds: 0.1,
		collisionRadius: 60,
		spacingRadius: 5,	
		collectible: true,
		hardness: 7
	},
	{
		type: MineralType.watercave,
		properName: "Tiny Aquifer",
		centerDepth: 4000,
		centerRadius: 1200,
		odds: 0.015,
		collisionRadius: 255,
		spacingRadius: 5,	
		collectible: false,
		hardness: 999,
		noRotation: true,
	},
	{
		type: MineralType.watercave,
		properName: "Small Aquifer",
		centerDepth: 6000,
		centerRadius: 1800,
		odds: 0.012,
		collisionRadius: 375,
		spacingRadius: 5,	
		collectible: false,
		hardness: 999,
		noRotation: true,
	},
	{
		type: MineralType.watercave,
		properName: "Large Aquifer",
		centerDepth: 11000,
		centerRadius: 2200,
		odds: 0.015,
		collisionRadius: 565,
		spacingRadius: 5,	
		collectible: false,
		hardness: 999,
		noRotation: true,
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