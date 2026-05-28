import { Hono } from "@hono/hono";
import { basicAuth } from "@hono/hono/basic-auth";
import state from "../state.js";
import { html } from "../layout.js";
import { env } from "../env.js";
import { notify } from "./widget.js";


export const app = new Hono()

.basePath("/dashboard")

.use(
  "*",
  basicAuth({
    username: env.user,
    password: env.pass,
  }),
)

.get("/", (c) =>
  c.html(
    html({
      page: "dashboard",
      member: env.member,
      watch: state.watch,
      lastGameId: state.lastGameId,
    }),
  ))

.post("/offset/:off", async c => {
  await offset( parseInt( c.req.param('off') ) );
  return c.json({ lastGameId: state.lastGameId });
})

.post("/watch", async c => {
  await watch()
  return c.json({ watch: state.watch });
})

.post("/refresh", async c => {
  await refresh()
  return c.json({ refresh: true });
})




const mock = JSON.parse(Deno.readTextFileSync("./src/mock.json"));
const cache = { json: null, time: -10e3 };

offset( 0 );

async function getGamesViaApi () {
	
	if ( performance.now() - cache.time > 5e3 ) {

		await new Promise(r=>setTimeout(r,550))

		cache.json = mock;
		cache.time = performance.now();
	}

	return cache.json;

}

async function offset ( off ) {

	const games = (await getGamesViaApi()).data;

	if ( off === 0 ) state.offset  = off;
	if ( off !== 0 ) state.offset += off;

	state.offset = Math.max( 0, state.offset );
	state.lastGameId = games[ state.offset ].id;

	await refresh();

}


async function watch () {

	state.watch = !state.watch;

	if ( state.watch ) {

		await refresh();

		(async function loop() {
            state.timerId = setTimeout(async () => {
                if (state.watch) {
                    await refresh();
                    await loop();
                }
            }, 2e3);
        })();

        state.autoOffId = setTimeout(watch, 1 * 1 * 10e3);

	} else {
        clearTimeout(state.timerId);
        clearTimeout(state.autoOffId);
    }

}

async function refresh () {

	const games = (await getGamesViaApi()).data;
	const i = games.findIndex( g => g.id === state.lastGameId );
	const stats = games.slice( 0, i ).map( g => {

		if ( g.user1Result === 0.5 ) return 0.5;
		if ( g.user1.username === env.member ) return g.user1Result;
		if ( g.user2.username === env.member ) return g.user2Result;

		return -1;
	});

	state.stats = stats;

	await notify();

}