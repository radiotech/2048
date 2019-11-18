# About
This project was developed by COMP 523 Group K to accompany the team's tech talk. Additional information regarding the team and the tech talk are available on the group's website at [http://comp523k.web.unc.edu/](http://comp523k.web.unc.edu/). This project was based upon a 2048 web app developed by Jenny Wang. It is meant to illustrate the steps required to add Progressive Web App (PWA) support to an existing web app developed using HTML and JavaScript.

# Getting Started
Before starting, you should first ensure that you have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/get-npm) installed on your system. You can then get started with the project by cloning the repository to your system. The root directory contains an original version of the app without PWA support. The `pwa` subdirectory contains a version of the app that has been modified to include PWA support. The project's `server` folder contains a basic express server that can be used to host the root directory locally at `localhost:8080`. The following commands can be used to clone the repository and start the local development server.

```
git clone https://github.com/radiotech/2048.git 2048_demo
cd 2048_demo
npm install
npm start
```

After the development server is started, you should be able to access the app by navigating to `localhost:8080` in your browser. The app with PWA support should be available at `localhost:8080/pwa`. You can explore versions of the app with and without PWA support by comparing the contents of the project's root and `pwa` folders or by comparing the `localhost:8080` and `localhost:8080/pwa` pages in your browser. You can also practice working with PWA features by attempting to addfunctionality to the app. You can either attempt to add PWA support to the original web app or can start with the app that already has PWA support and can attempt to add aditional features such as push notifications. The team's PWA presentation is available under `Assignment 11 – Tech Talk` on the project website's [Deliverables page](https://comp523k.web.unc.edu/deliverables/).
