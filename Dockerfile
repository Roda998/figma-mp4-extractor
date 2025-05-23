FROM apify/actor-node-puppeteer-chrome

COPY . ./

RUN npm install

CMD ["node", "main.js"]
