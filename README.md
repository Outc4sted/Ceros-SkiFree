# Ceros Ski Code Challenge [![Build Status](https://travis-ci.org/Outc4sted/Ceros-SkiFree.svg?branch=master)](https://travis-ci.org/Outc4sted/Ceros-SkiFree)

#### https://outc4sted.github.io/Ceros-SkiFree
Homework app that is refactored from a simple version of the classic Windows game SkiFree.

![SkiFree preview](https://i.imgur.com/v7mYJA4.png)

* Set up babel for transpiling
* Eliminated the need for jQuery and lodash dependencies
* Set up webpack for dev reloading and building for production
* Refactored code from a jQuery blob into classes that handle game state and assets
* Completely upgraded to ES6+ with all methods and state being testable
* Use of Symbols to create pseudo-private methods (which are also testable)
* Fixed a bug that triggered when the player crashed and pressed left
* Added feature where the skier moves faster as the game progresses
* Integrated TravisCI for automated gh-pages deployment
* Added a basic score and highscore dashboard
* Reset the game with space bar

## Available Scripts

In the project directory, you can run:

### `npm i`

Installs packages for initial setup.

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.<br>
The page will reload if you make edits.

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles and minifies javascript and styling in production mode and optimizes the build for the best performance.
