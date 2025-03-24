import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrytp from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"


export const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "ALL FIELDS ARE REQUIRED " });
    }
    //hash passwords
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }
    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });
    const salt = await bcrytp.genSalt(10);
    const hashedPassword = await bcrytp.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      //generate jwt token here
       generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilepic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("ERROR IN SIGNUP CONTROLER", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "invalid credentials" });
    }
    const isPasswordCorrect = await bcrytp.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "invalid credentials" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("error in login controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "LOGGED OUT SUCESSFULLY" });
  } catch (error) {
    console.log("error iin logout controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
    try{
        const{profilePic}= req.body;
      const userId = req.user._id;
      if(!profilePic){
        return res.status(400).json({ message: "PROFILE PIC IS REQUIRED" }); 
      }
    const uploadResponse =   await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})
    res.status(200).json(updatedUser)
    }
    catch(error){
        console.log("error in update profile:",error);
        res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }
};
// export const updateProfile = async (req, res) => {
//   try {
//       const { profilePic } = req.body;
//       const userID = req.user?._id;

//       if (!userID) {
//           return res.status(401).json({ message: "Unauthorized access" });
//       }

//       if (!profilePic) {
//           return res.status(400).json({ message: "PROFILE PIC IS REQUIRED" });
//       }

//       console.log("Uploading image to Cloudinary...");
//       const uploadResponse = await cloudinary.uploader.upload(profilePic, {
//           resource_type: "image", // Ensuring it's treated as an image
//           folder: "user_profiles", // Optional: Organize uploads in Cloudinary
//       });

//       console.log("Cloudinary Upload Response:", uploadResponse);

//       if (!uploadResponse || !uploadResponse.secure_url) {
//           return res.status(500).json({ message: "Cloudinary upload failed" });
//       }

//       const updatedUser = await User.findByIdAndUpdate(
//           userID,
//           { profilePic: uploadResponse.secure_url },
//           { new: true }
//       );

//       console.log("Updated User:", updatedUser);

//       res.status(200).json(updatedUser);
//   } catch (error) {
//       console.error("Error in updateProfile:", error);
//       res.status(500).json({ message: "INTERNAL SERVER ERROR" });
//   }
// };
// export const updateProfile = async (req, res) => {
//   try {
//     const { profilePic } = req.body;
//     const userID = req.user?._id;

//     if (!userID) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }

//     if (!profilePic) {
//       return res.status(400).json({ message: "PROFILE PIC IS REQUIRED" });
//     }

//     console.log("Uploading image to Cloudinary...");
//     const uploadResponse = await cloudinary.uploader.upload(profilePic, {
//       resource_type: "image",
//       folder: "user_profiles",
//     });

//     console.log("Cloudinary Upload Response:", uploadResponse);

//     if (!uploadResponse || !uploadResponse.secure_url) {
//       return res.status(500).json({ message: "Cloudinary upload failed" });
//     }

//     // **Remove the version number from the URL before storing it**
//     const cleanUrl = uploadResponse.secure_url.replace(/\/v\d+\//, "/");

//     const updatedUser = await User.findByIdAndUpdate(
//       userID,
//       { profilePic: cleanUrl },
//       { new: true }
//     );

//     console.log("Updated User:", updatedUser);

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error("Error in updateProfile:", error);
//     res.status(500).json({ message: "INTERNAL SERVER ERROR" });
//   }
// };

export const checkAuth = (req, res)=>{ 
    try{
        res.status(200).json(req.user);
    }
    catch(error){
        console.log("error in checkAuth controller", error.message);
        res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }
}