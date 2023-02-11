import { GameScene } from "../scenes/GameScene";

export interface TextParticleEffects {
    move?: {
        moveSpeed?: number,
        direction?: number,
    }
    wave?: {
        enable: boolean,
        waveSpeed?: number,
        waveAngle?: number,
        waveAmplitude?: number,
    },
    fadeOut?: {
        enable: boolean,
        baseOpacity?: number,
    },
}

export interface TextParticleData {
    textObject: Phaser.GameObjects.Text,
    elapsedTime: number,
    lifespan: number,
    origin: Phaser.Math.Vector2,
    effects: TextParticleEffects,
}

type CreateTextOptions = [
    x: number, y: number, size: number, color: string, text: string
]

const ONE_OVER_TWO_PI = 1 / Phaser.Math.PI2;

export class TextParticle extends Phaser.GameObjects.Container {
    public scene: GameScene;
    public textParticles: Array<TextParticleData>;

    constructor(scene: GameScene) {
		super(scene, 0, 0);
		this.scene = scene;
		scene.add.existing(this);

        this.textParticles = [];
        this.DEFAULT_MOVE_SPEED = 1;
        this.DEFAULT_WAVE_SPEED = 5;
        this.DEFAULT_WAVE_AMPLITUDE = 2/3;

        this.DEAFULT_EFFECTS = {
            fadeOut: {enable: true},
            move: { moveSpeed: this.DEFAULT_MOVE_SPEED },
            wave: { waveAmplitude: this.DEFAULT_WAVE_AMPLITUDE,
                enable: true,
            },
        }

        this.DEAFULT_EFFECTS_HALF = {
            fadeOut: {enable: true},
            move: { moveSpeed: this.DEFAULT_MOVE_SPEED / 2 },
            wave: { waveAmplitude: this.DEFAULT_WAVE_AMPLITUDE / 2,
                enable: true,
            },
        }
    }

    public DEFAULT_MOVE_SPEED: number;
    public DEFAULT_WAVE_SPEED: number;
    public DEFAULT_WAVE_AMPLITUDE: number;
    public readonly DEFAULT_MOVE_ANGLE: number = Phaser.Math.DegToRad(-45);
    public readonly DEFAULT_WAVE_ANGLE: number = Phaser.Math.DegToRad(180);

    public DEAFULT_EFFECTS: TextParticleEffects;
    public DEAFULT_EFFECTS_HALF: TextParticleEffects;


    update(time: number, delta: number) {
        const extraTime = delta / 1000;
        let removeFlag = false;

        this.textParticles.forEach(data => {
            data.elapsedTime += extraTime;

            if (data.elapsedTime > data.lifespan) {
                removeFlag = true;
                data.textObject.destroy()
                data.elapsedTime = -1;
            }

            else {
                const effects = {
                    move: (data.effects.move?.moveSpeed ?? 0) != 0,
                    wave: data.effects.wave?.enable,
                    fade: data.effects.fadeOut?.enable,
                }

                const { x, y } = data.origin;
                let newPosition = new Phaser.Math.Vector2(x, y);
                let log: string[] = [];

                const textSize = data.textObject.getTextMetrics().fontSize * 2/3;
                
                if (effects.move) {
                    const moveOffset = new Phaser.Math.Vector2(0, 0).setToPolar(
                        data.effects.move?.direction ?? this.DEFAULT_MOVE_ANGLE,
                        data.elapsedTime * (data.effects.move?.moveSpeed ?? this.DEFAULT_MOVE_SPEED) * textSize,
                    );
                    // log = [...log, "moveOffset", moveOffset.x.toFixed(2), moveOffset.y.toFixed(2)];
                    newPosition.add(moveOffset);
                }

                if (effects.wave) {
                    const multiplier = ONE_OVER_TWO_PI * (data.effects.wave?.waveAmplitude ?? this.DEFAULT_WAVE_AMPLITUDE);

                    const phase = data.elapsedTime * (data.effects.wave?.waveSpeed ?? this.DEFAULT_WAVE_SPEED);
                    const amplitude = multiplier * textSize;

                    const waveOffset = new Phaser.Math.Vector2 ( amplitude * Math.sin(phase), 0 )
                    waveOffset.rotate(data.effects.wave?.waveAngle ?? this.DEFAULT_WAVE_ANGLE)

                    // log = [...log, "waveOffset", waveOffset.x.toFixed(2), waveOffset.y.toFixed(2)];
                    newPosition.add(waveOffset)
                }

                if (effects.wave || effects.move) {
                    data.textObject.setPosition(newPosition.x, newPosition.y)
                }

                if (effects.fade) {
                    const progress = data.elapsedTime / data.lifespan;
                    data.textObject.alpha = (data.effects.fadeOut?.baseOpacity ?? 1) * (1-progress);
                }

                // console.log(...log)
            }
        })

        // Remove destroyed text from array

        if (removeFlag) this.textParticles = this.textParticles.filter(
            data => data.elapsedTime != -1
        )
	}

    /**
     * Register a new text as a text particle
     * @param text Phaser Text object to use, or arguments for createText()
     * @param lifespan Lifespan in seconds
     * @param effects Object describing effects (move, fade, wave)
     */
    push(text: Phaser.GameObjects.Text | CreateTextOptions, lifespan: number=1, effects: TextParticleEffects={
        wave: {enable: false}, fadeOut: {enable: false}
    }) {
        const textObject = (text instanceof Phaser.GameObjects.Text)
            ? text
            : this.scene.createText(...text);
        
        /* const origin = (text instanceof Phaser.GameObjects.Text)
            ? { x: text.x,  y: text.y  }
            : { x: text[0], y: text[1] }; */

        const origin = { x: textObject.x, y: textObject.y };
        Object.freeze(origin);

        const effectDefaults = {
            move: { moveSpeed: this.DEFAULT_MOVE_SPEED, direction: this.DEFAULT_MOVE_ANGLE },
            fadeOut: { enable: false, baseOpacity: "alpha" in text ? text.alpha : 1 },
            wave: {
                enable: false,
                waveSpeed: this.DEFAULT_WAVE_SPEED,
                waveAngle: this.DEFAULT_WAVE_ANGLE,
                waveAmplitude: this.DEFAULT_WAVE_AMPLITUDE,
            },
        };
        this.textParticles.push({
            textObject,
            elapsedTime: 0,
            lifespan, effects: {...effectDefaults, ...effects},
            origin: new Phaser.Math.Vector2 (origin),
        });
    }

    getArray() {
        return this.textParticles;
    }

    die() {
        let removeCounter = 0;
        this.textParticles.forEach(particle => {
            particle.textObject.destroy();
            removeCounter++;
        })
        this.textParticles = [];
        return removeCounter;
    }
}