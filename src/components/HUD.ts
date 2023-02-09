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

	private moneyContainer: Phaser.GameObjects.Container;
	private moneyBorder: RoundRectangle;
	private moneyBack: RoundRectangle;
	private moneyIcon: Phaser.GameObjects.Image;
	private moneyText: Phaser.GameObjects.Text;

	private bombContainer: Phaser.GameObjects.Container;
	private bombIcon: Phaser.GameObjects.Image;
	private bombBack: RoundRectangle;
	private bombBorder: RoundRectangle;
	private bombText: Phaser.GameObjects.Text;

	private energyContainer: Phaser.GameObjects.Container;
	private energyBorder: RoundRectangle;
	private energyBack: RoundRectangle;
	private energyMeter: RoundRectangle;
	private energyIcon: Phaser.GameObjects.Image;
	private energyText: Phaser.GameObjects.Text;

	private scoreContainer: Phaser.GameObjects.Container;
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
		const textSize = 0.8*h;

		// Inner
		const pad = 0.2 * h;
		const ih = h - pad;
		const irad = ih / 2;


		// Money

		const mw = 0.12 * this.scene.W;
		const mx = mw/2 + 3*pad;
		const imw = mw - pad;
		const ml = mx - mw/2 + pad;

		this.moneyContainer = this.scene.add.container();
		this.add(this.moneyContainer);

		this.moneyBorder = new RoundRectangle(this.scene, mx, y, mw, h, rad, 0xefebe9);
		this.moneyContainer.add(this.moneyBorder);

		this.moneyBack = new RoundRectangle(this.scene, mx, y, imw, ih, irad, 0xCBAE82);
		this.moneyContainer.add(this.moneyBack);

		this.moneyIcon = this.scene.add.image(ml, y, "coin");
		this.moneyIcon.setScale(iconSize / this.moneyIcon.height);
		this.moneyContainer.add(this.moneyIcon);

		this.moneyText = this.scene.createText(ml+0.6*iconSize, y, textSize, "#000", "1,234");
		this.moneyText.setOrigin(0.0, 0.5);
		this.moneyContainer.add(this.moneyText);


		// Bombs

		const by = y - h - 2*pad;

		this.bombContainer = this.scene.add.container();
		this.bombContainer.setVisible(false);
		this.add(this.bombContainer);

		this.bombBorder = new RoundRectangle(this.scene, mx, by, mw, h, rad, 0x373D83);
		this.bombContainer.add(this.bombBorder);

		this.bombBack = new RoundRectangle(this.scene, mx, by, imw, ih, irad, 0xBB96A6);
		this.bombContainer.add(this.bombBack);

		this.bombIcon = this.scene.add.image(ml, by, "cherrybomb");
		this.bombIcon.setScale(iconSize / this.bombIcon.height);
		this.bombContainer.add(this.bombIcon);

		this.bombText = this.scene.createText(ml+0.6*iconSize, by, textSize, "#FFFFFF", "1,234");
		this.bombText.setOrigin(0.0, 0.5);
		this.bombContainer.add(this.bombText);


		// Energy

		const ew = 0.2 * this.scene.W;
		// const ex = mx + mw/2 + ew/2 + 5*pad;
		const ex = this.scene.W - ew/2 - 1*pad;
		const iew = ew - pad;
		const el = ex - ew/2 + pad;

		this.energyContainer = this.scene.add.container();
		this.add(this.energyContainer);

		this.energyBorder = new RoundRectangle(this.scene, ex, y, ew, h, rad, 0xefebe9);
		this.energyContainer.add(this.energyBorder);

		this.energyBack = new RoundRectangle(this.scene, ex, y, iew, ih, irad, 0x666666);
		this.energyContainer.add(this.energyBack);

		this.energyMeter = new RoundRectangle(this.scene, ex, y, iew, ih, irad, 0xFFFFFF);
		this.energyMeter.setOrigin(0, 0.5);
		this.energyMeter.x = this.energyBack.x - this.energyBack.width/2;
		this.energyContainer.add(this.energyMeter);

		this.energyIcon = this.scene.add.image(el, y, "energy");
		this.energyIcon.setScale(iconSize / this.energyIcon.height);
		this.energyContainer.add(this.energyIcon);

		this.energyText = this.scene.createText(ex, y, textSize, "#000", "50/100");
		this.energyText.setOrigin(0.5, 0.5);
		this.energyContainer.add(this.energyText);


		// Score

		const sy = y - h - 2*pad;

		this.scoreContainer = this.scene.add.container();
		this.add(this.scoreContainer);

		this.scoreBorder = new RoundRectangle(this.scene, ex, sy, ew, h, rad, 0xCFA2E8);
		this.scoreContainer.add(this.scoreBorder);

		this.scoreBack = new RoundRectangle(this.scene, ex, sy, iew, ih, irad, 0x743083);
		this.scoreContainer.add(this.scoreBack);

		this.scoreIcon = this.scene.add.image(el, sy, "tree");
		this.scoreIcon.setScale(iconSize / this.scoreIcon.height);
		this.scoreContainer.add(this.scoreIcon);

		this.scoreText = this.scene.createText(ex, sy, textSize/1.2, "#FFFFFF", "Score: ");
		this.scoreText.setOrigin(0.5, 0.5);
		this.scoreContainer.add(this.scoreText);
	}

	showBombs() { this.bombContainer.setVisible(true); }
	hideScore() { this.scoreContainer.setVisible(false); }
	showScore() { this.scoreContainer.setVisible(true); }
	hideEnergy() { this.energyContainer.setVisible(false); }
	showEnergy() { this.energyContainer.setVisible(true); }


	update(time: number, delta: number, money: number, energy: number, maxEnergy: number, score: number = 0, bombs: number=0, persistence: number=0) {

		this.moneyText.setText(`${money}`);
		this.energyText.setText(`${energy}/${maxEnergy}`);
		this.scoreText.setText(`+ ${score}`);
		this.bombText.setText(`x${bombs}`)

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
