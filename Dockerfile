# Use Node.js 18 as the base image
FROM node:18

# Set environment variable for debugging
ARG GOOGLE_APPLICATION_CREDENTIALS_PATH
ENV GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS_PATH

ARG GOOGLE_CLOUD_PROJECT
ENV GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT

# Install necessary libraries
RUN apt-get update && \
    apt-get install -y libx11-xcb1 libxcomposite1 libxi6 libxext6 libxtst6 libnss3 libasound2 libatk1.0-0 libcups2 libxss1 libxrandr2 libgconf-2-4 libgtk-3-0 libgbm1 libdrm2

ENV LANGUAGE ja_JP.UTF-8
ENV LANG ja_JP.UTF-8
RUN apt-get install -y --no-install-recommends locales && \
    locale-gen ja_JP.UTF-8 && \
    apt-get install -y --no-install-recommends fonts-ipafont

# Download and install Google Chrome ZIP binary
ENV CHROME_VERSION 117.0.5938.88
RUN curl -sS -o /tmp/chrome-linux64.zip https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/$CHROME_VERSION/linux64/chrome-linux64.zip && \
    unzip /tmp/chrome-linux64.zip -d /opt/chrome && \
    rm /tmp/chrome-linux64.zip && \
    ln -fs /opt/chrome/chrome-linux64/chrome /usr/local/bin/chrome

# Set up Chromedriver
ENV CHROMEDRIVER_VERSION 117.0.5938.88
RUN mkdir -p /opt/chromedriver-$CHROMEDRIVER_VERSION && \
    curl -sS -o /tmp/chromedriver_linux64.zip https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/$CHROMEDRIVER_VERSION/linux64/chromedriver-linux64.zip && \
    unzip -qq /tmp/chromedriver_linux64.zip -d /opt/chromedriver-$CHROMEDRIVER_VERSION && \
    rm /tmp/chromedriver_linux64.zip && \
    chmod +x /opt/chromedriver-$CHROMEDRIVER_VERSION/chromedriver-linux64 && \
    ln -fs /opt/chromedriver-$CHROMEDRIVER_VERSION/chromedriver /usr/local/bin/chromedriver

EXPOSE 8080

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]
