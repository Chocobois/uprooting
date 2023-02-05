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

interface MineralRange {
	type: MineralType, // Which item to spawn
	centerDepth: number; // Y-coord where spawns are at max
	centerRadius: number; // Y-distance from center. Odds reduces the further away from center they are.
	odds: number; // Chance of attempted spawning
	minRadius: number; // Minimum radius between two items
}

const MINERALS: MineralRange[] = [
	{
		type: MineralType.Applecore,
		centerDepth: 2000,
		centerRadius: 3000,
		odds: 0.04,
		minRadius: 400,
	},
	{
		type: MineralType.Bones,
		centerDepth: 5000,
		centerRadius: 4000,
		odds: 0.06,
		minRadius: 400,
	},
	{
		type: MineralType.Ruby,
		centerDepth: 8000,
		centerRadius: 4000,
		odds: 0.02,
		minRadius: 200,
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
					mineralRange.type,
					this.left + (this.right - this.left) * Math.random(),
					this.currentY,
					mineralRange.minRadius * this.scene.SCALE
				);
			}
		});

	}

	addMineral(type: MineralType, x: number, y: number, minRadius: number=0) {
		if (this.hasFreeSpace(x, y, minRadius)) {
			let mineral = new Mineral(this.scene, x, y, type);

			this.add(mineral);
			this.items.push(mineral);
		}
	}

	hasFreeSpace(x: number, y: number, radius: number) {
		for (let item of this.items) {
			if (Phaser.Math.Distance.Between(x, y, item.x, item.y) < radius) {
				return false;
			}
		}
		return true;
	}
}