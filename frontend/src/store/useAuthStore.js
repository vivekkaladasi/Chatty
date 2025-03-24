import axios from "axios";
import axiosInstance from "../lib/axios.js";
import { create } from "zustand";
import toast from "react-hot-toast";
import { useEffect } from "react";
import {io} from 'socket.io-client';
const BASE_URL = import.meta.env.MODE=== "development"?"http://localhost:5001" :"/"
export const useAuthStore = create((set,get) => ({
  authUser: null,

  isSigningUp: false,

  isLoggingUp: false,

  isUpdatingProfile: false,
 
  isCheckingAuth: true,

  onlineUsers: [],

  socket:null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket()
    } catch (error) {
      console.log("ERROR IN CHECKAUTH:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },


  signUp: async (data) => {
    set({ isSigningUp: true });
    console.log(
      "Signup Data Sent from Frontend:",
      JSON.stringify(data, null, 2)
    ); // Debugging output

    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({ authUser: res.data });
      toast.success("Account Created Sucessfully");
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("ERROR IN SIGNUP:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },


  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("LOGGED IN SUCESSFULLY");
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },


  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });

      toast.success("logged out sucessfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },


  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket:()=>{
    const{authUser}=get()
    if(!authUser || get().socket?.connected) return;
    const socket= io(BASE_URL,{
      query:{
        userId: authUser._id,

      },
    })
    socket.connect()
    set({socket:socket});
    socket.on("getOnlineUsers",(userIds)=>{
      set({onlineUsers:userIds});
    })
  },


  disconnectSocket:()=>{
    if(get().socket?.connected) get().socket.disconnect();
  }
}));
