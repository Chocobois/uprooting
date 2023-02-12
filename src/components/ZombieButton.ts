import { BaseScene } from "../scenes/BaseScene";
import { Button } from "./Button";

export class ZombieButton extends Button {
    private sprite: Phaser.GameObjects.Sprite;
    private backContainer: Phaser.GameObjects.Container;
    private back: Phaser.GameObjects.Ellipse;
    private backBorder: Phaser.GameObjects.Ellipse
    private percent: Phaser.GameObjects.Graphics;
	private size: number;
    private modifier: number;
    private isZombie: boolean;
    private hiScore: number;
    private alphaMode: number;
    private angleadj = -90;
    private usedUp = false;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene.add.existing(this);
        this.setDepth(0);
		this.setScrollFactor(0);
		this.size = 0.05 * this.scene.W;
        this.sprite = scene.add.sprite(0, 0, "zombiemode", 0);
        this.modifier = (this.size) / this.sprite.width;
        this.sprite.setScale(this.size / this.sprite.width);
        this.sprite.setScrollFactor(0);
        this.backContainer = this.scene.add.container();
        this.isZombie = false;
        this.hiScore = 0;
        this.alphaMode = 1;
        this.usedUp = false;
        let circleWidth = 300*(this.size)/this.sprite.width;
        this.back = scene.add.ellipse(0,0,circleWidth,circleWidth, 0x9FAD69, 1);
        circleWidth = 340*(this.size)/this.sprite.width;
        this.backBorder = scene.add.ellipse(0,0,circleWidth,circleWidth, 0xFFCB30, 1);
        this.percent = scene.add.graphics();
        this.backContainer.add(this.backBorder);
        this.backContainer.add(this.back);
        this.backContainer.add(this.percent);
        this.add(this.backContainer);
        this.add(this.sprite);


        this.bindInteractive(this.sprite, true);
        //this.hide();

		// this.bindInteractive(this.image, true);
		// const inputPadding = 40 / this.image.scaleX;
		// this.image.input.hitArea.setTo(-inputPadding, -inputPadding, this.image.width+2*inputPadding, this.image.height+2*inputPadding);

		//this.hide();
	}

	update(score: number) {
        if(!this.isZombie)
        {
            if(score < 100) {
                this.alphaMode = 0.6;
                this.backContainer.setAlpha(this.alphaMode);
                this.sprite.setAlpha(this.alphaMode);
            } else {
                this.alphaMode = 1;
                this.backContainer.setAlpha(this.alphaMode);
                this.sprite.setAlpha(this.alphaMode);
            }
            
        }
	}

    advancePercent(scorecurr: number, inc: number)
    {
        if(this.hiScore == 0)
        {
            this.hiScore = scorecurr;
        } else if (scorecurr > this.hiScore) {
            this.hiScore = scorecurr;
        }
        if(scorecurr > inc && this.hiScore > 0) {
            this.percent.clear();
            this.backContainer.setAlpha(1);
            this.sprite.setAlpha(1);
            this.percent.slice(0,0,150*this.modifier,Phaser.Math.DegToRad(0+this.angleadj),Phaser.Math.DegToRad((-360*scorecurr/this.hiScore)+this.angleadj),true,0);
            this.percent.fillStyle(0x41F835, 1);
            this.percent.fillPath();
            this.percent.slice(0,0,150*this.modifier,Phaser.Math.DegToRad((-360*scorecurr/this.hiScore)+this.angleadj),Phaser.Math.DegToRad(-360*((scorecurr-inc)/this.hiScore)+this.angleadj),false,0);
            this.percent.fillStyle(0xFF4747, 1);
            this.percent.fillPath();
        } else if (this.isZombie){
            this.percent.clear()
            this.alphaMode = 0.6;
            this.backContainer.setAlpha(this.alphaMode);
            this.sprite.setAlpha(this.alphaMode);
            this.usedUp = true;
            this.sprite.input.enabled = false;
        }
    }
    advance(sc: number, inc: number)
    {
        if(this.isZombie == false)
        {
            if(!this.usedUp)
            {
                this.isZombie = true;
                this.sprite.setFrame(1);
                this.advancePercent(sc, inc);
            }
        } else if (this.isZombie == true) {
            this.alphaMode = 1;
            this.isZombie = false;
            this.percent.clear();
            this.sprite.setFrame(0);
        }
    }

    resetButtonState()
    {
        this.isZombie = false;
        this.sprite.setFrame(0);
        this.percent.clear();
        this.usedUp = false;
        this.sprite.input.enabled = true;
        this.hiScore = 0;
    }

	show() {
		this.setVisible(true);
	}

	hide() {
		this.setVisible(false);
	}
}