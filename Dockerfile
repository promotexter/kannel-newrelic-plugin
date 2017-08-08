FROM node:4.8
ADD . /src
WORKDIR /src/
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN yarn global add pm2
RUN yarn install --ignore-engines
CMD ["pm2-docker", "pm2.json"]