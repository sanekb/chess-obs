import { signal } from '@preact/signals-core';

export const store = {
  lastGameId: 0,
  offset: 0,

  watch: false,
  timerId: 0,
  autoOffId: 0,

  stats: signal([]),
  streams: new Set(),

  clientify() {
  	return {
  		lastGameId: this.lastGameId,
  		watch: this.watch,
  		stats: this.stats.value,
  	}
  }
};
