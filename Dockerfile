FROM node:12-alpine

WORKDIR /ui

COPY ui /ui
# COPY ui/package.json /ui/package.json
RUN cd /ui; npm install && npm build

# RUN npm install 
# RUN npm build

WORKDIR /app

# ADD /ui/build /app/views
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