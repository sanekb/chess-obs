FROM denoland/deno:alpine

WORKDIR /app

COPY deno.json .

RUN deno install --allow-import

COPY public ./public
COPY src ./src

CMD ["task", "run"]