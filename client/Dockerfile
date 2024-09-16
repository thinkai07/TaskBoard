# Stage 1: Build the React app
FROM node:20 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install -f

# Copy the rest of the application files to the container
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy the build output from the previous stage to Nginx's public directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port on which Nginx is running
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]