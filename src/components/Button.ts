import { BaseScene } from "./../scenes/BaseScene";

export class Button extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	private _hold: boolean;
	private _hover: boolean;
	protected blocked: boolean;
	public liftSmooth: number;
	public hoverSmooth: number;
	public holdSmooth: number;
	public category: number;
	public aliveValue: number;
	private hoverTween: Phaser.Tweens.Tween;
	private holdTween: Phaser.Tweens.Tween;
	public enabled: boolean;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene = scene;
		scene.add.existing(this);

		this._hover = false;
		this._hold = false;
		this.blocked = false;
		this.enabled = true;

		this.liftSmooth = 0;
		this.hoverSmooth = 0;
		this.holdSmooth = 0;
		this.aliveValue = 0;
	}

	bindInteractive(gameObject, draggable=false) {
		gameObject.removeInteractive();
		gameObject.setInteractive({ useHandCursor: true, draggable: draggable })
			.on('pointerout', this.onOut, this)
			.on('pointerover', this.onOver, this)
			.on('pointerdown', this.onDown, this)
			.on('pointerup', this.onUp, this)
			.on('dragstart', this.onDragStart, this)
			.on('drag', this.onDrag, this)
			.on('dragend', this.onDragEnd, this);
		return gameObject;
	}

	get hover(): boolean {
		return this._hover;
	}

	set hover(value: boolean) {
		if (value != this._hover) {
			if (this.hoverTween) {
				this.hoverTween.stop();
			}
			if (value) {
				this.hoverTween = this.scene.tweens.add({
					targets: this,
					hoverSmooth: { from: 0.0, to: 1.0 },
					ease: 'Cubic.Out',
					duration: 100
				});
			}
			else {
				this.hoverTween = this.scene.tweens.add({
					targets: this,
					hoverSmooth: { from: 1.0, to: 0.0 },
					ease: (v: number) => {
						return Phaser.Math.Easing.Elastic.Out(v, 1.5, 0.5);
					},
					duration: 500
				});
			}
		}

		this._hover = value;
	}

	get hold(): boolean {
		return this._hold;
	}

	set hold(value: boolean) {
		if (value != this._hold) {
			if (this.holdTween) {
				this.holdTween.stop();
			}
			if (value) {
				this.holdTween = this.scene.tweens.add({
					targets: this,
					holdSmooth: { from: 0.0, to: 1.0 },
					ease: 'Cubic.Out',
					duration: 100
				});
			}
			else {
				this.holdTween = this.scene.tweens.add({
					targets: this,
					holdSmooth: { from: 1.0, to: 0.0 },
					ease: (v: number) => {
						return Phaser.Math.Easing.Elastic.Out(v, 1.5, 0.5);
					},
					duration: 500
				});
			}
		}

		this._hold = value;
	}

	onOut(pointer: Phaser.Input.Pointer, event: Phaser.Types.Input.EventData) {
		this.hover = false;
		this.hold = false;
	}

	onOver(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
		this.hover = true;
	}

	onDown(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
		this.hold = true;
		this.blocked = false;
		this.emit("down");
	}

	onUp(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
		if (this.hold && !this.blocked) {
			this.hold = false;
			this.emit('click');
		}
	}

	onDragStart(pointer, dragX, dragY) {}

	onDrag(pointer, dragX, dragY) {}

	onDragEnd(pointer, dragX, dragY, dropped) {}


	block() {
		this.blocked = true;
	}
}