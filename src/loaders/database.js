const mongoose = require('mongoose');

module.exports = () => {
  var config = {
    port: '27017',
    database: 'qlda-server'
  };

  mongoose.connect(`mongodb://localhost:${config.port}/${config.database}`, {
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  var conn = mongoose.connection;

  conn.once('open', function () {
    console.log('connected mongodb');
  });
  // var schema = mongoose.Schema({
  //   name: String,
  //   age: Number
  // });
  
  // var Model = mongoose.model("model", schema, "myCollection");
  
  // var doc1 = new Model({ name: "John", age: 21 });
  
  // doc1.save(function(err, doc) {
  //   if (err) return console.error(err);
  //   console.log("Document inserted succussfully!");
  // });
  return conn;
  
};
