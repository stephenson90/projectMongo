var mongoose = require('mongoose');
var thumb = require('mongoose-thumbnail');
var thumbPlugin = thumb.thumbPlugin;
var Schema = mongoose.Schema;

var PictureSchema = new Schema({
  title: String
});

PictureSchema.plugin(thumbPlugin, {
  name: "photo",
  inline: false
});
var Picture = db.model("Picture", PictureSchema);
module.exports = Picture;