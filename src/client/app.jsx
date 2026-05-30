import { render } from "preact";
import dashboard from "@/client/ui/dashboard.jsx";
import widget from "@/client/ui/widget.jsx";

const pages = { dashboard, widget };
const initState = JSON.parse(
  document.querySelector("#initial-state")?.textContent ?? {},
);

function App() {
  const Page = pages[initState.page];
  return <Page state={initState.state} />;
}

render(<App />, document.querySelector("body"));
