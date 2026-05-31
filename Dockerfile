FROM denoland/deno:latest

WORKDIR /app

COPY deno.json .

RUN deno install --allow-import

COPY public ./public
COPY src ./src

CMD ["task", "run"]