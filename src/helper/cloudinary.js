const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "vnu-uet",
  api_key: "939631583524948",
  api_secret: "CawEEW_miHfPUi2enUlJ1xglMII",
});

module.exports = { cloudinary };
