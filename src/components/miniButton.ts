import { GameScene } from "../scenes/GameScene";
import { Button } from "./Button";

export class MiniButton extends Button {
    private sprite: Phaser.GameObjects.Sprite;
    public active: boolean;

    private size: number;

    constructor(scene: GameScene, x: number, y: number, key: string) {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.size = 0.05 * this.scene.W;
        this.active = true;

        this.sprite = scene.add.sprite(0, 0, key, this.active ? 0 : 1);
        this.sprite.setScale(this.size / this.sprite.width);
        this.sprite.setScrollFactor(0);
        this.add(this.sprite);

        this.bindInteractive(this.sprite, true);
        //const inputPadding = 40 / this.sprite.scaleX;
        //this.sprite.input.hitArea.setTo(-inputPadding, -inputPadding, this.sprite.width + 2 * inputPadding, this.sprite.height + 2 * inputPadding);
    }


    update(timeMs: number, deltaMs: number) {
        this.setScale(1 - 0.1 * this.holdSmooth);
    }

    toggle() {
        this.active = !this.active;
        this.sprite.setFrame(this.active ? 0 : 1);
    }
}
