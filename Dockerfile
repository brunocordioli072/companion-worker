FROM node:10

RUN mkdir /worker

WORKDIR /worker

COPY ./package.json ./package-lock.json ./
RUN npm install -g serverless
RUN npm install
ENV NODE_ENV "local"

COPY . .

EXPOSE 8080
CMD [ "serverless", "offline", "--host", "0.0.0.0" ]

