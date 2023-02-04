/* Interfaces */

interface Asset {
	key: string;
	path: string;
}

interface SpriteSheet {
	key: string;
	path: string;
	width: number;
	height: number;
}

interface Audio {
	key: string;
	path: string;
	volume: number;
	rate?: number;
}


/* Images */

// Backgrounds
import overworld from "../assets/images/backgrounds/overworld.png";
import underground from "../assets/images/backgrounds/underground.png";

// Tree
import tree from "../assets/images/tree/tree.png";
import tree_little from "../assets/images/tree/tree_little.png";
import sapling from "../assets/images/tree/sapling.png";
import rootline from "../assets/images/tree/rootline.png";

// Items
import apple from "../assets/images/items/apple.png";
import bone from "../assets/images/items/bone.png";
import dragonfruit from "../assets/images/items/dragonfruit.png";

// UI
import fruit_upgrade from "../assets/images/ui/fruit_upgrade.png";
import energy_teter from "../assets/images/ui/meter.png";
import prompt from "../assets/images/ui/prompt.png";
import surface_button from "../assets/images/ui/surface_button.png";

// Other
import circle from "../assets/images/circle.png";

const images: Asset[] = [
	// Backgrounds
	{ key: "overworld", path: overworld },
	{ key: "underground", path: underground },

	// Tree
	{ key: "tree", path: tree },
	{ key: "tree_little", path: tree_little },
	{ key: "sapling", path: sapling },
	{ key: "rootline", path: rootline },

	// Items
	{ key: "apple", path: apple },
	{ key: "bone", path: bone },
	{ key: "dragonfruit", path: dragonfruit },

	// UI
	{ key: "fruit_upgrade", path: fruit_upgrade },
	{ key: "energy_teter", path: energy_teter },
	{ key: "prompt", path: prompt },
	{ key: "surface_button", path: surface_button },

	// Other
	{ key: "circle", path: circle },
];



/* Spritesheets */

// Effects
import green_magic from "../assets/images/effects/green_magic.png";
import meme_explosion from "../assets/images/effects/meme_explosion.png";

const spritesheets: SpriteSheet[] = [
	// Effects
	{ key: "green_magic", path: green_magic, width: 128, height: 128 },
	{ key: "meme_explosion", path: meme_explosion,	width: 200,	height: 282 },
];



/* Audio */

// UI
import m_main_menu from "../assets/music/title.mp3";

// Music
import m_first from "../assets/music/first.mp3";
import m_first_draw from "../assets/music/first_draw.mp3";
import m_first_end from "../assets/music/first_end.mp3";

// SFX: Roots
import r_grow from "../assets/sounds/roots/grow.mp3";
import r_place from "../assets/sounds/roots/place.mp3";
import r_place_error from "../assets/sounds/roots/place_error.mp3";

const audios: Audio[] = [
	{ key: "m_main_menu", path: m_main_menu, volume: 1 },
	{ key: "m_first", path: m_first, volume: 1 },
	{ key: "m_first_draw", path: m_first_draw, volume: 1 },
	{ key: "m_first_end", path: m_first_end, volume: 1 },
	{ key: "r_grow", path: r_grow, volume: 0.5 },
  	{ key: "r_place", path: r_place, volume: 1 },
	{ key: "r_place_error", path: r_place_error, volume: 0.5 },
];



export {
	images,
	spritesheets,
	audios
};