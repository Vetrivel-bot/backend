const mongoose = require('mongoose')
const connectDataBase=()=>{
    mongoose.connect(process.env.MONGO_URL, {

      })
      .then(() => console.log("MongoDB Connected"))
      .catch((err) => console.error("MongoDB Connection Error:", err));
      

}

module.exports = connectDataBase