FROM node:12-alpine

COPY ui /reactui
COPY ui/package.json /reactui/package.json
RUN cd /reactui; npm install

RUN npm install 
RUN npm build

ADD /reactui/build /app/views
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