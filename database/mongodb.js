import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const db_uri=process.env.MONGODB_URI;


 mongoose.connect(db_uri)
     .then(()=> {
          console.log('connected to database... ');
    }).catch((err)=>{
        console.log("error connecting to database...", err);
      } 
    )
