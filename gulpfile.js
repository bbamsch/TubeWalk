const gulp = require('gulp');
const updateDotenv = require('update-dotenv');

const dotenv = (done) => {
  updateDotenv({
    API_KEY: process.env.API_KEY,
  });
  done();
}

const actions = {
  config: gulp.series(dotenv),
}

module.exports = {
  default: actions.config,
  config: actions.config,
}
