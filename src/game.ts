import Phaser from 'phaser';
import { PreloadScene } from "./scenes/PreloadScene";
import { GameScene } from "./scenes/GameScene";

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: 1920/2,
	height: 1080/2,
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
	plugins: {
		global: [
		]
	}
};

const game = new Phaser.Game(config);
