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

// Cover
import cover_background_orange from "../assets/images/cover/background_orange.png";
import cover_body from "../assets/images/cover/dragon_body.png";
import cover_roof from "../assets/images/cover/roof.png";
import cover_hands from "../assets/images/cover/hands.png";
import cover_dice_blue from "../assets/images/cover/dice_blue.png";
import cover_dice_green from "../assets/images/cover/dice_green.png";
import cover_dice_red from "../assets/images/cover/dice_red.png";
import cover_knights from "../assets/images/cover/knights.png";

import circle from "../assets/images/circle.png";
import overworld from "../assets/images/overworld.png";
import underground from "../assets/images/underground.png";
import tree from "../assets/images/tree.png";


const images: Asset[] = [
	{ key: "circle",	path: circle },
	{ key: "overworld",	path: overworld },
	{ key: "underground",	path: underground },
	{ key: "tree",	path: tree },

	// Cover
	{ key: "cover_background_orange",	path: cover_background_orange },
	{ key: "cover_body",				path: cover_body },
	{ key: "cover_roof",				path: cover_roof },
	{ key: "cover_hands",				path: cover_hands },
	{ key: "cover_dice_blue",			path: cover_dice_blue },
	{ key: "cover_dice_green",			path: cover_dice_green },
	{ key: "cover_dice_red",			path: cover_dice_red },
	{ key: "cover_knights",				path: cover_knights },
];

const spritesheets: SpriteSheet[] = [];

/* UI */
import u_attack_button from "../assets/sounds/ui/Attack_Button.mp3";
import m_main_menu from "../assets/music/title.mp3";
import m_slice from "../assets/sounds/misc/Slice.mp3";
import m_first from "../assets/music/first.mp3";
import m_first_draw from "../assets/music/first_draw.mp3";
import m_first_end from "../assets/music/first_end.mp3";

const audios: Audio[] = [
	{ key: "u_attack_button", path: u_attack_button, volume: 1 },
	{ key: "m_main_menu", path: m_main_menu, volume: 1 },
	{ key: "m_slice", path: m_slice, volume: 1 },
	{ key: "m_first", path: m_first, volume: 1 },
	{ key: "m_first_draw", path: m_first_draw, volume: 1 },
	{ key: "m_first_end", path: m_first_end, volume: 1 },
];

export {
	images,
	spritesheets,
	audios
};