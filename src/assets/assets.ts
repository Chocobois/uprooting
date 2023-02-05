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
	volume?: number;
	rate?: number;
}


/* Images */

// Backgrounds
import overworld from "./images/backgrounds/overworld.png";
import overworld_bush from "./images/backgrounds/overworld_bush.png";
import underground from "./images/backgrounds/underground.png";
import underground_edge from "./images/backgrounds/underground_edge.png";
import shop_background from "./images/backgrounds/shop_background.png";
import shop_foreground from "./images/backgrounds/shop_foreground.png";
import overworld_shop from "./images/backgrounds/overworld_shop.png";

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
import badrock from "./images/items/hasty_rock.png";
import gray_badrock from "./images/items/grey_hasty_rock.png";
import ylw_badrock from "./images/items/ylw_hasty_rock.png";
import demon_rock from "./images/items/demon_rock.png";
import curse_rock from "./images/items/curse_rock.png";
import watercave from "./images/items/watercave.png";
import coin from "./images/items/coin.png";
import energy from "./images/items/energy.png";

// Titlescreen
import title_foreground from "./images/titlescreen/foreground.png";
import title_background from "./images/titlescreen/background.png";
import title_skybackground from "./images/titlescreen/skybackground.png";

// UI
import fruit_upgrade from "./images/ui/fruit_upgrade.png";
import energy_teter from "./images/ui/meter.png";
import prompt from "./images/ui/prompt.png";
import surface_button from "./images/ui/surface_button.png";
import music from "./images/ui/music.png";
import audio from "./images/ui/audio.png";
import shop_exit_sign from "./images/ui/shop_exit_sign.png";
import shop_buy_button from "./images/ui/shop_buy_button.png";
import shop_sold_out from "./images/ui/shop_sold_out.png";

// Other
import circle from "./images/circle.png";

const images: Asset[] = [
	// Backgrounds
	{ key: "overworld", path: overworld },
	{ key: "overworld_bush", path: overworld_bush },
	{ key: "underground", path: underground },
	{ key: "underground_edge", path: underground_edge },
	{ key: "shop_background", path: shop_background },
	{ key: "shop_foreground", path: shop_foreground },
	{ key: "overworld_shop", path: overworld_shop },

	// Tree
	{ key: "tree", path: tree },
	{ key: "tree_little", path: tree_little },
	{ key: "sapling", path: sapling },
	{ key: "rootline", path: rootline },

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
	{ key: "watercave1", path: watercave },
	{ key: "badrock", path: badrock },
	{ key: "gray_badrock", path: gray_badrock },
	{ key: "ylw_badrock", path: ylw_badrock },
	{ key: "demon_rock", path: demon_rock },
	{ key: "curse_rock", path: curse_rock },
	{ key: "coin", path: coin },
	{ key: "energy", path: energy },

	// Titlescreen
	{ key: "title_foreground", path: title_foreground },
	{ key: "title_background", path: title_background },
	{ key: "title_skybackground", path: title_skybackground },

	// UI
	{ key: "fruit_upgrade", path: fruit_upgrade },
	{ key: "energy_teter", path: energy_teter },
	{ key: "prompt", path: prompt },
	{ key: "surface_button", path: surface_button },
	{ key: "shop_exit_sign", path: shop_exit_sign },
	{ key: "shop_buy_button", path: shop_buy_button },
	{ key: "shop_sold_out", path: shop_sold_out },

	// Other
	{ key: "circle", path: circle },
];



/* Spritesheets */

// Effects
import green_magic from "./images/effects/green_magic.png";
import meme_explosion from "./images/effects/meme_explosion.png";
import dust_explosion from "./images/effects/dustyexplosion.png";
import blue_sparkle from "./images/effects/blue_sparkle.png";
import item_tag from "./images/ui/item_tag.png";

// NPCs
import jbun from "./images/character/jbun_spritesheet.png";

const spritesheets: SpriteSheet[] = [
	//UI with buttonstates
	{ key: "audio", path: audio, width: 300, height: 300 },
	{ key: "music", path: music, width: 300, height: 300 },
	{ key: "item_tag", path: item_tag, width: 512, height: 512 },

	// Effects
	{ key: "green_magic", path: green_magic, width: 128, height: 128 },
	{ key: "meme_explosion", path: meme_explosion, width: 200, height: 282 },
	{ key: "dust_explosion", path: dust_explosion, width: 128, height: 128 },
	{ key: "blue_sparkle", path: blue_sparkle, width: 256, height: 256 },


	// NPCs
	{ key: "jbun", path: jbun, width: 517, height: 1016 },
];



/* Audio */

// UI
import m_main_menu from "./music/title.mp3";

// Music
import m_first from "./music/first.mp3";
import m_first_draw from "./music/first_draw.mp3";
import m_first_end from "./music/first_end.mp3";
import m_shop from "./music/shop.mp3";

// SFX: Roots
import r_grow from "./sounds/roots/grow.mp3";
import r_place from "./sounds/roots/place.mp3";
import r_place_error from "./sounds/roots/place_error.mp3";

// Shop related
import s_squish1 from "./sounds/shop/squish1.mp3";
import s_squish2 from "./sounds/shop/squish2.mp3";

const audios: Audio[] = [
	{ key: "m_main_menu", path: m_main_menu },
	{ key: "m_first", path: m_first },
	{ key: "m_first_draw", path: m_first_draw },
	{ key: "m_first_end", path: m_first_end },
	{ key: "m_shop", path: m_shop },
	{ key: "r_grow", path: r_grow, volume: 0.5 },
	{ key: "r_place", path: r_place, volume: 1 },
	{ key: "r_place_error", path: r_place_error, volume: 0.5 },
	{ key: "s_squish1", path: s_squish1, volume: 1 },
	{ key: "s_squish2", path: s_squish2, volume: 1 },
];



export {
	images,
	spritesheets,
	audios
};