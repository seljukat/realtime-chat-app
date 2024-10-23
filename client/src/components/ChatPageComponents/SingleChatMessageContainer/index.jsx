import { useEffect, useRef, useState } from "react";
import "./SingleChatMessageContainer.css";
import { useAppStore } from "../../../store";
import { apiClient } from "../../../lib/api-client";
import { GET_ALL_MESSAGES_ROUTE } from "../../../utils/constants";
import moment from "moment";
import { BsFillTriangleFill } from "react-icons/bs";
import { MdChatBubble } from "react-icons/md";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";

const SingleChatMessageContainer = () => {
  const scrollRef = useRef();
  const scrollProgressRef = useRef();

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    uploadProgress,
    setUploadProgress,
    uploadTargetId,
    setUploadTargetId,
    uploadFileName,
    setUploadFileName,
  } = useAppStore();

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "instant" });
  //   }
  // }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);
  useEffect(() => {
    if (scrollProgressRef.current) {
      scrollProgressRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [uploadProgress]);

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const checkIfImage = (filePath) => {
    // Extract the part before the query parameters
    const pathWithoutParams = filePath.split("?")[0];

    // Define regex to check if it ends with a valid image extension
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif|jfif)$/i;

    // Test the cleaned path
    return imageRegex.test(pathWithoutParams);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");

      // console.log(index + "msg date: " + messageDate);
      // console.log("last date: " + lastDate);

      // console.log("message timestamp: " + message.timestamp);

      // const messageDay = Math.floor(messageDate / 86400000);
      // const lastDay = Math.floor(lastDate / 86400000);

      const showDate = messageDate !== lastDate;

      // const showDate = messageDay !== lastDay;

      lastDate = messageDate;

      // console.log("showDate: " + showDate);

      return (
        <div key={index}>
          {showDate && (
            <div className="general-date-container">
              <div className="general-date-line left"></div>
              <div className="general-date">
                {moment(message.timestamp).format("LL")}
              </div>
              <div className="general-date-line right"></div>
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
        </div>
      );
    });
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", ""); // This forces a download -> Downloads with the original filename from the URL
    // link.setAttribute("download", "myFileName.extension"); // Downloads as "myImage.jpg" for example
    document.body.appendChild(link);
    link.click();
    // link.remove(); redundant -> below line already does the same thing
    document.body.removeChild(link);
  };

  // const shortenFileName = (fileName, maxLength = 81) => {
  //   if (fileName.length <= maxLength) {
  //     return fileName; // No need to shorten
  //   }

  //   const start = fileName.slice(0, 24); // First 10 characters
  //   const end = fileName.slice(-24); // Last 10 characters
  //   return `${start}...${end}`; // Combine with dots in the middle
  // };
  const shortenFileName = (fileName, maxLength = 81) => {
    if (fileName.length <= maxLength) {
      return fileName; // No need to shorten
    }

    const startLength = 24; // Length of the start part
    const endLength = 24; // Length of the end part

    const start = fileName.slice(0, startLength); // First 24 characters
    const end = fileName.slice(-endLength); // Last 24 characters

    const totalLength = fileName.length; // Total length of the original file name
    const dotsCount = totalLength - startLength - endLength; // Calculate number of dots

    // Create dots string based on calculated number
    const dots = dotsCount > 0 ? ".".repeat(dotsCount) : "";

    return `${start}${dots}${end}`; // Combine start, dots, and end
  };

  const renderDMMessages = (message) => (
    <div
      className={`message ${
        message.sender === selectedChatData._id
          ? "contact-message"
          : "own-message"
      }`}
    >
      <div
        className={`${
          message.sender !== selectedChatData._id
            ? "own-message-content"
            : "contact-message-content"
        } message-content`}
      >
        <div className="user-pointer">
          <MdChatBubble className="user-pointer-icon" />
        </div>
        {message.messageType === "text" && message.content}
        {message.messageType === "file" && message.fileUrl && (
          <div
          // className={`${
          //   message.messageType === "file" && checkIfImage(message.fileUrl)
          //     ? "image-outer-container"
          //     : ""
          // }`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="image-container"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                {/* <p>{message.fileUrl}</p> */}
                <img
                  src={message.fileUrl}
                  alt=""
                  style={{
                    width: "12.5rem",
                    height: "12.5rem",
                    // objectFit: "contain",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                {/* <img src={message.fileUrl} alt="" /> */}
              </div>
            ) : (
              <div className="file-container">
                {/* <div className="file-icon-outer-container"> */}{" "}
                <div className="file-icon-container">
                  <MdFolderZip className="file-icon" />
                </div>
                {/* </div> */}
                <div className="file-name">
                  {/* {message.fileUrl.split("?")[0].split("/").pop()} */}
                  {shortenFileName(
                    message.fileUrl.split("?")[0].split("/").pop()
                  )}
                </div>
                <div className="download-icon-container-link">
                  <a
                    className="download-icon-container"
                    onClick={() => handleDownload(message.fileUrl)}
                  >
                    <IoMdArrowRoundDown className="download-icon" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        <div
          className={`${
            message.messageType === "file" && checkIfImage(message.fileUrl)
              ? "image-timestamp"
              : message.messageType === "file" && !checkIfImage(message.fileUrl)
              ? "file-timestamp"
              : ""
          } timestamp-container`}
        >
          <div className="message-timestamp">
            {/* {moment(message.timestamp).format("LT")} */}
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      </div>

      {/* <div className="message-timestamp">
        {moment(message.timestamp).format("LT")}
      </div> */}
      {/* </div> */}
    </div>
  );

  return (
    <div className="message-container">
      {renderMessages()}
      {uploadProgress > 0 && uploadTargetId === selectedChatData._id && (
        <>
          <div className="message own-message">
            <div className="message-content own-message-content">
              <div className="user-pointer">
                <MdChatBubble className="user-pointer-icon" />
              </div>
              <div>
                <div className="file-container">
                  <div className="file-icon-container">
                    <MdFolderZip className="file-icon" />
                  </div>
                  <div className="file-name">
                    {/* uploadProgress message */}
                    {`Uploading "${shortenFileName(
                      uploadFileName
                    )}": ${uploadProgress.toFixed(2)}%`}
                  </div>
                  <div className="download-icon-container-link">
                    <a
                      className="download-icon-container"
                      style={{ pointerEvents: "none" }}
                    >
                      <IoMdArrowRoundDown className="download-icon" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="timestamp-container file-timestamp">
                <div className="message-timestamp">
                  {/* {moment(message.timestamp).format("LT")} */}
                  {moment(Date.now()).format("LT")}
                </div>
              </div>
            </div>
          </div>
          <div ref={scrollProgressRef} />
          {/* <div ref={scrollRef} /> */}
        </>
      )}
      <div ref={scrollRef} />
    </div>
  );
};

export default SingleChatMessageContainer;