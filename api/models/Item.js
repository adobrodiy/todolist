/**
* Item.js
*
* @description :: model of item of todolist
*/

module.exports = {

  attributes        : {
    "title"         : {
      "type"        : "string",
      "required"    : true
    },
    "description"   : {
      "type"        : "text",
      "required"    : true,
      "defaultsTo"  : ""
    },
    "author"        : {
      "type"        : "string",
      "required"    : true
    }
  }
};

