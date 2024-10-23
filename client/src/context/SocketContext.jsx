import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppStore } from "../store";
import { HOST } from "../utils/constants";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    // console.log("userInfo: ", userInfo);
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });
      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      const handleReceiveMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addContactsInDMContacts,
          isSeen,
          setIsSeen,
        } = useAppStore.getState();

        // console.log("sender: ", message.sender);
        // console.log("recipient: ", message.recipient);

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          console.log("message rcvd", message);
          addMessage(message);
        }
        addContactsInDMContacts(message);
      };

      const handleReceiveFriendRequest = (friendRequest) => {
        // console.log("Received friend request: ", friendRequest);
        const {
          friendRequests,
          setFriendRequests,
          friendRequestsCount,
          setFriendRequestsCount,
        } = useAppStore.getState();

        const formattedFriendRequest = {
          email: friendRequest.email,
          firstName: friendRequest.firstName,
          lastName: friendRequest.lastName,
          image: friendRequest.image,
        };

        // Check if the friend request already exists
        const requestExists = friendRequests.some(
          (req) => req.email === formattedFriendRequest.email
        );

        // Only add the formatted friend request if it doesn't already exist
        if (!requestExists) {
          // setFriendRequests([...friendRequests, formattedFriendRequest]);
          setFriendRequestsCount(friendRequests.length + 1);
          // console.log("request count: ", friendRequestsCount);
          setFriendRequests([formattedFriendRequest, ...friendRequests]);
        } else {
          console.log("Friend request already exists.");
        }
      };

      socket.current.on("receiveMessage", handleReceiveMessage);

      socket.current.on("receiveFriendRequest", handleReceiveFriendRequest);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};