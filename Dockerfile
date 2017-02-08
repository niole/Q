FROM node:boron

#create appdirectory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#install deps
COPY package.json /usr/src/app/
RUN npm install

#bundle app's source
COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
