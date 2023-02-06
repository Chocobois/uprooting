import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class SurfaceButton extends Button {
	private image: Phaser.GameObjects.Image;
	private text: Phaser.GameObjects.Text;

	private size: number;
	private revealed: boolean;
	private alphaGoal: number;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene.add.existing(this);
		this.setDepth(1000);
		this.setScrollFactor(0);

		this.size = 0.4 * this.scene.W;
		this.revealed = false;
		this.alphaGoal = 0;

		this.image = this.scene.add.image(0, 0, "surface_button");
		this.image.setScale(this.size / this.image.width);
		this.image.setTint(0xA1887F);
		this.image.setScrollFactor(0);
		this.add(this.image);

		this.text = this.scene.createText(0, 0, 60*this.scene.SCALE, "#111", "Return to surface");
		this.text.setOrigin(0.5);
		this.add(this.text);

		this.bindInteractive(this.image, true);
		const inputPadding = 40 * this.scene.SCALE / this.image.scaleX;
		this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);

		this.hide();
	}

	update(time: number, delta: number) {
		// Forcefully show button
		if (this.revealed && this.scene.cameras.main.scrollY > 0.5*this.scene.H) {
			this.alphaGoal = 1;
		}
		// Only show if below a certain height
		else if (this.visible && this.scene.cameras.main.scrollY > 1.0*this.scene.H) {
			this.alphaGoal = 1;
		}
		// Hide button
		else {
			this.alphaGoal = 0;
		}

		this.setScale(1.0 - 0.1 * this.holdSmooth - 0.2 * (1-this.alpha));
		this.alpha += 0.2 * (this.alphaGoal - this.alpha); // Smooth transition
		this.image.input.enabled = (this.alphaGoal > 0);
	}


	show(revealEntirely: boolean) {
		this.setVisible(true);

		if (revealEntirely) {
			this.revealed = true;
		}
	}

	hide() {
		this.setVisible(false);
		this.revealed = false;
	}
}