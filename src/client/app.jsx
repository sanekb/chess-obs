import { store } from "@/client/store.js";
import dashboard from "@/client/ui/dashboard.jsx";
import widget from "@/client/ui/widget.jsx";
import { render } from "preact";
import { connectSSE } from "@/client/api.js";
import { TITLE } from "@/consts.js";

(function init() {
  document.title = TITLE +
    (location.hostname === "localhost" ? " (localhost)" : "");

  const { page, state } = JSON.parse(
    document.querySelector("#init-data").textContent,
  );

  store.parse(state);

  const Page = ({ dashboard, widget })[page];
  render(<Page />, document.body);

  connectSSE();
})();
