import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class SurfaceButton extends Button {
	private image: Phaser.GameObjects.Image;
	private text: Phaser.GameObjects.Text;

	private size: number;
	private revealed: boolean;
	private alphaGoal: number;
	private isUnderground: boolean;

	constructor(scene: BaseScene) {
		super(scene, scene.CX, 0);
		this.scene.add.existing(this);
		this.setDepth(1000);
		this.setScrollFactor(0);

		this.size = 0.32 * this.scene.W;
		this.revealed = false;
		this.alphaGoal = 0;
		this.isUnderground = false;

		this.image = this.scene.add.image(0, 0, "surface_button");
		this.image.setScale(this.size / this.image.width);
		this.image.setTint(0xA1887F);
		this.image.setScrollFactor(0);
		this.add(this.image);

		this.text = this.scene.createText(0, 0, 48*this.scene.SCALE, "#111", "Return to surface");
		this.text.setOrigin(0.5, 0.4);
		this.text.setStroke("#fff", 120 * this.scene.SCALE);
		this.add(this.text);

		this.bindInteractive(this.image, true);
		// const inputPadding = 40 * this.scene.SCALE / this.image.scaleX;
		// this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);

		this.hide();
	}

	update(time: number, delta: number) {
		// Forcefully show button
		if (this.revealed && this.scene.cameras.main.scrollY > 0.5*this.scene.H) {
			this.alphaGoal = 1;
		}
		// Overworld button
		if (!this.isUnderground) {
			this.alphaGoal = 1;
		}
		// Only show if below a certain height
		else if (this.visible && this.scene.cameras.main.scrollY > 0.5*this.scene.H) {
			this.alphaGoal = 1;
		}
		// Hide button
		else {
			this.alphaGoal = 0.5;
		}

		let enableBob = (this.revealed && !this.hover);
		let bobValue = (enableBob ? 0.5 + 0.5 * Math.sin(time/200) : 0.0);

		this.setScale(1.0
			+ 0.04 * this.hoverSmooth
			- 0.1 * this.holdSmooth
			- 0.2 * (1-this.alpha)
			+ 0.06 * bobValue
		);
		this.alpha += 0.2 * (this.alphaGoal - this.alpha); // Smooth transition
		this.image.input.enabled = (this.alphaGoal > 0.5);
	}


	show(isUnderground: boolean, revealEntirely: boolean) {
		this.setVisible(true);

		this.isUnderground = isUnderground;

		if (isUnderground) {
			this.y = 0.07 * this.scene.H;
			this.text.setText("Return to surface");
		}
		else {
			this.y = 0.91 * this.scene.H;
			this.text.setText("Dig underground");
		}

		if (revealEntirely) {
			this.revealed = true;
		}
	}

	hide() {
		this.setVisible(false);
		this.revealed = false;
		this.alphaGoal = 0;
	}
}