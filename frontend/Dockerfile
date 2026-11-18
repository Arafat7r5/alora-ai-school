FROM node:24-alpine
WORKDIR /code
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_PROXY_TARGET=http://api:8000
EXPOSE 5173
CMD ["npm", "run", "dev"]
