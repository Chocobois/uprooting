const overlap = 2;

export default {
	'm_main_menu': {
		offset: .424,
		bpm: 60
	},
	'm_first': {
		offset: 0,
		bpm: 140,
		loop: true,
		start: 0 + overlap,
		end: 760286/48000 + overlap,
	},
	'm_first_draw': {
		offset: 0,
		bpm: 140,
		loop: true,
		start: 0 + overlap,
		end: 760286/48000 + overlap,
	},
	'm_first_end': {
		offset: 0,
		bpm: 0,
		loop: false
	},
	'm_shop': {
		offset: 41860/48000,
		bpm: 86,
		loop: true,
		start: 41860/48000 + overlap,
		end: 2854884/48000 + overlap,
	}
};
