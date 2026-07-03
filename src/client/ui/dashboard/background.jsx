import { cn } from "@/client/utils.js";

function Rhombus(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -10 50 40"
      class={cn(props.class, "absolute")}
    >
      <rect
        x="10"
        y="0"
        width="20"
        height="20"
        rx="4"
        ry="4"
        class="solid text-secondary-300"
        transform="rotate(45, 20, 10)"
      />
      <rect
        x="18"
        y="0"
        width="20"
        height="20"
        rx="4"
        ry="4"
        class="outlined text-secondary-200"
        transform="rotate(45, 28, 10)"
      />
    </svg>
  );
}

function Cube(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -10 50 40"
      class={cn(props.class, "absolute")}
    >
      <rect
        x="10"
        y="0"
        width="20"
        height="20"
        rx="4"
        ry="4"
        class="solid text-secondary-300"
      />
      <rect
        x="16"
        y="-6"
        width="20"
        height="20"
        rx="4"
        ry="4"
        class="outlined text-secondary-200"
      />
    </svg>
  );
}

function Circles(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 110 110"
      class={cn(props.class, "w-24 h-24 absolute text-secondary-200")}
    >
      <circle r="4" cx="10" cy="10" />
      <circle r="4" cx="40" cy="10" />
      <circle r="4" cx="70" cy="10" />
      <circle r="4" cx="100" cy="10" />
      <circle r="4" cx="10" cy="40" />
      <circle r="4" cx="40" cy="40" />
      <circle r="4" cx="70" cy="40" />
      <circle r="4" cx="100" cy="40" />
      <circle r="4" cx="10" cy="70" />
      <circle r="4" cx="40" cy="70" />
      <circle r="4" cx="70" cy="70" />
      <circle r="4" cx="100" cy="70" />
      <circle r="4" cx="10" cy="100" />
      <circle r="4" cx="40" cy="100" />
      <circle r="4" cx="70" cy="100" />
      <circle r="4" cx="100" cy="100" />
    </svg>
  );
}

export function Background(props) {
  return (
    <aside class="fixed w-screen h-screen pointer-events-none z-0 opacity-25">
      <Circles class="left-[75%] top-[5%]" />
      <Circles class="left-[5%] top-[50%]" />
      <Circles class="left-[50%] top-[90%]" />
      <Cube class="left-[80%] top-[80%] w-20 h-20" />
      <Rhombus class="left-[10%] top-[10%] w-26 h-26" />
    </aside>
  );
}
