import mongoose from "mongoose";
import userModel from "./models/users.js";

// uncomment the following line to view mongoose debug messages
mongoose.set("debug", true);

mongoose
  .connect("mongodb://127.0.0.1:27017/users", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => console.log(error));

async function getUsers() {
  let result;
  console.log('returning all users');
  result = await userModel.find();
  return result.map(user => user.email);
}

async function findUserByEmail(email) {
  try {
    console.log("FINDING ID: " + email);
    return await userModel.find({email: email});
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function addUser(user) {
  try {
    console.log('adding user')
    const userToAdd = new userModel(user);
    const savedUser = await userToAdd.save();
    return savedUser;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export default {
  addUser,
  getUsers,
  findUserByEmail,
};