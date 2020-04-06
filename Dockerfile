FROM   node:lts-alpine

ENV    DATA_DIR='/data'

RUN    mkdir /app
RUN    chown node:node /app
RUN    mkdir /data
RUN    chown node:node /data

USER   node
WORKDIR /app
COPY   --chown=node:node . ./

RUN    npm config set registry http://registry.npmjs.org/;

RUN    npm install;

EXPOSE 8001

CMD    node server.js;