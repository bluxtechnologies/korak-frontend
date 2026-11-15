/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
if (fs.realpathSync && fs.realpathSync.native) {
  fs.realpathSync.native = fs.realpathSync;
}
if (fs.realpath && fs.realpath.native) {
  fs.realpath.native = fs.realpath;
}
