import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";
import { ItemType, ItemData } from "./Shop";

export class ShopItem extends Button {
	private background: Phaser.GameObjects.Image;
	private image: Phaser.GameObjects.Image;
	private size: number;
	private originalY;

	public itemData: ItemData | null;

	constructor(scene: BaseScene, x: number, y: number, size: number) {
		super(scene, x, y);
		this.size = size;
		this.originalY = y;
		this.itemData = null;

		this.background = this.scene.add.image(0, 0, "fruit_upgrade");
		this.background.setScale(this.size / this.background.width);
		this.background.setTint(0xbbbbbb);
		this.add(this.background);

		this.image = this.scene.add.image(0, 0, "fruit_upgrade");
		this.add(this.image);

		this.bindInteractive(this.background, true);
		const inputPadding = 0 * this.scene.SCALE / this.background.scaleX;
		this.background.input.hitArea.setTo(-inputPadding, -inputPadding, this.background.width+2*inputPadding, this.background.height+2*inputPadding);
		// this.scene.input.enableDebug(this.image);
	}

	update(time: number, delta: number, isSelected: boolean) {
		if (this.available) {
			let wobble = 0.005*this.scene.H * Math.sin((time+this.x+2*this.y)/300);
			this.y = this.originalY + wobble;
		}

		this.setScale(1.0 - 0.1 * this.holdSmooth);

		if (isSelected) {
			this.image.setAlpha(0.75 + 0.25 * Math.sin(time/100));
		}
		else {
			this.image.setAlpha(1.0);
		}
	}


	setItem(itemData: ItemData) {
		this.itemData = itemData;

		this.image.setTexture(itemData.image);

		const scale = (itemData.type == ItemType.SoldOut ? 0.5 : 0.9);
		const origin = (itemData.type == ItemType.SoldOut ? 0.0 : 0.5);
		this.image.setScale(scale * this.size / this.image.width);
		this.image.setOrigin(0.5, origin);

		this.background.setVisible(this.available);
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