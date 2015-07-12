"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (signature, id) {
  return "\n    @mixin " + signature + " {\n      @include __sassport-mixin(" + id + ", &) {\n        @content;\n      }\n    }\n  ";
};

module.exports = exports["default"];