FROM denoland/deno:alpine-2.8.3 AS builder
WORKDIR /app

RUN apk add --no-cache curl libstdc++ libgcc
RUN curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/download/v4.3.2/tailwindcss-linux-x64-musl \
    && chmod +x tailwindcss-linux-x64-musl \
    && mv tailwindcss-linux-x64-musl /usr/local/bin/tailwindcss

COPY deno.json .
RUN deno install --allow-import

COPY public ./public
COPY src ./src

RUN deno task build:*


FROM denoland/deno:alpine-2.8.3
WORKDIR /app

COPY deno.json .
RUN deno install --allow-import

COPY --from=builder /app/public ./public
COPY src ./src

USER deno

CMD ["task", "run"]