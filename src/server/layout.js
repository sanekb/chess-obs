export function html(initialState = {}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Chess OBS</title>
        <link rel="stylesheet" href="/css/tailwind.css">
    </head>
    <body>
        <script id="initial-state" type="application/json">
            ${JSON.stringify(initialState)}
        </script>
        <script type="module" src="/js/mod.js"></script>
    </body>
    </html>
  `;
}
