  import { create } from "zustand";
  import toast from "react-hot-toast";
  import axiosInstance from "../lib/axios"; 
  import {useAuthStore} from "./useAuthStore";

  export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
      set({ isUsersLoading: true });
      try { 
        const res = await axiosInstance.get("/messages/users");
        set({ users: res.data });
      } catch (error) {
        toast.error("INTERNAL SERVER ERROR",error.response.data.message);
      } finally {
        set({ isUsersLoading: false });
      }
    },


    getMessages: async (userId) => {
      set({ isMessagesLoading: true });
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
      } catch (error) {
        toast.error("error in getting messages",error.response.data.message);
      } finally {
        set({ isMessagesLoading: false });
      }
    },


    sendMessage : async(messageData) =>{
      const{selectedUser,messages} = get()
      try{
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData);
        set({messages:[...messages,res.data]})
      }catch(error){
        toast.error(error.response?.data?.message || "Error fetching messages");
}
    },
    
    subscribeToMessages:(socket) =>{
      const {selectedUser} = get();
      if(!selectedUser) return;
      // const socket= useAuthStore().get().socket;

      socket.on("newMessage",(newMessage)=>{
        const isMessageSentFromSelectedUser = newMessage.senderId===selectedUser._id;
        if(!isMessageSentFromSelectedUser) return;
        set({messages:[...get().messages,newMessage],

        });
      });

    },


    unSubscribeFromMessages:(socket)=>{
      socket.off("newMessage")
    },


    setSelectedUser: (user) => {
      console.log("Updating selectedUser in store:", user); // Debugging
      set({ selectedUser: user });
    },
    
    
  }));
  export default useChatStore;
