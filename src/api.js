const json = JSON.parse(Deno.readTextFileSync("mock.json"));

export function api() {
  return json;
}
