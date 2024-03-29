FROM node:12-alpine

# RUN apk add  --no-cache ffmpeg

WORKDIR /ui

ADD ui /ui
# COPY ui/package.json /ui/package.json
RUN cd /ui; npm install && npm run build

RUN echo $(ls -1 /ui)

# RUN npm install 
# RUN npm build

WORKDIR /app

ADD api/constants /app/constants
ADD api/services /app/services
ADD api/credentials.json /app

ADD api/package.json /app
ADD api/server.js /app

RUN cd /app; npm install

RUN cp -r /ui/build /app/views

ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080

WORKDIR "/app"
CMD [ "npm", "start" ]