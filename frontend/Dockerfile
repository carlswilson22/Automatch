FROM node:20-alpine

WORKDIR /app

ENV BROWSERSLIST_IGNORE_OLD_DATA=true

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm install

# Copy application files
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
