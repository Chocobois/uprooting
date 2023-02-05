import { GameScene } from './../scenes/GameScene';
import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";
import { ShopItem } from "./ShopItem";


export enum ItemType {
	TreeEnergy,
	FruitUpgrade,
	RockBreak,
	ShopOwner,
	SoldOut,
}

export interface ItemData {
	type: ItemType,
	image: string;
	title: string;
	description: string;
	price: number;
}

const SOLD_OUT_ITEM: ItemData = {
	type: ItemType.SoldOut,
	image: "shop_sold_out",
	title: "Out of stock",
	description: "I give up. That's it.",
	price: 0,
};

const OWNER: ItemData = {
	type: ItemType.ShopOwner,
	image: "shop_sold_out",
	title: "Shop owner",
	description: "H-hey, I'm not for sale!",
	price: 0,
};


export class Shop extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	// Overworld
	private overworldShop: Button;

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


	constructor(scene: BaseScene, x: number, y: number) {
		super(scene);
		this.scene = scene;
		this.scene.add.existing(this);
		this.setDepth(100000);


		this.itemsForSale = [
			{
				type: ItemType.TreeEnergy,
				image: "sapling",
				title: "Root Upgrade",
				description: "Increase your root energy",
				price: 10,
			},
			{
				type: ItemType.FruitUpgrade,
				image: "apple",
				title: "Fruit Upgrade",
				description: "Upgrade your fruit or something, i dunno",
				price: 50,
			},
			{
				type: ItemType.RockBreak,
				image: "bones",
				title: "Rock Breaker",
				description: "Gain the ability to break through rocks!",
				price: 200,
			},
			SOLD_OUT_ITEM,
			SOLD_OUT_ITEM,
			SOLD_OUT_ITEM
		];


		const W = this.scene.W;
		const H = this.scene.H;


		// Overworld

		// House
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
		this.ownerButton.on("down", () => {
			this.scene.sound.play("s_squish1");
		});
		this.ownerButton.on("click", () => {
			this.selectItem(OWNER);
			this.ownerImage.setFrame(2);
			this.scene.sound.play("s_squish2");
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

		this.selectedItemTitle = this.scene.createText(sx, sy, 60*this.scene.SCALE, "#000", "Something");
		this.selectedItemTitle.setOrigin(0, 1.05);
		this.add(this.selectedItemTitle);

		this.selectedItemDescription = this.scene.createText(sx, sy, 50*this.scene.SCALE, "#000", "Culpa ut quis ullamco nisi aliqua id est occaecat proident aliqua in.");
		this.selectedItemDescription.setWordWrapWidth(3.5*W);
		this.selectedItemDescription.setLineSpacing(0);
		this.selectedItemDescription.setOrigin(0, -0.05);
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
		const itemTop = 200 * this.scene.SCALE;
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
		this.overworldShop.setScale(1.0 - 0.1 * this.overworldShop.holdSmooth);
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
			item.update(time, delta, item.itemData == this.selectedItem);
		});
	}


	updateItemsForSale() {
		this.items.forEach((item, index) => {
			if (index < this.itemsForSale.length) {
				const itemData = this.itemsForSale[index];

				item.setItem(itemData);
			}
		});
	}

	selectItem(itemData: ItemData | null, justPurchased: boolean = false) {
		this.selectedItem = itemData;

		this.buyButton.enabled = false;
		this.buyButton.setAlpha(0.5);
		this.buyImage.input.cursor = "not-allowed"
		this.ownerImage.setFrame(0);

		if (itemData) {
			// this.selectedItemImage.setTexture("apple");
			this.selectedItemTitle.setText(itemData.title);
			this.selectedItemDescription.setText(itemData.description);
			
			if (itemData.price > 0) {
				this.selectedItemDescription.setText(`${itemData.description}\nOnly ${itemData.price} gold!`);
				this.buyButton.enabled = true;
				this.buyButton.setAlpha(1.0);
				this.buyImage.input.cursor = "pointer"
				this.ownerImage.setFrame(1);
			}
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
			const scene = this.scene as GameScene;
			if( scene.money >= this.selectedItem.price ) {
				scene.money -= this.selectedItem.price
				this.emit("buy", this.selectedItem);
				this.upgradeShopItem(this.selectedItem);
			} else {
				this.selectedItemTitle.setText("Shop owner");
				this.selectedItemDescription.setText(
					`You can't afford that!\nThe ${this.selectedItem.title.toLocaleLowerCase()}\nis ${this.selectedItem.price} gold.`
				);
				this.selectedItem = null;
				this.buyButton.enabled = false;
				this.buyButton.setAlpha(0.5);
			}
		}
	}

	upgradeShopItem(itemData: ItemData) {
		const index = this.itemsForSale.indexOf(itemData);

		if (itemData.type == ItemType.TreeEnergy) {
			itemData.price = Math.round(itemData.price * 1.5);
		}
		if (itemData.type == ItemType.FruitUpgrade) {
			itemData.price = Math.round(itemData.price * 2.0);
			itemData.image = "applecore";
			// Go through a list...
		}
		if (itemData.type == ItemType.RockBreak) {
			this.itemsForSale[index] = SOLD_OUT_ITEM;
		}

		this.selectItem(null, true);
		this.updateItemsForSale();
	}


	open() {
		this.setVisible(true);
		this.selectItem(null);
	}

	close() {
		this.setVisible(false);
		this.emit("close");
	}
}