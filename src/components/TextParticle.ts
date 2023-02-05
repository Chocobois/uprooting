import { GameScene } from "../scenes/GameScene";

export interface TextParticleData {
    textObject: Phaser.GameObjects.Text,
    elapsedTime: number,
    lifespan: number,
    wavy: boolean,
    fadeOut: boolean,
    speed: number,
    baseOpacity: number,
    origin: {
        x: number,
        y: number
    }
}

const ONE_OVER_TWO_PI = 1 / (2*Math.PI)

export class TextParticle extends Phaser.GameObjects.Container {
    public scene: GameScene;
    public textParticles: Array<TextParticleData>;

    constructor(scene: GameScene) {
		super(scene, 0, 0);
		this.scene = scene;
		scene.add.existing(this);

        this.textParticles = [];
    }

    update(time: number, delta: number) {
        const extraTime = delta / 1000;

        this.textParticles.forEach(data => {
            data.elapsedTime += extraTime;

            if (data.elapsedTime > data.lifespan) {
                data.textObject.destroy()
                data.elapsedTime = -1;
            }

            else {
                if (data.wavy) {
                    const textSize = data.textObject.getTextMetrics().fontSize * 2/3;
                    const multiplier = ONE_OVER_TWO_PI;
                    const phase = data.elapsedTime * data.speed;

                    data.textObject.setPosition(
                        data.origin.x + (multiplier * ( Math.sin(phase) + (3/4*phase) )) * textSize,
                        data.origin.y - (multiplier *                          phase   ) * textSize,
                    )
                }

                if (data.fadeOut) {
                    const progress = data.elapsedTime / data.lifespan;
                    data.textObject.alpha = data.baseOpacity * (1-progress);
                }
            }
        })

        this.textParticles = this.textParticles.filter(
            data => data.elapsedTime != -1
        )
	}

    /**
     * Register a new text as a text particle
     * @param text Phaser Text object to use
     * @param lifespan Lifespan in seconds
     * @param wavy Whether or not to animate the text similar to RCT2
     */
    push(text: Phaser.GameObjects.Text, lifespan: number=1, wavy: boolean=false, fadeOut: boolean=true) {
        const { x, y } = text;
        this.textParticles.push({
            textObject: text,
            elapsedTime: 0,
            lifespan, wavy, fadeOut,
            origin: { x, y },
            speed: 5,
            baseOpacity: text.alpha
        });
    }

    getArray() {
        return this.textParticles;
    }
}