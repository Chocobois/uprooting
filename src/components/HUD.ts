import { BaseScene } from "../scenes/BaseScene";
import { RoundRectangle } from "./RoundRectangle";
import { Button } from "./Button";


export function interpolateColor(color1: number, color2: number, value: number): number {
	if (value <= 0) { return color1; }
	if (value >= 1) { return color2; }
	return Phaser.Display.Color.ObjectToColor(
		Phaser.Display.Color.Interpolate.ColorWithColor(
			Phaser.Display.Color.ValueToColor(color1),
			Phaser.Display.Color.ValueToColor(color2),
		255, value * 255)
	).color;
}


export class HUD extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private moneyBorder: RoundRectangle;
	private moneyBack: RoundRectangle;
	private moneyIcon: Phaser.GameObjects.Image;
	private moneyText: Phaser.GameObjects.Text;
	private scoreText: Phaser.GameObjects.Text;

	private energyBorder: RoundRectangle;
	private energyBack: RoundRectangle;
	private energyMeter: RoundRectangle;
	private energyIcon: Phaser.GameObjects.Image;
	private energyText: Phaser.GameObjects.Text;


	constructor(scene: BaseScene) {
		super(scene);
		this.scene = scene;
		this.scene.add.existing(this);
		this.setDepth(1000000);
		this.setScrollFactor(0);


		// Outer
		const h = 0.065 * this.scene.H;
		const y = this.scene.H - 0.75 * h;
		const rad = h / 2;
		const iconSize = 1.4*h;
		const textSize = 0.7*h;

		// Inner
		const pad = 0.2 * h;
		const ih = h - pad;
		const irad = ih / 2;

		const mw = 0.12 * this.scene.W;
		const mx = mw/2 + 3*pad;
		const imw = mw - pad;
		const ml = mx - mw/2 + pad;

		this.moneyBorder = new RoundRectangle(this.scene, mx, y, mw, h, rad, 0xefebe9);
		this.add(this.moneyBorder);

		this.moneyBack = new RoundRectangle(this.scene, mx, y, imw, ih, irad, 0xCBAE82);
		this.add(this.moneyBack);

		this.moneyIcon = this.scene.add.image(ml, y, "coin");
		this.moneyIcon.setScale(iconSize / this.moneyIcon.height);
		this.add(this.moneyIcon);

		this.moneyText = this.scene.createText(ml+0.6*iconSize, y, textSize, "#000", "1,234");
		this.moneyText.setOrigin(0.0, 0.57);
		this.add(this.moneyText);

		this.scoreText = this.scene.createText(ml+0.6*iconSize, y, textSize, "#000", "1,134");
		this.scoreText.setOrigin(0.0, 3.50);
		this.add(this.scoreText);

		const ew = 0.2 * this.scene.W;
		// const ex = mx + mw/2 + ew/2 + 5*pad;
		const ex = this.scene.W - ew/2 - 1*pad;
		const iew = ew - pad;
		const el = ex - ew/2 + pad;

		this.energyBorder = new RoundRectangle(this.scene, ex, y, ew, h, rad, 0xefebe9);
		this.add(this.energyBorder);

		this.energyBack = new RoundRectangle(this.scene, ex, y, iew, ih, irad, 0x666666);
		this.add(this.energyBack);

		this.energyMeter = new RoundRectangle(this.scene, ex, y, iew, ih, irad, 0xFFFFFF);
		this.energyMeter.setOrigin(0, 0.5);
		this.energyMeter.x = this.energyBack.x - this.energyBack.width/2;
		this.add(this.energyMeter);

		this.energyIcon = this.scene.add.image(el, y, "energy");
		this.energyIcon.setScale(iconSize / this.energyIcon.height);
		this.add(this.energyIcon);

		this.energyText = this.scene.createText(ex, y, textSize, "#000", "50/100");
		this.energyText.setOrigin(0.5, 0.57);
		this.add(this.energyText);

	}

	update(time: number, delta: number, money: number, energy: number, maxEnergy: number, score: number = 0) {

		this.moneyText.setText(`${money}`);
		this.energyText.setText(`${energy}/${maxEnergy}`);
//		this.scoreText.setText(`${score}`);

		const factor = energy / maxEnergy;
		this.energyMeter.setWidth(factor * this.energyBack.width);
		this.energyMeter.setColor(interpolateColor(0xf44336, 0x4caf50, factor));
	}
}
