import mongoose from "mongoose";
import { debugLog } from "./debug.js";

const connectDB = async ()=>{
    
    mongoose.connection.on('connected', ()=> debugLog("DATABASE CONNECTED"));
    await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`);
}

export default connectDB;