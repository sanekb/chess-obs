import { signal } from "@preact/signals-core";
import { env } from "@/server/env.js";

export const store = {
  member: env.member,

  lastGameId: 0,
  offset: 0,

  watch: false,
  timerId: 0,
  autoOffId: 0,
  autoOffStart: 0,

  stats: signal([]),
  streams: new Set(),

  bonus: signal(false),

  clientify() {
    return {
      member: this.member,
      lastGameId: this.lastGameId,
      autoOffStart: this.autoOffStart,
      watch: this.watch,
      stats: this.stats.value,
      bonus: this.bonus.value,
    };
  },
};
