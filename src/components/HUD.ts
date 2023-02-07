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
	private bombIcon: Phaser.GameObjects.Image;
	private bombBack: RoundRectangle;
	private bombBorder: RoundRectangle;
	private bombText: Phaser.GameObjects.Text;

	private energyBorder: RoundRectangle;
	private energyBack: RoundRectangle;
	private energyMeter: RoundRectangle;
	private energyIcon: Phaser.GameObjects.Image;
	private energyText: Phaser.GameObjects.Text;

	private scoreBorder: RoundRectangle;
	private scoreBack: RoundRectangle;
	private scoreIcon: Phaser.GameObjects.Image;
	private scoreText: Phaser.GameObjects.Text;


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

		//invis by default
		this.bombBorder = new RoundRectangle(this.scene, mx, (y-26), mw, h, rad, 0x373D83);
		this.bombBack = new RoundRectangle(this.scene, mx, (y-25.5), imw, ih, irad, 0xBB96A6);
		this.bombIcon = this.scene.add.image(ml, (y-28.5), "cherrybomb");
		this.bombIcon.setScale(iconSize / this.bombIcon.height);
		this.bombText = this.scene.createText(ml+0.4*iconSize, (y-25.5), (textSize), "#FFFFFF", "1,234");
		this.bombText.setOrigin(0.0, 0.57);


		const ew = 0.2 * this.scene.W;
		// const ex = mx + mw/2 + ew/2 + 5*pad;
		const ex = this.scene.W - ew/2 - 1*pad;
		const iew = ew - pad;
		const el = ex - ew/2 + pad;

		this.scoreBorder = new RoundRectangle(this.scene, ex, (y-26), ew, h, rad, 0xCFA2E8);
		this.add(this.scoreBorder);
		this.scoreBack = new RoundRectangle(this.scene, ex, (y-25.5), iew, ih, irad, 0x743083);
		this.add(this.scoreBack);
		this.scoreIcon = this.scene.add.image(el, (y-25.5), "tree");
		this.scoreIcon.setScale(iconSize / this.scoreIcon.height);
		this.add(this.scoreIcon);
		this.scoreText = this.scene.createText(ex, (y-24.5), textSize/1.2, "#FFFFFF", "Score: ");
		this.scoreText.setOrigin(0.5, 0.57);
		this.add(this.scoreText);


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

	addBombHUD()
	{
		this.add(this.bombBorder);
		this.add(this.bombBack);
		this.add(this.bombIcon);
		this.add(this.bombText);
	}

	hideScore()
	{
		this.scoreBorder.setAlpha(0);
		this.scoreBack.setAlpha(0);
		this.scoreIcon.setAlpha(0);
		this.scoreText.setAlpha(0);
	}

	unhideScore()
	{
		this.scoreBorder.setAlpha(1);
		this.scoreBack.setAlpha(1);
		this.scoreIcon.setAlpha(1);
		this.scoreText.setAlpha(1);
	}

	hideEnergy()
	{
		this.energyBorder.setAlpha(0);
		this.energyBack.setAlpha(0);
		this.energyMeter.setAlpha(0);
		this.energyIcon.setAlpha(0);
		this.energyText.setAlpha(0);
	}

	unhideEnergy()
	{
		this.energyBorder.setAlpha(1);
		this.energyBack.setAlpha(1);
		this.energyMeter.setAlpha(1);
		this.energyIcon.setAlpha(1);
		this.energyText.setAlpha(1);
	}


	update(time: number, delta: number, money: number, energy: number, maxEnergy: number, score: number = 0, bombs: number=0, persistence: number=0) {

		this.moneyText.setText(`${money}`);
		this.energyText.setText(`${energy}/${maxEnergy}`);
		this.scoreText.setText(`+ ${score}`);
		this.bombText.setText(` x${bombs}`)

		let bmc = 0x373D83;
		if (persistence > 0)
		{
			switch(persistence)
			{
				case 5: {
					bmc = 0x56EAFF;
					break;
				}
				case 4: {
					bmc = 0x5EFF56
					break;
				}
				case 3: {
					bmc = 0xFFFF56;
					break;
				}
				case 2: {
					bmc = 0xFFA556;
					break;
				}
				case 1: {
					bmc = 0xFF5656;
					break;					
				} default: {
					break;
				}
			}
		}
		this.bombBorder.setColor(bmc);

		const factor = energy / maxEnergy;
		this.energyMeter.setWidth(factor * this.energyBack.width);
		this.energyMeter.setColor(interpolateColor(0xf44336, 0x4caf50, factor));
	}
}
