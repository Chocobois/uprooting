import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";
import { ItemType, ItemData } from "./Shop";

export class ShopItem extends Button {

	private background: Phaser.GameObjects.Image;
	private itemContainer: Phaser.GameObjects.Container;
	private itemImage: Phaser.GameObjects.Image;
	private tagImage: Phaser.GameObjects.Image;
	private tagText: Phaser.GameObjects.Text;

	private size: number;
	private originalY;

	public itemData: ItemData | null;

	constructor(scene: BaseScene, x: number, y: number, size: number) {
		super(scene, x, y);
		this.size = size;
		this.originalY = y;
		this.itemData = null;


		// Background

		this.background = this.scene.add.image(10*this.scene.SCALE, 0, "fruit_upgrade");
		this.background.setScale(this.size / this.background.width);
		this.background.setTint(0xbbbbbb);
		this.add(this.background);


		// Tag

		const ty = 120 * this.scene.SCALE;
		const fontSize = 50 * this.scene.SCALE;

		this.tagImage = this.scene.add.image(0, ty, "item_tag", 0);
		this.tagImage.setOrigin(0.5, 0.0);
		this.tagImage.setScale(120 * this.scene.SCALE / this.tagImage.width);
		this.tagImage.setScale(2.2*this.tagImage.scaleX, 0.6*this.tagImage.scaleX); // Fix image, then remove this hack here
		this.add(this.tagImage);

		this.tagText = this.scene.createText(0, ty+0.2*fontSize, fontSize, "#000", "1234");
		this.tagText.setOrigin(0.5, 0.0);
		this.add(this.tagText);


		// Item

		this.itemContainer = this.scene.add.container();
		this.add(this.itemContainer);

		this.itemImage = this.scene.add.image(0, 0, "fruit_upgrade");
		this.itemContainer.add(this.itemImage);


		// Input

		this.bindInteractive(this.background, true);
		const inputPadding = 0 * this.scene.SCALE / this.background.scaleX;
		this.background.input?.hitArea.setTo(-inputPadding, -inputPadding, this.background.width+2*inputPadding, this.background.height+2*inputPadding);
		// this.scene.input.enableDebug(this.itemImage);
	}

	update(time: number, delta: number, isSelected: boolean, money: number) {
		if (this.available) {
			let wobble = 0.005*this.scene.H * Math.sin((time+this.x+2*this.y)/300);
			this.itemContainer.y = wobble;
		}

		this.itemContainer.setScale(1.0 - 0.1 * this.holdSmooth);

		if (isSelected) {
			this.itemImage.setAlpha(0.75 + 0.25 * Math.sin(time/100));
		}
		else {
			this.itemImage.setAlpha(1.0);
		}

		const tagTextColor = (money < this.getPrice() ? "#8e0000" : "black");
		this.tagText.setColor(tagTextColor);
	}


	setItem(itemData: ItemData) {
		this.itemData = itemData;

		this.itemImage.setTexture(itemData.image[itemData.iteration-1]);

		const scale = (itemData.type == ItemType.SoldOut ? 0.5 : 0.9);
		const origin = (itemData.type == ItemType.SoldOut ? 0.0 : 0.5);
		this.itemImage.setScale(scale * this.size / this.itemImage.width);
		this.itemImage.setOrigin(0.5, origin);

		this.background.setVisible(this.available);

		const price = this.getPrice();
		if (price > 0) {
			this.tagText.setVisible(true);
			this.tagImage.setFrame(0);
			this.tagText.setText(price.toString());
		}
		else {
			this.tagText.setVisible(false);
			this.tagImage.setFrame(2);
		}
	}

	getPrice(): number {
		if (this.itemData) {
			return this.itemData.price[this.itemData.iteration-1];
		}
		return 0;
	}

	get available(): boolean {
		return !!this.itemData && this.itemData.type != ItemType.SoldOut;
	}
}