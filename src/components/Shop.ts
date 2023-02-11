import { GameScene } from './../scenes/GameScene';
import { Button } from "./Button";
import { ShopItem } from "./ShopItem";


export enum ItemType {
	TreeEnergy,
	FruitUpgrade,
	RockBreak,
	TreeEfficiency,
	ChainUpgrade,
	SuperChain,
	BombUpgrade,
	ShopOwner,
	SoldOut,
	EnergyRefund,
	NOTYPE,
}

export interface ItemData {
	type: ItemType,
	image: string[];
	title: string[];
	description: string[];
	iteration: number;
	maxIteration: number;
	price: number[];
	value: number[];
	sideEffect: ((() => void) | null)[];
}

const SOLD_OUT_ITEM: ItemData = {
	type: ItemType.SoldOut,
	image: ["shop_sold_out"],
	title: ["Out of stock"],
	description: ["I give up. That's it."],
	iteration:1,
	maxIteration: 1,
	value: [9999],
	price: [0],
	sideEffect: [null],
};

const OWNER: ItemData = {
	type: ItemType.ShopOwner,
	image: ["shop_sold_out"],
	title: ["Shop owner"],
	description: ["H-hey, I'm not for sale!"],
	iteration:1,
	maxIteration: 1,
	value: [9999],
	price: [0],
	sideEffect: [null],
};


export class Shop extends Phaser.GameObjects.Container {
	public scene: GameScene;

	// Overworld
	private overworldShop: Button;
	private overworldShopScale: number;

	// Overlay popup
	private background: Phaser.GameObjects.Image;
	private ownerButton: Button;
	private ownerImage: Phaser.GameObjects.Image;
	private foreground: Phaser.GameObjects.Image;
	private exitButton: Button;
	private buyImage: Phaser.GameObjects.Image;
	private buyButton: Button;
	// private selectedItemImage: Phaser.GameObjects.Image;
	private selectedItemTitle: Phaser.GameObjects.Text;
	private selectedItemDescription: Phaser.GameObjects.Text;

	private items: ShopItem[];
	private selectedItem: ItemData | null;

	private itemsForSale: ItemData[];

	//dumping ground for ItemData, just put it here if you need somewhere to store it
	private restrictedItems: ItemData[];

	//cannot add new items before this number
	private reserveNumber: number;
	//stuff to be pushed to shop queue
	private queueMap: Map<number, number>;


	constructor(scene: GameScene, x: number, y: number) {
		super(scene);
		this.scene = scene;
		this.scene.add.existing(this);
		this.setDepth(100000);

		this.reserveNumber = 3;
		this.queueMap = new Map();

		this.itemsForSale = [
			{
				type: ItemType.TreeEnergy,
				image: ["sapling","sapling","sapling","sapling","sapling","sapling"],
				title: ["Magic Storage","Magic Font","Magical Spring", "Great Heart of Magic","Unified Magic Theory", "Magia of the Developer"],
				description: ["Increase your root energy a little.","Increase your root energy significantly.","Increase your root energy by a huge amount.","Increase your root energy massively.","An inconceivable amount of root energy!"],
				price: [150,1000,5000,50000,200000,1000000],
				iteration: 1,
				maxIteration: 6,
				value: [150,500,1000,5000,10000,33350],
				sideEffect: [null,null,() => this.addItemToEmptySlot(this.restrictedItems[1]),null,null],
				//fixme both this and below should use overwriteOldItem because it already handles empty check
			},
			{
				type: ItemType.FruitUpgrade,
				image: ["orange", "pear", "cherry", "banana", "dragonfruit", "dragondragonfruit"],
				title: ["Orange Essence", "Pear Essence", "Cherry Essence", "Banana Essence", "Dragonfruit Essence", "Dragondragonfruit Essence"],
				description: ["Magically grow oranges on your tree!","Magically grow pears on your tree!","Magically grow cherries on your tree!","Magically grow bananas on your tree!","Magically grow dragonfruit on your tree! Dragonfruit doesn't even grow on trees!", "Dragondragonfruit! There's a strange cube inside of it."],
				price: [500, 750, 1250, 2500, 5000, 12500],
				iteration:1,
				maxIteration: 6,
				value: [100, 150, 250, 500, 1000, 2500],
				sideEffect: [() => this.addItemToEmptySlot(this.restrictedItems[0]),
					null,() => this.addNewItemByIndex(4),null,null,() => this.addItemToEmptySlot(this.restrictedItems[3])],
			},
			{
				type: ItemType.RockBreak,
				image: ["bones", "ylw_badrock", "badrock", "ruby", "gray_badrock","ancient_diamond","demon_rock","curse_rock"],
				title: ["Hard Roots","Iron Roots","Titanium Roots","Gluttonous Roots","Adamantite Roots","Prosperous Roots","Dauntless Roots","Roots of the Developer"],
				description: ["Gain the ability to break through bones!","Break through rocks!","Break through hard rocks!","Break through and harvest gems!","Break through bedrock!","Break and harvest ancient diamonds! Superb!","Break through hot rocks!","Venture into the unknown..."],
				price: [3200,25000,75000,250000,375000,1150000,1500000,9999999],
				iteration:1,
				maxIteration:8,
				value: [2,3,4,5,6,7,8,9],
				sideEffect: [() => this.overwriteOldItem(this.restrictedItems[2]),null,null,null,null,null,null,null],
			},
			SOLD_OUT_ITEM,
			SOLD_OUT_ITEM,
			SOLD_OUT_ITEM
		];

		this.restrictedItems = [
			{
				type: ItemType.ChainUpgrade,
				image: ["applecore","applecore","applecore"],
				title: ["Apple Eater","Apple Jack", "Apple Devourer"],
				description: ["Chain apple cores for a bonus. How's them apples?","Upgrade apple chains. For a great lover of apples.","For apple experts. Probably not healthy."],
				price: [150,350,750],
				iteration: 1,
				maxIteration: 3,
				value: [0,1,2],
				sideEffect: [null,null,null],
			},
			{
				type: ItemType.TreeEfficiency,
				image: ["energy2","energy2","energy2","energy2","energy2"],
				title: ["Frugal Roots","Ascetic Roots","Penitent Roots","Determined Roots","True Gaia Roots"],
				description: ["Use a little less energy to grow.","Use somewhat less energy to grow.","Use significantly less energy to grow.","Use far less energy to grow.","Grow with the utmost energy efficiency."],
				price: [500, 3500, 12500, 50000, 250000],
				iteration: 1,
				maxIteration: 5,
				value: [0.98, 0.95, 0.9, 0.85, 0.8],
				sideEffect: [null,null,null,null,null],
			},
			{
				type: ItemType.ChainUpgrade,
				image: ["applecore","applecore","applecore","bone","bone"],
				title: ["Apple Eater","Apple Jack", "Apple Devourer","Bone Sucker", "Bone Cruncher"],
				description: ["Chain apple cores for a bonus. How's them apples?","Upgrade apple chains. For a great lover of apples.","For apple experts. Probably not healthy.", "Consume a chain of bones for score. Gross.", "Improved bone chaining. Minerals are good for trees."],
				price: [200,600,800,1000,1500],
				iteration: 4,
				maxIteration: 5,
				value: [0,1,2,3,4],
				sideEffect: [null,null,null,null,null],
			},
			{
				type: ItemType.SuperChain,
				image: ["greendice"],
				title: ["Lucky Dice"],
				description: ["A lucky dice which randomly improves your chains. I wonder where it's from..."],
				price: [3621],
				iteration: 1,
				maxIteration: 1,
				value: [1],
				sideEffect: [null],
			},
			{
				type: ItemType.BombUpgrade,
				image: ["cherrybomb"],
				title: ["Cherry Bomb"],
				description: ["Sometimes explodes to remove impassable objects. Designed it myself!"],
				price: [4200],
				iteration: 1,
				maxIteration: 1,
				value: [0.05],
				sideEffect: [null],
			},
			{
				type: ItemType.SuperChain,
				image: ["greendice"],
				title: ["Twilight Feather"],
				description: ["A feather that manipulates polarity. Briefly maxes all chains."],
				price: [96420],
				iteration: 1,
				maxIteration: 1,
				value: [1],
				sideEffect: [null],
			},
			{
				type: ItemType.ChainUpgrade,
				image: ["greendice"],
				title: ["Cat's Riddle"],
				description: ["The -ground- is -scared- of the -tree-. Chain off your last item!"],
				price: [13337],
				iteration: 1,
				maxIteration: 1,
				value: [1],
				sideEffect: [null],
			},
			{
				type: ItemType.EnergyRefund,
				image: ["energy2","energy2","energy2","energy2","energy2"],
				title: ["Frugal Roots","Ascetic Roots","Penitent Roots","Determined Roots","Fusion-Cored Roots"],
				description: ["Restore a tiny amount of energy while growing.","Restore a modest amount of energy while growing.","Restore a significant amount of energy while growing.","Restore a large amount of energy while growing.","Restore an incredible amount of energy while growing."],
				price: [500, 3500, 12500, 50000, 250000],
				iteration: 1,
				maxIteration: 5,
				value: [5, 10, 25, 50, 100],
				sideEffect: [null,null,null,null,null],
			},
		];

		const W = this.scene.W;
		const H = this.scene.H;

		// Overworld

		// House
		this.overworldShopScale = 0;
		this.overworldShop = new Button(this.scene, x, y);
		let house = this.scene.add.image(0, 0, "overworld_shop");
		house.setScrollFactor(0.9);
		house.setScale(0.4 * H / house.height);
		house.setOrigin(0.5, 1.0);
		this.overworldShop.add(house);
		this.overworldShop.y -= 0.4*house.displayHeight;
		this.overworldShop.bindInteractive(house);
		this.overworldShop.on("click", () => {
			this.emit("open");
		});
		this.overworldShop.setVisible(false);


		// Overlay shop

		// Background
		this.background = this.scene.add.image(0, 0, "shop_background");
		this.background.setOrigin(0);
		this.scene.fitToScreen(this.background);
		this.add(this.background);
		this.background.setInteractive().on('pointerdown', () => {
			this.selectItem(null);
		}, this)

		const jx = 0.61 * W;
		const jy = 0.67 * H;
		const jh = 0.88 * H;
		this.ownerButton = new Button(this.scene, jx, jy);
		this.add(this.ownerButton);

		this.ownerImage = this.scene.add.image(0, 0, "jbun");
		this.ownerImage.setOrigin(0.5, 0.8);
		this.ownerImage.setScale(jh / this.ownerImage.height);
		this.ownerButton.add(this.ownerImage);

		this.ownerButton.bindInteractive(this.ownerImage);
		this.ownerImage.input.hitArea.setTo(0, 0, this.ownerImage.width, this.ownerImage.height * 2/3);
		this.ownerButton.on("down", () => {
			this.scene.sound.play("s_squish1", {rate: 1 + 0.07*Math.sin(this.scene.time.now/800)});
		});
		this.ownerButton.on("click", () => {
			this.selectItem(OWNER);
			this.ownerImage.setFrame(2);
			this.scene.sound.play("s_squish2", {rate: 1 + 0.07*Math.sin(this.scene.time.now/800)});
		});


		// Foreground
		this.foreground = this.scene.add.image(0, 0, "shop_foreground");
		this.foreground.setOrigin(0);
		this.scene.fitToScreen(this.foreground);
		this.add(this.foreground);


		// Exit sign
		this.exitButton = new Button(this.scene, .88*W, 0);
		this.add(this.exitButton);

		let exitImage = this.scene.add.image(0, 0, "shop_exit_sign");
		exitImage.setOrigin(0.5, 0);
		exitImage.setScale(0.3 * H / exitImage.height);
		this.exitButton.add(exitImage);

		this.exitButton.bindInteractive(exitImage);
		this.exitButton.on("click", this.close, this);


		// Selected item
		const sx = .43*W
		const sy = .81*H;

		// this.selectedItemImage = this.scene.add.image(sx, sy, "bones");
		// this.selectedItemImage.setScale(.1*H / this.selectedItemImage.height);
		// this.add(this.selectedItemImage);

		this.selectedItemTitle = this.scene.createText(sx, sy, 62*this.scene.SCALE, "#000", "Something");
		this.selectedItemTitle.setOrigin(0, 1.08);
		this.add(this.selectedItemTitle);

		this.selectedItemDescription = this.scene.createText(sx, sy, 52*this.scene.SCALE, "#000", "Culpa ut quis ullamco nisi aliqua id est occaecat proident aliqua in.");
		this.selectedItemDescription.setWordWrapWidth(3.6*W);
		this.selectedItemDescription.setLineSpacing(0);
		this.selectedItemDescription.setOrigin(0, -0.08);
		this.add(this.selectedItemDescription);


		// Buy button
		this.buyButton = new Button(this.scene, .89*W, .81*H);
		this.add(this.buyButton);

		this.buyImage = this.scene.add.image(0, 0, "shop_buy_button");
		this.buyImage.setOrigin(0.5);
		this.buyImage.setScale(0.17 * H / this.buyImage.height);
		this.buyButton.add(this.buyImage);

		let buyText = this.scene.createText(0, 0, 100*this.scene.SCALE, "#000", "Buy");
		buyText.setOrigin(0.5);
		this.buyButton.add(buyText);

		this.buyButton.bindInteractive(this.buyImage);
		this.buyButton.on("click", this.buyItem, this);


		// Items
		this.items = [];
		this.selectedItem = null;

		const itemLeft = 160 * this.scene.SCALE;
		const itemTop = 195 * this.scene.SCALE;
		const itemWidth = 320 * this.scene.SCALE;
		const itemHeight = 306 * this.scene.SCALE;
		const itemSize = 280 * this.scene.SCALE;

		for (let j = 0; j < 3; j++) {
			for (let i = 0; i < 2; i++) {
				const x = itemLeft + i * itemWidth;
				const y = itemTop + j * itemHeight;

				let item = new ShopItem(this.scene, x, y, itemSize);
				item.on("click", () => {
					this.selectItem(item.itemData);
					this.scene.sound.play("s_click");
				}, this);
				this.add(item);
				this.items.push(item);
			}
		}


		// Init

		this.updateItemsForSale();
		this.selectItem(null);
		this.close();
	}

	update(time: number, delta: number) {
		this.overworldShop.setScale(this.overworldShopScale - 0.1 * this.overworldShop.holdSmooth);
		this.exitButton.setScale(1.0 - 0.1 * this.exitButton.holdSmooth);
		this.buyButton.setScale(1.0 - 0.1 * this.buyButton.holdSmooth * (this.buyButton.enabled ? 1 : 0));

		const jbunHoldX = 1.0 + 0.3 * this.ownerButton.holdSmooth;
		const jbunHoldY = 1.0 - 0.2 * this.ownerButton.holdSmooth;
		const jbunSquish = 0.04;
		this.ownerButton.setScale(
			(1.0 + jbunSquish * Math.sin(time/200)) * jbunHoldX,
			(1.0 + jbunSquish * Math.sin(-time/200)) * jbunHoldY
		);

		this.items.forEach(item => {
			item.update(time, delta, item.itemData == this.selectedItem, this.scene.money);
		});
	}


	updateItemsForSale() {
		for(let [key,value] of this.queueMap)
		{
			//use this to not check twice against map
			if(this.overwriteOldItem(this.restrictedItems[key]))
			{
				this.queueMap.delete(key);
			}
		}
		this.items.forEach((item, index) => {
			if (index < this.itemsForSale.length) {
				const itemData = this.itemsForSale[index];

				item.setItem(itemData);
			}
		});
	}

	addToShopQueue(index: number, value: ItemData = SOLD_OUT_ITEM): boolean
	{
		//may add an option to just put in an ItemData later but dead code for now
		let myItem = value;
		if(index < this.restrictedItems.length)
		{
			myItem = this.restrictedItems[index];
		}
		//don't push things that are already there
		//if you want multiples just add duplicates to restrictedItems
		if(!this.queueMap.has(index))
		{
			this.queueMap.set(index,this.queueMap.size);
			return true;
		}
		return false;
	}

	//add to shop, or to queue if full, returns false if failed
	addNewItemByIndex(index: number): boolean
	{
		if(index >= this.restrictedItems.length) {
			return false;
		}
		if(this.overwriteOldItem(this.restrictedItems[index])) {
			return true;
		} else if (this.addToShopQueue(index)) {
			return true;
		} else {
			return false;
		}
	}

	//next two methods take an index and overwrite identical items, return if it succeeds
	//maybe we can use this for branching upgrade paths nya
	overwriteOldItem(newItem: ItemData): boolean
	{
		for(let l = 0; l < this.itemsForSale.length; l++)
		{
			if(newItem.type == this.itemsForSale[l].type)
			{
				let iter = this.itemsForSale[l].iteration;
				this.itemsForSale[l]=newItem;
				if(this.itemsForSale[l].iteration > iter)
				{
					this.itemsForSale[l].iteration = iter;
				}
				return true;
			}
		}
		return this.addItemToEmptySlot(newItem);;
	}

	addItemToEmptySlot(newItem: ItemData): boolean
	{
		let index = this.reserveNumber-1
		for(let l = this.reserveNumber-1; l < this.itemsForSale.length ; l++){
			if(this.itemsForSale[index] == SOLD_OUT_ITEM)
			{
				this.itemsForSale[index] = newItem;
				return true;
			}
			index++;
		}
		return false;
	}

	selectItem(itemData: ItemData | null, justPurchased: boolean = false) {
		this.selectedItem = itemData;

		this.buyButton.enabled = false;
		this.buyButton.setAlpha(0.5);
		this.buyImage.input.cursor = "not-allowed"
		this.ownerImage.setFrame(0);

		if (itemData) {
			const cost = itemData.price[itemData.iteration-1];

			// if (this.scene.money >= cost) {
				// this.selectedItemImage.setTexture("apple");
				this.selectedItemTitle.setText(itemData.title[itemData.iteration-1]);
				this.selectedItemDescription.setText(itemData.description[itemData.iteration-1]);
				
				if (cost > 0) {
					// If tag labels work correctly, this won't be needed
					// this.selectedItemDescription.setText(`${itemData.description[itemData.iteration-1]}\nOnly ${cost} gold!`);
					this.ownerImage.setFrame(1);

					if (this.scene.money >= cost) {
						this.buyButton.enabled = true;
						this.buyButton.setAlpha(1.0);
						this.buyImage.input.cursor = "pointer"
					}
				}
			// }
			// else {
				// this.selectedItemTitle.setText("Shop owner");
				// this.selectedItemDescription.setText(
					// `You can't afford that!\nThe ${itemData.title[itemData.iteration-1].toLocaleLowerCase()}\nis ${cost} gold.`
				// );
				// this.scene.sound.play("s_nofunds");
			// }
		}
		else {
			if (justPurchased) {
				this.selectedItemTitle.setText("Whatever");
				this.selectedItemDescription.setText("Thanks for buying it!");
			}
			else {
				this.selectedItemTitle.setText("None selected");
				this.selectedItemDescription.setText("What are ya buying? What are ya selling? I don't know!");
			}
		}
	}

	buyItem() {
		if (!this.buyButton.enabled) { return; }

		if (this.selectedItem) {
			const cost = this.selectedItem.price[this.selectedItem.iteration-1];

			if (this.scene.money >= cost) {
				this.scene.money -= cost;
				this.scene.sound.play("s_buy");
				this.emit("buy", this.selectedItem);
				const sideEffect = this.selectedItem.sideEffect[this.selectedItem.iteration-1];
				if(sideEffect)
				{
					sideEffect();
				}
				this.upgradeShopItem(this.selectedItem);

			}
		}
	}

	upgradeShopItem(itemData: ItemData) {
		const index = this.itemsForSale.indexOf(itemData);

		if (itemData.type == ItemType.TreeEnergy) {
			itemData.price[itemData.iteration-1] = Math.round(itemData.price[itemData.iteration-1] * 1.5);
		}
		if (itemData.type == ItemType.FruitUpgrade) {
			itemData.price[itemData.iteration-1] = Math.round(itemData.price[itemData.iteration-1] * 2.0);
			// Go through a list...
		}
		itemData.iteration++;
		if (itemData.iteration > itemData.maxIteration) {
			this.itemsForSale[index] = SOLD_OUT_ITEM;
		}
		this.selectItem(null, true);
		this.updateItemsForSale();
	}


	activateOverworldShop() {
		this.overworldShop.setVisible(true);

		this.scene.tweens.add({
			targets: this,
			overworldShopScale: { from: 0, to: 1 },
			ease: 'Back.Out',
			duration: 700,
			delay: 500
		});
	}


	open() {
		this.setVisible(true);
		this.selectItem(null);
	}

	close() {
		this.setVisible(false);
		if (this.scene.time.now > 5) this.scene.sound.play("s_nofunds");
		this.emit("close");
	}
}
