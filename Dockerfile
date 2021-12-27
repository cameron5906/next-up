FROM node:16-alpine3.12

COPY . .
RUN npm i -g bin-version-check-cli
RUN npm i -g typescript
RUN npm i

ENTRYPOINT [ "npm", "start" ]