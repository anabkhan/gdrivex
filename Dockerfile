FROM node:12-alpine

RUN cd /ui && npm install && npm build

ADD ui/build /app/views
ADD api/constants /app/constants
ADD api/services /app/services
ADD api/credentials.json /app

ADD api/package.json /app
ADD api/server.js /app

RUN cd /app; npm install

ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080

WORKDIR "/app"
CMD [ "npm", "start" ]