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
	public treeSprite: Phaser.GameObjects.Image;

	public level: number;
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
	public liminalTime: number;


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
		this.refundValue = 0;
		this.energyMitigation = 1;
		this.unlockedChains = new Map();
		this.activeChains = new Map();
		this.updateMap = new Map();
		
		this.superChains = false;
		this.bruteStrength = false;
		this.bruteness = 0;
		this.bruteChance = 0;
		this.persistence = 0;
		
		this.limitBreak = false;
		this.liminalTime = 0;
		
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
				multiplier: [1.5,2.5,5],
				iteration: 0,
				chainID: 1,
				hasBeenActive: false,
				chainType: ChainType.SPECIFIC_ITEM
			},
			{
				type: MineralType.applecore,
				class: 	ComboClass.FRUIT,
				multiplier: [1.5,2.5,5,10],
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
				type: MineralType.diamond,
				class: 	ComboClass.GEM,
				multiplier: [1.5,2.5,5],
				iteration: 0,
				chainID: 10,
				hasBeenActive: false,
				chainType: ChainType.ITEM_CLASS
			},

			{
				type: MineralType.badrock,
				class: 	ComboClass.ROCK,
				multiplier: [3,10],
				iteration: 0,
				chainID: 4,
				hasBeenActive: false,
				chainType: ChainType.ITEM_CLASS
			},
		];


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
		this.updateMap.clear();
		for (let value of this.activeChains.values())
		{
			value.iteration = 0;
		}
		this.activeChains.clear();
	}

	updateChainStatus(mtype: MineralType, mclass: ComboClass): number
	{
		// iterating separately over activeChains as assuming this is going to always be smaller than all chains
		let multiplier = 1;
		if(this.activeChains.size > 0)
		{
			for(let [key,value] of this.activeChains)
			{
				if(value.chainType == ChainType.ITEM_CLASS && value.class == mclass) {
					multiplier = this.updateMultiplier(value, multiplier);
					this.updateChainFlags(key);
				} else if (value.chainType == ChainType.SPECIFIC_ITEM && value.type == mtype) {
					multiplier = this.updateMultiplier(value, multiplier);
					this.updateChainFlags(key);
				} else if (value.chainType == ChainType.LAST_ITEM) {
					if(value.type == mtype)
					{
						multiplier = this.updateMultiplier(value, multiplier);
					} else {
						value.type = mtype;
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
		const treeSize = this.scene.H * (.1 + ((score > 500) ? (5 + 0.0001*score) : (.01 * score)));
		const inputPadding = 40 * this.scene.SCALE / this.treeSprite.scaleX;
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
		this.treeSprite.setScale(treeSize / this.treeSprite.width);
		this.treeSprite.input.hitArea.setTo(-inputPadding, -inputPadding, this.treeSprite.width+2*inputPadding, this.treeSprite.height+2*inputPadding);
	}
}