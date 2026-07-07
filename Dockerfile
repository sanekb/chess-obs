FROM denoland/deno:alpine-2.8.3

WORKDIR /app

COPY deno.json .

RUN deno install --allow-import

COPY public ./public
COPY src ./src

CMD ["task", "run"]