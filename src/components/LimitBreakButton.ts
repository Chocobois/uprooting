import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class LimitBreakButton extends Button {
    private sprite: Phaser.GameObjects.Sprite;
    private backContainer: Phaser.GameObjects.Container;
    private back: Phaser.GameObjects.Ellipse;
    private backBorder: Phaser.GameObjects.Ellipse
    private percent: Phaser.GameObjects.Graphics;
	private size: number;
    private modifier: number;
    private UNUSED = 0;
    private USING = 1;
    private USED = 2;
    private LState: number;
    private waitTimer;
    private queueResetFlag;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene.add.existing(this);
        this.LState = 0;
        this.waitTimer = 0;
        this.queueResetFlag = false;
        this.setDepth(0);
		this.setScrollFactor(0);
		this.size = 0.05 * this.scene.W;
        this.sprite = scene.add.sprite(0, 0, "limitbreak", 0);
        this.modifier = (this.size) / this.sprite.width;
        this.sprite.setScale(this.size / this.sprite.width);
        this.sprite.setScrollFactor(0);
        this.backContainer = this.scene.add.container();
        let circleWidth = 300*(this.size)/this.sprite.width;
        this.back = scene.add.ellipse(0,0,circleWidth,circleWidth, 0xC9DDE7, 1);
        circleWidth = 340*(this.size)/this.sprite.width;
        this.backBorder = scene.add.ellipse(0,0,circleWidth,circleWidth, 0x5259FF, 1);
        this.percent = scene.add.graphics();
        this.backContainer.add(this.backBorder);
        this.backContainer.add(this.back);
        this.backContainer.add(this.percent);
        this.add(this.backContainer);
        this.add(this.sprite);


        this.bindInteractive(this.sprite, true);
        this.hide();

		// this.bindInteractive(this.image, true);
		// const inputPadding = 40 / this.image.scaleX;
		// this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);

		//this.hide();
	}

	update(time: number, delta: number, limitp: number = 0) {
        this.sprite.setFrame(this.LState);
        if(this.LState == this.USING)
        {
            this.percent.clear();
            this.percent.slice(0,0,150*this.modifier,Phaser.Math.DegToRad(0-90),Phaser.Math.DegToRad(360-(360*limitp)-90),true,0);
            this.percent.fillStyle(0x41F835, 1);
            this.percent.fillPath();
        }

        if(this.waitTimer >= 0)
        {
            this.waitTimer-= delta;
            if(this.waitTimer < 0) {
                this.waitTimer = 0;
                if(this.queueResetFlag)
                {
                    this.resetButtonState();
                }
            }
        }
		// this.setScale(1.0 - 0.1 * this.holdSmooth);
	}

    setWaitTimer(t: number)
    {
        this.LState = this.USED;
        this.percent.clear();
        this.backContainer.setAlpha(0.6);
        this.sprite.setAlpha(0.6);
        this.waitTimer = t;
    }

    advance()
    {
        if(this.LState == this.UNUSED)
        {
            this.LState = this.USING;
            if(this.sprite.input)
                this.sprite.input.enabled = false;
            //this.setInteractive(false);
            //this.active = !this.active;

        } else if (this.LState == this.USING)
        {
            this.LState = this.USED;
            this.percent.clear();
            this.backContainer.setAlpha(0.6);
            this.sprite.setAlpha(0.6);
        } else if (this.LState == this.USED) {
            this.resetButtonState();
        }
    }

    resetButtonState()
    {
        if(!(this.waitTimer > 0)) {
            this.LState = this.UNUSED;
            this.sprite.setAlpha(1);
            this.sprite.setFrame(this.LState);
            if(this.sprite.input)
                this.sprite.input.enabled = true;
            this.queueResetFlag = false;
        } else {
            this.queueResetFlag = true;
        }
    }

	show() {
		this.setVisible(true);
	}

	hide() {
		this.setVisible(false);
	}
}