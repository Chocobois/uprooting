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
import overworld from "./images/backgrounds/overworld.png";
import overworld_bush from "./images/backgrounds/overworld_bush.png";
import underground from "./images/backgrounds/underground.png";
import testshop from "./images/backgrounds/emptybkg.png";
import shopwall from "./images/backgrounds/rocksbkg.png";

// NPCs
import jbun from "./images/character/jbun.png";

// Tree
import tree from "./images/tree/tree.png";
import tree_little from "./images/tree/tree_little.png";
import sapling from "./images/tree/sapling.png";
import rootline from "./images/tree/rootline.png";

// Items
import apple from "./images/items/apple.png";
import applecore from "./images/items/applecore.png";
import dragonfruit from "./images/items/dragonfruit.png";
import dragondragonfruit from "./images/items/dragondragonfruit.png";
import pear from "./images/items/pear.png";
import banana from "./images/items/banana.png";
import cherry from "./images/items/cherry.png";
import orange from "./images/items/orange.png";
import bone from "./images/items/bone.png";
import bones from "./images/items/bones.png";
import stone from "./images/items/stone.png";
import ruby from "./images/items/ruby.png";
import sapphire from "./images/items/sapphire.png";
import emerald from "./images/items/emerald.png";
import diamond from "./images/items/diamond.png";
import platinum from "./images/items/platinum.png";

// UI
import fruit_upgrade from "./images/ui/fruit_upgrade.png";
import energy_teter from "./images/ui/meter.png";
import prompt from "./images/ui/prompt.png";
import surface_button from "./images/ui/surface_button.png";
import music from "./images/ui/music.png";
import audio from "./images/ui/audio.png";

// Other
import circle from "./images/circle.png";

const images: Asset[] = [
	// Backgrounds
	{ key: "overworld", path: overworld },
	{ key: "overworld_bush", path: overworld_bush },
	{ key: "underground", path: underground },
	{ key: "testshop", path: testshop },
	{ key: "shopwall", path: shopwall },

	// Tree
	{ key: "tree", path: tree },
	{ key: "tree_little", path: tree_little },
	{ key: "sapling", path: sapling },
	{ key: "rootline", path: rootline },

	//NPCs
	{ key: "jbun", path: jbun },

	// Items
	{ key: "apple", path: apple },
	{ key: "dragonfruit", path: dragonfruit },
	{ key: "dragondragonfruit", path: dragondragonfruit },
	{ key: "applecore", path: applecore },
	{ key: "pear", path: pear },
	{ key: "banana", path: banana },
	{ key: "cherry", path: cherry },
	{ key: "orange", path: orange },
	{ key: "bone", path: bone },
	{ key: "bones", path: bones },
	{ key: "stone", path: stone },
	{ key: "ruby", path: ruby },
	{ key: "sapphire", path: sapphire },
	{ key: "emerald", path: emerald },
	{ key: "diamond", path: diamond },
	{ key: "platinum", path: platinum },

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
import green_magic from "./images/effects/green_magic.png";
import meme_explosion from "./images/effects/meme_explosion.png";
import dust_explosion from "./images/effects/dustyexplosion.png";

const spritesheets: SpriteSheet[] = [

	{ key: "audio", path: audio, width: 300, height: 300 },
	{ key: "music", path: music, width: 300, height: 300 },

	// Effects
	{ key: "green_magic", path: green_magic, width: 128, height: 128 },
	{ key: "meme_explosion", path: meme_explosion, width: 200, height: 282 },
	{ key: "dust_explosion", path: meme_explosion, width: 128, height: 128 },
];



/* Audio */

// UI
import m_main_menu from "./music/title.mp3";

// Music
import m_first from "./music/first.mp3";
import m_first_draw from "./music/first_draw.mp3";
import m_first_end from "./music/first_end.mp3";

// SFX: Roots
import r_grow from "./sounds/roots/grow.mp3";
import r_place from "./sounds/roots/place.mp3";
import r_place_error from "./sounds/roots/place_error.mp3";

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