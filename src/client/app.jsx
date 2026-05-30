import { render } from "preact";
import dashboard from "@/client/ui/dashboard.jsx";
import widget from "@/client/ui/widget.jsx";

const pages = { dashboard, widget };
const initData = JSON.parse(
  document.querySelector("#init-data")?.textContent ?? {},
);

function App() {
  const Page = pages[initData.page];
  return <Page state={initData.state} />;
}

render(<App />, document.querySelector("body"));
