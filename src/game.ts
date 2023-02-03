import Phaser from 'phaser';
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: 1920,
	height: 1080,
	mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
	// mipmapFilter: 'NEAREST',
	// pixelArt: true,
	// antialias: true,
	scale: {
		mode: Phaser.Scale.FIT
	},
	scene: [
		PreloadScene,
		MenuScene,
		GameScene
	],
	plugins: {
		global: [
		]
	}
};

const game = new Phaser.Game(config);
