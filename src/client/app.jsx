import { render } from "preact";
import dashboard from "@/client/ui/dashboard.jsx";
import widget from "@/client/ui/widget.jsx";
import { store } from "@/client/app-store.js";

const initData = JSON.parse(
  document.querySelector("#init-data")?.textContent ?? "{}",
);
store.parse(initData.state);

const Page = ({ dashboard, widget })[initData.page];
render(<Page />, document.querySelector("body"));
