import Phaser from 'phaser';
import { PreloadScene } from "./scenes/PreloadScene";
import { GameScene } from "./scenes/GameScene";


const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: 1920/4,
	height: 1080/4,
	// mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
	mipmapFilter: 'NEAREST',
	pixelArt: true,
	antialias: false,
	scale: {
		mode: Phaser.Scale.FIT
	},
	scene: [
		PreloadScene,
		GameScene
	],
};

const game = new Phaser.Game(config);
