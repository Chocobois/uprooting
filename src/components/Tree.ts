import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class Tree extends Button {
	private treeSprite: Phaser.GameObjects.Image;

	public level: number;
	public energy: number;
	public maxEnergy: number;
	public harvestCount: number;
	public strength: number;
	public basevalue: number;

	// Feel free to edit this ts declaration, it's supposed to be a k-v pair object
	private oneTimeEvents: Record<string, boolean>;


	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene.add.existing(this);


		// Stats
		this.level = 0;
		this.maxEnergy = 100;
		this.energy = this.maxEnergy;
		this.harvestCount = 3;
		this.strength = 1;
		this.basevalue = 1;


		// Tree sprite
		this.treeSprite = this.scene.add.image(0, 0, "sapling");
		this.treeSprite.setOrigin(0.5, 1.0);
		this.treeSprite.setScale(100 / this.treeSprite.width);
		this.add(this.treeSprite);


		// Make the tree clickable
		this.bindInteractive(this.treeSprite);
		const inputPadding = 40 * this.scene.SCALE / this.treeSprite.scaleX;
		this.treeSprite.input.hitArea.setTo(-inputPadding, -inputPadding, this.treeSprite.width+2*inputPadding, this.treeSprite.height+2*inputPadding);
	}

	update(time: number, delta: number) {
		// Click animation, no real use, maybe harvesting
		this.setScale(1.0 - 0.1 * this.holdSmooth);
	}


	addMaxEnergy(amount: number) {
		this.maxEnergy += amount;
	}

	reset() {
		this.level = 0;
		this.energy = this.maxEnergy;
		this.harvestCount = 3;
		this.treeSprite.setTexture("sapling");
	}

	setTreeScore(score: number) {
		const treeSize = this.scene.H * (.1 + (score > 500 ? (5 + 0.0001*score) : (.01 * score)));

		this.treeSprite.setScale(treeSize / this.treeSprite.width);
		const inputPadding = 40 * this.scene.SCALE / this.treeSprite.scaleX;
		this.treeSprite.input.hitArea.setTo(-inputPadding, -inputPadding, this.treeSprite.width+2*inputPadding, this.treeSprite.height+2*inputPadding);

		if (score > 80) {
			this.level += 1;
			this.treeSprite.setTexture("tree");
			this.emit("levelUp", this.level);
		}
		else if (score > 20 && score <= 80) {
			this.level += 1;
			this.treeSprite.setTexture("tree_little");
			this.emit("levelUp", this.level);

		}
	}
}