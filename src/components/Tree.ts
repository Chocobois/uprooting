import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";
import { ComboClass, MineralType } from "./Underground";

enum ChainType{
	NONE,
	LAST_ITEM,
	SPECIFIC_ITEM,
	ITEM_CLASS,
	ANY
}

interface ItemChain{
	type: MineralType,
	class: ComboClass,
	multiplier: number[],
	iteration: number,
	chainID: number,
	hasBeenActive: boolean,
	chainType: ChainType,

}

export class Tree extends Button {
	private treeContainer: Phaser.GameObjects.Container;
	private treeSprite: Phaser.GameObjects.Image;
	private fruits: Phaser.GameObjects.Image[];

	private _level: number;
	public energy: number;
	public maxEnergy: number;
	public harvestCount: number;
	public strength: number;
	public basevalue: number;
	//all possible chains
	public chainList: ItemChain[];
	public unlockedChains: Map<number,ItemChain>;
	public activeChains: Map<number,ItemChain>;
	public updateMap: Map<number,boolean>;
	public refundValue: number;
	public energyMitigation: number;
	public ANY_CHAIN_ID = 999;

	public defaultChain: ItemChain;

	//dice
	public superChains: boolean;
	//cherry bomb
	public bruteStrength: boolean;
	public bruteChance: number;
	public bruteness: number;
	public maxBruteness = 8;
	public persistence: number;
	public maxPersistence = 5;
	//feather
	public limitBreak: boolean;
	public maxLiminal = 10000;
	public transcending: boolean;
	public nodeCounter: number;
	public maxNodes = 10;
	public liminalTime: number;
	public usageCount: number;
	public maxUsage = 1;
	public percent: number;

	//mandrake
	public canZombie: boolean;
	public isZombie: boolean;
	public lastValue: number;
	public lastlastValue: number;
	public currentValue: number;
	public storedScore: number;

	private lastTrackedClass: ComboClass;
	private lastValuableItem: MineralType;
	public lastValuableClass: ComboClass;
	private changeClassFlag: boolean;
	private deletePrevClass: boolean;
	public myMap: Map<ComboClass, number>;
	private staticinc = 0.002;

	private treeOutlineFilter: any;


	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene.add.existing(this);
		this.setDepth(200);


		// Stats
		this._level = -1;
		this.maxEnergy = 100;
		this.energy = this.maxEnergy;
		this.harvestCount = 3;
		this.strength = 1;
		this.basevalue = 1;
		this.refundValue = 0;
		this.energyMitigation = 1;
		this.unlockedChains = new Map();
		this.activeChains = new Map();
		this.updateMap = new Map();
		this.lastTrackedClass = ComboClass.NONE;
		this.lastValuableItem = MineralType.NOTYPE;
		this.lastValuableClass = ComboClass.FRUIT;
		this.changeClassFlag = true;
		this.deletePrevClass = true;
		this.myMap = new Map();
		
		this.superChains = false;
		this.bruteStrength = false;
		this.bruteness = 0;
		this.bruteChance = 0;
		this.persistence = 0;
		this.percent = 0;
		
		this.limitBreak = false;
		this.liminalTime = 0;
		this.nodeCounter = 0;
		this.usageCount = 0;
		this.transcending = false;

		this.canZombie = false;
		this.isZombie = false;
		this.lastValue = 0.01;
		this.lastlastValue = this.staticinc;
		this.currentValue = this.staticinc;
		this.storedScore = 1;

		this.defaultChain = {
			type: MineralType.NOTYPE,
			class: 	ComboClass.NONE,
			multiplier: [1.1,1.25,1.5,2,3],
			iteration: 0,
			chainID: this.ANY_CHAIN_ID,
			hasBeenActive: false,
			chainType: ChainType.ANY
		}
		this.unlockedChains.set(this.ANY_CHAIN_ID,this.defaultChain)

		this.chainList = [
			{
				type: MineralType.applecore,
				class: 	ComboClass.FRUIT,
				multiplier: [1.5,2],
				iteration: 0,
				chainID: 1,
				hasBeenActive: false,
				chainType: ChainType.SPECIFIC_ITEM
			},
			{
				type: MineralType.applecore,
				class: 	ComboClass.FRUIT,
				multiplier: [1.5,2.5,3.5],
				iteration: 0,
				chainID: 1,
				hasBeenActive: false,
				chainType: ChainType.SPECIFIC_ITEM
			},
			{
				type: MineralType.applecore,
				class: 	ComboClass.FRUIT,
				multiplier: [2,3,4,5],
				iteration: 0,
				chainID: 1,
				hasBeenActive: false,
				chainType: ChainType.SPECIFIC_ITEM
			},
			{
				type: MineralType.bone,
				class: 	ComboClass.BONE,
				multiplier: [1.5,2],
				iteration: 0,
				chainID: 20,
				hasBeenActive: false,
				chainType: ChainType.ITEM_CLASS
			},
			{
				type: MineralType.bone,
				class: 	ComboClass.BONE,
				multiplier: [1.5,2.5,5],
				iteration: 0,
				chainID: 20,
				hasBeenActive: false,
				chainType: ChainType.ITEM_CLASS
			},
			{
				type: MineralType.badrock,
				class: 	ComboClass.ROCK,
				multiplier: [1.5,2],
				iteration: 0,
				chainID: 40,
				hasBeenActive: false,
				chainType: ChainType.ITEM_CLASS
			},
			{
				type: MineralType.badrock,
				class: 	ComboClass.ROCK,
				multiplier: [1.75,2.5,3.5],
				iteration: 0,
				chainID: 40,
				hasBeenActive: false,
				chainType: ChainType.ITEM_CLASS
			},
			{
				type: MineralType.diamond,
				class: 	ComboClass.GEM,
				multiplier: [1.125,1.25,1.5],
				iteration: 0,
				chainID: 30,
				hasBeenActive: false,
				chainType: ChainType.ITEM_CLASS
			},
			{
				type: MineralType.diamond,
				class: 	ComboClass.GEM,
				multiplier: [1.25,1.5,1.75,2],
				iteration: 0,
				chainID: 30,
				hasBeenActive: false,
				chainType: ChainType.ITEM_CLASS
			},

			{
				type: MineralType.applecore,
				class: 	ComboClass.NONE,
				multiplier: [1.25,1.5],
				iteration: 0,
				chainID: 33,
				hasBeenActive: false,
				chainType: ChainType.LAST_ITEM
			},
		];


		// Tree and fruits container
		this.treeContainer = this.scene.add.container(0, 0);
		this.add(this.treeContainer);

		// Tree sprite
		this.treeSprite = this.scene.add.image(0, 0, "sapling");
		this.treeSprite.setOrigin(0.5, 1.0);
		// this.treeSprite.setScale(100 / this.treeSprite.width);
		this.treeContainer.add(this.treeSprite);

		this.treeOutlineFilter = (scene.plugins.get('rexOutlinePipeline') as any).add(this.treeSprite, {
			thickness: 8 * this.scene.SCALE,
			outlineColor: 0x1B5E20,
			quality: 0.1,
		});


		// Fruits
		this.fruits = [];
		for (let i = 0; i < 3; i++) {
			let fruit = this.scene.add.image(0, 0, "apple");
			fruit.setScale(0.3 * this.scene.SCALE / fruit.width);
			fruit.setVisible(false);
			this.treeContainer.add(fruit);
			this.fruits.push(fruit);

			// let fruitOutlineFilter = (scene.plugins.get('rexOutlinePipeline') as any).add(fruit, {
			// 	thickness: 4 * this.scene.SCALE,
			// 	outlineColor: 0x7f0000,
			// 	quality: 0.1,
			// });
			// fruit.setData("outline", fruitOutlineFilter);
		}


		// Make the tree clickable
		this.bindInteractive(this.treeSprite);
		const inputPadding = 40 * this.scene.SCALE / this.treeSprite.scaleX;
		this.treeSprite.input?.hitArea.setTo(-inputPadding, -inputPadding, this.treeSprite.width+2*inputPadding, this.treeSprite.height+2*inputPadding);
	}

	update(time: number, delta: number) {
		// Click animation, no real use, maybe harvesting
		this.setScale(1.0 - 0.1 * this.holdSmooth);
		// this.updateTreeScore(30 * (0.5+0.5*Math.sin(time/500)));
		// this.updateTreeScore(30 + (500-30) * (0.5+0.5*Math.sin(time/500)));
		// this.updateTreeScore(500 + (1000-500) * (0.5+0.5*Math.sin(time/500)));
	}

	unlockChain(index: number)
	{
		if(index < this.chainList.length)
		{
			let key = this.chainList[index].chainID;
			if(!this.unlockedChains.has(key)){
				this.unlockedChains.set(key, this.chainList[index]);
			} else {
				// upgrade the chain
				this.unlockedChains.delete(key);
				this.unlockedChains.set(key, this.chainList[index]);
			}
		}
	}


	maximizeChains()
	{
		for (let[key,value] of this.unlockedChains)
		{
			if(this.activeChains.size == 0 || !this.activeChains.has(key))
			{
				this.activeChains.set(key, value);
			}
		}
		for (let [key, value] of this.activeChains)
		{
			value.iteration = value.multiplier.length;
		}
	}

	updateChainList(mtype: MineralType, mclass: ComboClass)
	{
		//please improve this
		//add chains if unlocked and not active
		if(this.unlockedChains.size > 0){
			for(let [key,value] of this.unlockedChains)
			{
				if(this.activeChains.size == 0 || !this.activeChains.has(key)){
					switch(value.chainType)
					{
						case ChainType.ANY: {
							this.activeChains.set(key,value);
							break;
						}
						case ChainType.LAST_ITEM: {
							value.type=mtype;
							value.class = mclass;
							this.activeChains.set(key,value);
							break;
						}
						case ChainType.ITEM_CLASS: {
							if(value.class == mclass) {
								this.activeChains.set(key,value);
							}
							break;
						}
						case ChainType.SPECIFIC_ITEM: {
							if(value.type == mtype) {
							this.activeChains.set(key,value);
							}
							break;
						}
						default: {
							break;
						}
					}
				}
			}
		}
	}

	cleanChains()
	{
		for(let [key,value] of this.activeChains)
		{
			if(!this.updateMap.has(key))
			{
				value.iteration = 0;
				this.activeChains.delete(key);
			}
		}
		this.updateMap.clear();
	}
	// safe delete
	cleanSelectedChain(key: number)
	{
		if(this.updateMap.has(key))
		{
			this.updateMap.delete(key);
		}
		if(this.activeChains.has(key))
		{
			this.activeChains.get(key)!.iteration = 0;
			this.activeChains.delete(key);
		}
	}

	clearActiveChains()
	{
		this.lastValuableClass = ComboClass.NONE;
		this.lastValuableItem = MineralType.NOTYPE;
		this.changeClassFlag = true;
		this.clearMineralMap();
		this.updateMap.clear();
		for (let value of this.activeChains.values())
		{
			value.iteration = 0;
		}
		this.activeChains.clear();
	}

	clearMineralMap()
	{
		this.myMap.clear();
	}

	updateMineralTracking()
	{
		if(!this.myMap.has(this.lastTrackedClass))
		{
			this.changeClassFlag = true;
			// pick most valuable last class
			if(this.myMap.size > 0){
				for(let key of this.myMap.keys())
				{
					if(key > this.lastValuableClass)
					{
						this.lastValuableClass = key;
					}
				}
			}
		} else {
			this.lastValuableClass = ComboClass.NONE;
			this.changeClassFlag = false;
		}
	}

	updateChainStatus(mtype: MineralType, mclass: ComboClass): number
	{
		// iterating separately over activeChains as assuming this is going to always be smaller than all chains
		let multiplier = 1;
		if(this.activeChains.size > 0)
		{
			//update list of collected
			if(!this.myMap.has(mclass))
			{
				this.myMap.set(mclass, 1);
			} else {
				this.myMap.set(mclass, this.myMap.get(mclass)!+1);
			}

			for(let [key,value] of this.activeChains)
			{
				if(value.chainType == ChainType.ITEM_CLASS && value.class == mclass) {
					multiplier = this.updateMultiplier(value, multiplier);
					this.updateChainFlags(key);
				} else if (value.chainType == ChainType.SPECIFIC_ITEM && value.type == mtype) {
					multiplier = this.updateMultiplier(value, multiplier);
					this.updateChainFlags(key);
				} else if (value.chainType == ChainType.LAST_ITEM) {
					if(this.changeClassFlag)
					{
						if(this.lastValuableClass == ComboClass.NONE)
						{
							this.lastValuableClass = ComboClass.FRUIT;
						}
						value.class = this.lastValuableClass;
						this.lastTrackedClass = value.class;
						this.lastValuableClass = ComboClass.NONE;
						this.changeClassFlag = false;
						if(!this.transcending) {
							value.iteration = 1;
						}
					}
					if(value.class == mclass)
					{
						multiplier = this.updateMultiplier(value, multiplier);
					}
					this.updateChainFlags(key);
				} else if (value.chainType == ChainType.ANY) {
					multiplier = this.updateMultiplier(value, multiplier);
					this.updateChainFlags(key);
				}
			}
		}
		return multiplier;
	}

	updateChainFlags(key: number)
	{
		if(!this.updateMap.get(key))
		{
			this.updateMap.set(key, true);
		}
	}

	updateMultiplier(currChain: ItemChain, currMult: number): number
	{
		if(currChain.iteration > 0)
		{
			currMult *= currChain.multiplier[currChain.iteration-1];
		}
		if(currChain.iteration < currChain.multiplier.length)
		{
			currChain.iteration++;
		}
		return currMult;
	}

	toggleLimitBreak(): number
	{
		if(this.usageCount < this.maxUsage) {
			if(this.liminalTime == 0)
			{
				this.liminalTime = this.maxLiminal;
				this.nodeCounter = 0;
				this.usageCount++;
				this.transcending = true;
				this.maximizeChains();
				return 1;
			} else if (this.liminalTime > 0) {
				this.liminalTime = 0;
				this.nodeCounter = 0;
				this.transcending = false;
				this.clearActiveChains();
				return 2;
			}
		}
		return 0;
	}

	toggleZombie(sc: number): number
	{
		this.storedScore = sc;
		this.isZombie = true;
		return this.popZombieNumber();
	}
	popZombieNumber(): number
	{
		return 1+ Math.trunc(this.currentValue*this.storedScore);
	}
	advanceZombie()
	{
		this.currentValue += this.lastValue;
		//this.lastlastValue = this.lastValue;
		//this.lastValue = this.currentValue;
	}

	untoggleZombie()
	{
		this.isZombie = false;
	}

	resetZombie()
	{
		this.isZombie = false;
		this.storedScore = 0;
		this.lastValue = this.staticinc;
		//this.lastlastValue = this.staticinc;
		this.currentValue = this.staticinc;
	}

	updateLimitBreak(t: number): number
	{
		if(this.transcending) {
			if(this.liminalTime >= 0)
			{
				this.liminalTime -= t;
				if (this.liminalTime < 0)
				{
					this.percent = 0;
					this.liminalTime = 0;
	//				this.emit("limitbreakend", this.level);
					this.transcending = false;
					this.clearActiveChains();
					return 2;
				}
				this.percent = (((this.liminalTime/this.maxLiminal) > (this.nodeCounter/this.maxNodes)) ? (this.liminalTime/this.maxLiminal) : (this.nodeCounter/this.maxNodes));

				return 1;
			} else {
				return 0;
			}
		}
		return 0;
	}

	addMaxEnergy(amount: number) {
		this.maxEnergy += amount;
	}

	reset() {
		this.level = 0;
		this.energy = this.maxEnergy;
		this.harvestCount = 0;
	}

	resetLimitBreak(): boolean
	{
		this.clearActiveChains();
		this.transcending = false;
		this.usageCount = 0;
		if(this.liminalTime > 0)
		{
			// play the thingy if you returned while in the chains
			this.liminalTime = 0;
			return true;
		} else {
			this.liminalTime = 0;
			return false;
		}

	}

	updateTreeScore(score: number) {
		const level1 = 10;
		const level2 = 30;
		const level3 = 500;

		let minSize, maxSize, interpolant;

		if (score < level1) {
			this.level = 0;

			minSize = 100;
			maxSize = 0;
			interpolant = Math.max(score, 1) / level1;
		}

		else if (score < level2) {
			this.level = 1;

			minSize = 150;
			maxSize = 350;
			// interpolant = Math.max(score, 1) / level2;
			interpolant = (score - level1) / (level2 - level1);
		}

		else if (score < level3) {
			this.level = 2;

			minSize = 300;
			maxSize = 500;
			interpolant = (score - level2) / (level3 - level2);
		}

		else {
			this.level = 3;

			// Softcap log function
			const height = 100 * Math.log10((score + 1) * Math.pow(10, 2));
			this.setTreeSize(height);
			return;
		}

		const height = minSize + (maxSize - minSize) * interpolant;
		this.setTreeSize(height);
	}

	setTreeSize(height: number) {
		// Rescale sprite
		// this.treeSprite.setScale(height * this.scene.SCALE / this.treeSprite.height);
		this.treeContainer.setScale(height);
	}

	harvest() {
		this.harvestCount -= 1;

		let fruit = this.fruits.find(fruit => fruit.visible);
		if (fruit) {
			fruit.setVisible(false);
		}
	}

	upgradeFruit(itemData) {
		this.basevalue = itemData.value[itemData.iteration-1];
		this.fruits.forEach(fruit => {
			fruit.setTexture(itemData.image[itemData.iteration-1]);
		});
	}


	get level() {
		return this._level;
	}

	set level(value: number) {
		if (this._level != value) {
			this._level = value;

			this.fruits.forEach(fruit => fruit.setVisible(false));

			this.treeContainer.y = 0;
			this.treeSprite.setOrigin(0.5, 1.0);
			this.treeContainer.y = 0;
			this.treeOutlineFilter.setOutlineColor(0x1B5E20);

			if (this.level <= 0) {
				this.treeSprite.setTexture("seed");
				this.treeContainer.y = 50*this.scene.SCALE;
				this.treeSprite.setOrigin(0.5);
				this.treeOutlineFilter.setOutlineColor(0x4e342e);
				this.harvestCount = 0;
			}
			else if (this.level == 1) {
				this.treeSprite.setTexture("sapling");
				this.harvestCount = 1;
			}
			else if (this.level == 2) {
				this.treeSprite.setTexture("tree_little");
				this.fruits[0].setVisible(true).setPosition(-0.27*this.scene.SCALE, -0.68*this.scene.SCALE);
				this.fruits[1].setVisible(true).setPosition( 0.28*this.scene.SCALE, -0.58*this.scene.SCALE);
				this.harvestCount = 2;
			}
			else if (this.level >= 3) {
				this.treeSprite.setTexture("tree");
				this.fruits[0].setVisible(true).setPosition(-0.27*this.scene.SCALE, -0.65*this.scene.SCALE);
				this.fruits[1].setVisible(true).setPosition( 0.00*this.scene.SCALE, -0.84*this.scene.SCALE);
				this.fruits[2].setVisible(true).setPosition( 0.25*this.scene.SCALE, -0.60*this.scene.SCALE);
				this.harvestCount = 3;
			}

			// Resize tree
			this.treeSprite.setScale(this.scene.SCALE / this.treeSprite.height);
			// Resize and expand input area
			const inputPadding = 0.1 * this.scene.SCALE / this.treeSprite.scaleX;
			this.treeSprite.input?.hitArea.setTo(-inputPadding, -inputPadding, this.treeSprite.width+2*inputPadding, this.treeSprite.height+2*inputPadding);

			this.emit("levelUp", this.level);
		}
	}
}