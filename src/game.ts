import Phaser from 'phaser';
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: 1920/2,
	height: 1080/2,
	scale: {
		mode: Phaser.Scale.FIT
	},
	scene: [
		PreloadScene,
		MenuScene
	],
	plugins: {
		global: [
		]
	}
};

const game = new Phaser.Game(config);
