/* Interface */

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

import circle from "../assets/images/circle.png";
import overworld from "../assets/images/overworld.png";
import underground from "../assets/images/underground.png";
import tree from "../assets/images/tree.png";
import tree_little from "../assets/images/tree_little.png";
import sapling from "../assets/images/sapling.png";


const images: Asset[] = [
	{ key: "circle",	path: circle },
	{ key: "overworld",	path: overworld },
	{ key: "underground",	path: underground },
	{ key: "tree",	path: tree },
	{ key: "tree_little",	path: tree_little },
	{ key: "sapling",	path: sapling },
];

const spritesheets: SpriteSheet[] = [];

/* UI */
import m_main_menu from "../assets/music/title.mp3";

/* Music */
import m_first from "../assets/music/first.mp3";
import m_first_draw from "../assets/music/first_draw.mp3";
import m_first_end from "../assets/music/first_end.mp3";

/* SFX: Roots */
import r_grow from "../assets/sounds/roots/grow.mp3";
import r_place from "./debug_placeroot.mp3";
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