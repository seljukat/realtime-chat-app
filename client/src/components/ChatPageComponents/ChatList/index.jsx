import { useEffect, useRef, useState } from "react";
import { RiChatNewFill } from "react-icons/ri";
import { IoMdMore } from "react-icons/io";
import { BsFillTriangleFill } from "react-icons/bs";
import { IoPersonAdd } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { MdGroupAdd } from "react-icons/md";
import "./ChatList.css";
import Chats from "../Chats";
import { useAppStore } from "../../../store";
import { apiClient } from "../../../lib/api-client";
import {
  CREATE_FRIEND_REQUEST_ROUTE,
  CREATE_GROUP_ROUTE,
  GET_ALL_CONTACTS_ROUTE,
  GET_DM_CONTACTS_ROUTE,
  GET_USER_GROUPS_ROUTE,
  SEARCH_CONTACTS_ROUTE,
  SEARCH_DM_CONTACTS_ROUTE,
} from "../../../utils/constants";
import LeftSidebarProfile from "../LeftSidebarProfile";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaAddressCard } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { toast } from "react-toastify";
import FriendRequests from "../FriendRequests";
import { useSocket } from "../../../context/SocketContext";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const ChatList = () => {
  const { activeIcon, setActiveIcon } = useAppStore();
  const { activeFilter, setActiveFilter } = useAppStore();
  const { refreshChatList, setRefreshChatList, userInfo } = useAppStore();

  // const [activeFilter, setActiveFilter] = useState("all");
  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
  };

  const {
    directMessagesContacts,
    setDirectMessagesContacts,
    groups,
    setGroups,
    addGroupInGroupList,
    addContactsInDmContacts,
    selectedChatMessages,
  } = useAppStore();
  const socket = useSocket();

  // console.log("useeffect out above");

  useEffect(() => {
    // console.log("useeffect entered");
    const getContacts = async () => {
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTE, {
        withCredentials: true,
      });
      if (response.data.contacts) {
        // console.log("Fetched contacts:", response.data.contacts);
        setDirectMessagesContacts(response.data.contacts);
      }
    };

    const getGroups = async () => {
      // console.log("above all");
      const response = await apiClient.get(GET_USER_GROUPS_ROUTE, {
        withCredentials: true,
      });
      // console.log("above if");
      if (response.data.groups) {
        // console.log("inside if");
        setGroups(response.data.groups);
        // addGroupInGroupList(response.data.groups);
      }
      // console.log("below if");
      // console.log("below all");
    };

    getContacts();
    getGroups();

    // }, [directMessagesContacts, setDirectMessagesContacts]);
  }, [
    refreshChatList,
    setGroups,
    setDirectMessagesContacts,
    addGroupInGroupList,
    // addContactsInDmContacts,
    selectedChatMessages,
  ]);

  // console.log("useeffect out below");

  const {
    setSelectedChatType,
    setSelectedChatData,
    selectedChatData,
    addFriendRequest,
    // setRefreshFriendRequests,
    isCreatingOneToOneChat,
    setIsCreatingOneToOneChat,
  } = useAppStore();
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [openAddContactModal, setOpenAddContactModal] = useState(false);
  const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [searchedModalContacts, setSearchedModalContacts] = useState([]);
  // add searched contacts for non-modal contact search

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await apiClient.post(
          SEARCH_DM_CONTACTS_ROUTE,
          { searchTerm, directMessagesContacts },
          // { searchTerm, directMessagesContacts },
          { withCredentials: true }
        );

        if (response.status === 200 && response.data.contacts) {
          setSearchedContacts(response.data.contacts);
        }
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchModalContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await apiClient.post(
          SEARCH_CONTACTS_ROUTE,
          { searchTerm },
          // { searchTerm, directMessagesContacts },
          { withCredentials: true }
        );

        if (response.status === 200 && response.data.contacts) {
          setSearchedModalContacts(response.data.contacts);
        }
      } else {
        setSearchedModalContacts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const searchAddModalContacts = async (searchTerm) => {
  //   try {
  //     if (searchTerm.length > 0) {
  //       const response = await apiClient.post(
  //         SEARCH_CONTACTS_ROUTE,
  //         { searchTerm },
  //         // { searchTerm, directMessagesContacts },
  //         { withCredentials: true }
  //       );

  //       if (response.status === 200 && response.data.contacts) {
  //         setSearchedAddModalContacts(response.data.contacts);
  //       }
  //     } else {
  //       setSearchedAddModalContacts([]);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);
    setSelectedChatType("contact");
    console.log(contact);
    setSelectedChatData(contact);
    setSearchedModalContacts([]);
    setRefreshChatList(false);
    console.log(selectedChatData);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendFriendRequestToContact(contactTag);
    }
  };

  const sendFriendRequestToContact = async (contactTag) => {
    setOpenAddContactModal(false);

    if (contactTag === userInfo.email) {
      toast.error("Cannot send friend request to yourself");
      setContactTag("");
      setOpenAddContactModal(true);
      return;
    }

    try {
      if (contactTag) {
        // console.log("above");
        const response = await apiClient.post(
          CREATE_FRIEND_REQUEST_ROUTE,
          { friendRequest: contactTag },
          { withCredentials: true }
        );
        // console.log("below");

        if (response.status === 201) {
          setContactTag("");
          setOpenAddContactModal(false);
          // console.log(response.data);
          // console.log(response.data.requester);

          socket.emit("sendFriendRequest", {
            target: response.data.target,
            friendRequest: response.data.requester,
          });
          // setRefreshFriendRequests(true);
          // addFriendRequest(
          //   response.data.friendRequest,
          //   response.data.requester
          // );
          toast.success(
            `Friend request sent to the user with email: ${contactTag}`
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
    // setSelectedChatType("contact");
    // setSelectedChatData(contact);
    // setSearchedAddModalContacts([]);
    // setRefreshChatList(false);
  };

  const newContactModalRef = useRef(null);
  const newContactIconRef = useRef(null);
  const addContactModalRef = useRef(null);
  const addContactIconRef = useRef(null);
  const createGroupModalRef = useRef(null);
  const createGroupIconRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        newContactModalRef.current &&
        !newContactModalRef.current.contains(event.target) &&
        newContactIconRef.current &&
        !newContactIconRef.current.contains(event.target)
      ) {
        setOpenNewContactModal(false); // Close modal if clicked outside
      }
    };
    const handleClickOutsideAddContact = (event) => {
      if (
        addContactModalRef.current &&
        !addContactModalRef.current.contains(event.target) &&
        addContactIconRef.current &&
        !addContactIconRef.current.contains(event.target)
      ) {
        setOpenAddContactModal(false); // Close modal if clicked outside
      }
    };

    const handleClickOutsideCreateGroup = (event) => {
      if (
        createGroupModalRef.current &&
        !createGroupModalRef.current.contains(event.target) &&
        createGroupIconRef.current &&
        !createGroupIconRef.current.contains(event.target)
      ) {
        setOpenCreateGroupModal(false); // Close modal if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutsideAddContact);
    document.addEventListener("mousedown", handleClickOutsideCreateGroup);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutsideAddContact);
      document.removeEventListener("mousedown", handleClickOutsideCreateGroup);
    };
    // }, [isCartOpen]);
  }, []);

  useEffect(() => {
    if (openNewContactModal && searchNewContactInputRef.current) {
      searchNewContactInputRef.current.focus(); // Focus the input when the modal opens
    }

    if (openAddContactModal && searchAddContactInputRef.current) {
      searchAddContactInputRef.current.focus(); // Focus the input when the modal opens
    }

    if (openCreateGroupModal && searchCreateGroupInputRef.current) {
      searchCreateGroupInputRef.current.focus(); // Focus the input when the modal opens
    }
  }, [openNewContactModal, openAddContactModal, openCreateGroupModal]); // Trigger this effect when openNewContactModal changes

  const [searching, setSearching] = useState(false);

  const onSearchInputChange = (event) => {
    if (event.target.value.length > 0) {
      setSearching(true);
    } else {
      setSearching(false);
    }
    searchContacts(event.target.value);
  };

  const goBack = () => {
    setSearching(false);
    searchContacts("");
    if (searchInputRef.current) {
      searchInputRef.current.value = ""; // Clear the search input when goBack is clicked
    }
  };

  const searchInputRef = useRef(null);
  const searchNewContactInputRef = useRef(null);
  const searchAddContactInputRef = useRef(null);
  const searchCreateGroupInputRef = useRef(null);

  const [contactTag, setContactTag] = useState("");
  const [groupName, setGroupName] = useState("");

  const animatedComponents = makeAnimated();

  const [allContacts, setAllContacts] = useState([]);
  // const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  useEffect(() => {
    const getAllContacts = async () => {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {
        withCredentials: true,
      });

      // setContacts(response.data.contacts);

      const contacts = response.data.contacts.map((user) => ({
        label: user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.email,
        value: user._id,
      }));

      // setAllContacts(response.data.contacts);
      setAllContacts(contacts);
    };

    getAllContacts();
  }, [openCreateGroupModal]);

  const createGroup = async () => {
    try {
      if (groupName.length > 0) {
        const response = await apiClient.post(
          CREATE_GROUP_ROUTE,
          {
            name: groupName,
            members: selectedContacts.map((contact) => contact.value),
            isGroup: true,
          },
          { withCredentials: true }
        );
        if (response.status === 201) {
          setGroupName("");
          setSelectedContacts([]);
          setOpenCreateGroupModal(false);
          // addGroup(response.data.group);
          // addGroupInGroupList(response.data.group);
          socket.emit("createGroup", response.data.group);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createOneToOneChat = async () => {
    try {
      // if (groupName.length > 0) {
      const response = await apiClient.post(
        CREATE_GROUP_ROUTE,
        {
          name: "OneToOneChat",
          members: selectedContacts.map((contact) => contact.value),
          isGroup: true,
        },
        { withCredentials: true }
      );
      if (response.status === 201) {
        setGroupName("");
        setSelectedContacts([]);
        setOpenCreateGroupModal(false);
        // addGroup(response.data.group);
        // addGroupInGroupList(response.data.group);
        socket.emit("createGroup", response.data.group);
      }
      // }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="chat-list">
      {activeIcon === "chat" ? (
        <>
          <div className="header">
            <div className="sub-header">
              <h1>Chats</h1>
              <div className="sub-header-icons">
                {/* <div
                  className="sub-header-icon"
                  // onClick={() => setOpenAddContactModal(true)}
                  onClick={() => setOpenAddContactModal((prev) => !prev)}
                  ref={addContactIconRef}
                  >
                  <FaAddressCard />
                  </div> */}
                <div
                  // className="sub-header-icon"
                  // onClick={() => setOpenAddContactModal((prev) => !prev)}
                  onClick={() => {
                    // console.log("add");
                    // console.log(openAddContactModal);
                    setOpenAddContactModal((prev) => !prev);
                    // console.log(openAddContactModal);
                  }}
                  ref={addContactIconRef}
                >
                  <div
                    className={`tooltip sub-header-icon ${
                      openAddContactModal ? "active-modal" : ""
                    }`}
                  >
                    {/*<FaAddressCard />*/}
                    <IoPersonAdd />
                    <span className="tooltiptext">Add New Friend</span>
                  </div>
                </div>
                <div
                  // className="sub-header-icon"
                  // onClick={() => setOpenAddContactModal((prev) => !prev)}
                  onClick={() => {
                    // console.log("add");
                    // console.log(openAddContactModal);
                    setOpenCreateGroupModal((prev) => !prev);
                    // console.log(openAddContactModal);
                  }}
                  ref={createGroupIconRef}
                >
                  <div
                    className={`tooltip sub-header-icon ${
                      openCreateGroupModal ? "active-modal" : ""
                    }`}
                  >
                    {/*<FaAddressCard />*/}
                    <MdGroupAdd />
                    <span className="tooltiptext">New Group</span>
                  </div>
                </div>
                <div
                  // className="sub-header-icon"
                  // onClick={() => setOpenNewContactModal(true)}
                  // onClick={() => setOpenNewContactModal((prev) => !prev)}
                  onClick={() => {
                    // console.log("new");
                    // console.log(openNewContactModal);
                    setOpenNewContactModal((prev) => !prev);
                    // console.log(openNewContactModal);
                  }}
                  ref={newContactIconRef}
                >
                  <div
                    className={`tooltip sub-header-icon ${
                      openNewContactModal ? "active-modal" : ""
                    }`}
                  >
                    <RiChatNewFill />
                    {/* <span className="tooltiptext">Add New Chat</span> */}
                    <span className="tooltiptext">New Chat</span>
                  </div>
                </div>

                {openCreateGroupModal && (
                  <div className="create-group-modal" ref={createGroupModalRef}>
                    <div className="modal-content">
                      <div className="modal-header">
                        <div className="modal-title">Create New Group</div>
                      </div>
                      <div className="create-group-input-container">
                        <input
                          placeholder="Group Name"
                          value={groupName}
                          onChange={(event) => setGroupName(event.target.value)}
                          // onKeyDown={handleKeyDown}
                          // ref={searchAddContactInputRef}
                          className="modal-input"
                          ref={searchCreateGroupInputRef}
                        />
                        <div className="multi-select-container">
                          {/* MULTI SELECT FOR ADDING CONTACTS TO GROUP */}

                          <Select
                            className="multi-select"
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={allContacts}
                            value={selectedContacts}
                            onChange={setSelectedContacts}
                            placeholder={"Select user(s)"}
                            // styles={}

                            styles={{
                              container: (styles) => ({
                                ...styles,
                                // width: pendingExists ? "8rem" : "20rem",
                                width: "13rem",
                              }),

                              // a
                              option: (styles) => ({
                                ...styles,
                                // backgroundColor: "white",
                                color: "#111b21",
                              }),
                              multiValue: (styles) => ({
                                ...styles,
                                backgroundColor: "lightgray",
                              }),
                              multiValueLabel: (styles) => ({
                                ...styles,
                                color: "#111b21",
                              }),
                              multiValueRemove: (styles) => ({
                                ...styles,
                                color: "#111b21",
                              }),
                            }}
                          />

                          {/* defaultOptions={allContacts}
              placeholder="Search Contacts"
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">
                  No Results Found
                </p> */}
                        </div>

                        <div
                          // className="sub-header-icon submit-button"
                          className="submit-button"
                          // onClick={() => setOpenAddContactModal(true)}
                          // onClick={() => sendFriendRequestToContact(contactTag)}
                          onClick={createGroup}
                          // ref={addContactIconRef}
                        >
                          {/* <IoMdAddCircle /> */}
                          Create
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {openAddContactModal && (
                  <div
                    // className={`add-new-contact-modal ${
                    //   openNewContactModal ? "open" : ""
                    // }`}
                    className="add-new-friend-contact-modal"
                    // onClick={() => setOpenNewContactModal((prev) => !prev)}
                    ref={addContactModalRef}
                  >
                    <div className="modal-content">
                      <div className="modal-header">
                        <div className="modal-title">Add a new contact</div>
                      </div>
                      <div className="add-friend-contact-input-container">
                        <input
                          placeholder="john@example.com"
                          value={contactTag}
                          onChange={(event) =>
                            setContactTag(event.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          ref={searchAddContactInputRef}
                          className="modal-input"
                        />
                        <div
                          className="sub-header-icon"
                          // onClick={() => setOpenAddContactModal(true)}
                          onClick={() => sendFriendRequestToContact(contactTag)}
                          // ref={addContactIconRef}
                        >
                          <IoMdAddCircle />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {openNewContactModal && (
                  <div
                    // className={`add-new-contact-modal ${
                    //   openNewContactModal ? "open" : ""
                    // }`}
                    className="add-new-contact-modal"
                    // onClick={() => setOpenNewContactModal((prev) => !prev)}
                    ref={newContactModalRef}
                  >
                    <div className="modal-content">
                      <div className="modal-header">
                        <div className="modal-title">Select a contact</div>
                      </div>
                      <div>
                        <input
                          placeholder="Search Contacts"
                          // className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                          onChange={(event) =>
                            searchModalContacts(event.target.value)
                          }
                          ref={searchNewContactInputRef}
                          className="modal-input"
                        />
                      </div>
                      {searchedModalContacts.length <= 0 ? null : ( // </div> //   </div> //     </div> //       begin chatting! //       Search a <span className="">Contact</span> to //     <div> //     {/* <h3 className="poppins-medium"> */} //   <div className="modal-idle-text"> //   {/* <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center"> */} //   </div> */} //     Contacts Animation //   {/* <div className="modal-idle-animation"> //   /> */} //   options={animationDefaultOptions} //   width={100} //   height={100} //   isClickToPauseDisabled={true} //   {/* <Lottie // <div> // <div className="flex-1 md:flex mt-5 flex-col justify-center items-center duration-1000 transition-all">
                        <>
                          {/* <div className="h-[250px]"> */}
                          <div className="filler-container">
                            <div className="horizontal-filler"></div>
                            <div className="scrollbar-triangle">
                              <BsFillTriangleFill />
                            </div>
                          </div>
                          <div className="contacts-container">
                            {/* {directMessagesContacts.length > 0 && ( */}

                            {/* )} */}
                            {/* <div className="flex flex-col gap-5"> */}
                            <div className="searched-contacts">
                              {searchedModalContacts.map((contact) => (
                                <div
                                  key={contact._id}
                                  // className="flex items-center gap-3 hover:bg-[#2a2b33] p-3 rounded-lg cursor-pointer"
                                  className="single-contact"
                                  onClick={() => selectNewContact(contact)}
                                >
                                  {/* <div className="w-12 h-12 relative"> */}
                                  <div className="avatar-main-container">
                                    {/* <div className="w-12 h-12 rounded-full overflow-hidden"> */}
                                    <div className="avatar-inner-container">
                                      {contact.image ? (
                                        <img
                                          // src={`${HOST}/${contact.image}`}
                                          src="./avatar.png"
                                          alt="profile"
                                          className="avatar"
                                          // className="object-cover w-full h-full bg-black rounded-full"
                                        />
                                      ) : (
                                        <div
                                        // className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                                        //   contact.color
                                        // )}`}
                                        >
                                          <img
                                            // src={`${HOST}/${contact.image}`}
                                            src="./avatar.png"
                                            alt="profile"
                                            className="avatar"
                                            // className="object-cover w-full h-full bg-black rounded-full"
                                          />
                                          {/* {contact.firstName
                                          ? contact.firstName.split("").shift()
                                          : contact.email.split("").shift()} */}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* <div className="flex flex-col"> */}
                                  <div className="single-contact-info">
                                    {/* <div> */}
                                    {/* <div> */}
                                    <div>
                                      {contact.firstName && contact.lastName
                                        ? `${contact.firstName} ${contact.lastName}`
                                        : contact.email}
                                    </div>
                                    {/* </div> */}
                                    {/* <span className="text-xs text-neutral-400"> */}
                                    {/* <div> */}
                                    <div>{contact.email}</div>
                                    {/* </div> */}
                                    {/* </div> */}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="filler-container">
                            <div className="horizontal-filler"></div>
                            <div className="scrollbar-triangle-upside-down">
                              <BsFillTriangleFill />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="sub-header-icon currently-disabled-icon">
                  <IoMdMore />
                </div>
              </div>
            </div>
            <div className="search-form">
              <div className="search-icon">
                {searching ? (
                  <div
                    className="search-go-back-arrow"
                    onClick={() => goBack()}
                  >
                    <IoMdArrowRoundBack />
                  </div>
                ) : (
                  <label htmlFor="search">
                    <IoIosSearch />
                  </label>
                )}
              </div>

              <input
                id="search"
                type="text"
                className="search-input"
                onChange={(event) => onSearchInputChange(event)}
                ref={searchInputRef} // Attach ref to input
                placeholder="Search"
              />
            </div>
            <div className="filters">
              <div
                className={`filter ${
                  activeFilter === "all" ? "active-filter" : ""
                }`}
                onClick={() => handleFilterClick("all")}
              >
                All
              </div>
              <div
                className={`filter ${
                  activeFilter === "dms" ? "active-filter" : ""
                }`}
                onClick={() => handleFilterClick("dms")}
              >
                DMs
              </div>
              <div
                className={`filter ${
                  activeFilter === "groups" ? "active-filter" : ""
                }`}
                onClick={() => handleFilterClick("groups")}
              >
                Groups
              </div>
            </div>
          </div>

          {(directMessagesContacts.length > 0 || groups.length > 0) && (
            <div className="filler-container">
              <div className="horizontal-filler"></div>
              <div className="scrollbar-triangle">
                <BsFillTriangleFill />
              </div>
            </div>
          )}
          <div className="dms-and-group-chats-container">
            {/* <div> */}
            {/* {directMessagesContacts.length > 0 ||
              (groups.length > 0 && (
                <div className="filler-container">
                  <div className="horizontal-filler"></div>
                  <div className="scrollbar-triangle">
                    <BsFillTriangleFill />
                  </div>
                </div>
              ))} */}
            {directMessagesContacts.length > 0 || groups.length > 0 ? (
              <>
                {/* <div className="filler-container">
                  <div className="horizontal-filler"></div>
                  <div className="scrollbar-triangle">
                    <BsFillTriangleFill />
                  </div>
                </div> */}
                {/* <div className="dms-and-group-chats-container"> */}
                {searchedContacts.length <= 0 ? (
                  <>
                    {/* <div>groups</div> */}
                    {/* groups */}
                    {/* {groups} */}
                    {/* {console.log(groups)} */}
                    {groups.length > 0 &&
                      (activeFilter === "all" || activeFilter === "groups") &&
                      activeFilter !== "dms" && (
                        <>
                          {/* <div className="filler-container">
                            <div className="horizontal-filler"></div>
                            <div className="scrollbar-triangle">
                              <BsFillTriangleFill />
                            </div>
                          </div> */}
                          <div className="chat-type-indicator groups">
                            Groups
                          </div>
                          {/* {console.log("groups")}
                          {console.log(groups)} */}
                          <Chats contacts={groups} isGroup={true} />
                        </>
                      )}
                    {directMessagesContacts.length > 0 &&
                      (activeFilter === "all" || activeFilter === "dms") &&
                      activeFilter !== "groups" && (
                        <>
                          <div className="chat-type-indicator dms">
                            Direct Messages
                          </div>
                          {/* {console.log("directMessagesContacts")}
                          {console.log(directMessagesContacts)} */}
                          <Chats contacts={directMessagesContacts} />
                          {/* <div className="filler-container">
                            <div className="horizontal-filler"></div>
                            <div className="scrollbar-triangle-upside-down">
                              <BsFillTriangleFill />
                            </div>
                          </div> */}
                        </>
                      )}
                  </>
                ) : (
                  <>
                    {/* <div className="filler-container">
                      <div className="horizontal-filler"></div>
                      <div className="scrollbar-triangle">
                        <BsFillTriangleFill />
                      </div>
                    </div> */}
                    <Chats contacts={searchedContacts} />
                    {/* <Chats contacts={searchedGroups} isGroup={true} /> */}
                    {/* <div className="filler-container">
                      <div className="horizontal-filler"></div>
                      <div className="scrollbar-triangle-upside-down">
                        <BsFillTriangleFill />
                      </div>
                    </div> */}
                  </>
                )}
                {/* </div> */}
                {/* <div className="filler-container">
                  <div className="horizontal-filler"></div>
                  <div className="scrollbar-triangle-upside-down">
                    <BsFillTriangleFill />
                  </div>
                </div> */}
              </>
            ) : null}
            {/* {directMessagesContacts.length > 0 ||
              (groups.length > 0 && (
                <div className="filler-container">
                  <div className="horizontal-filler"></div>
                  <div className="scrollbar-triangle-upside-down">
                    <BsFillTriangleFill />
                  </div>
                </div>
              ))} */}
          </div>
          {/* {console.log("groups.length: " + groups.length)}
          {console.log(
            "directMessagesContacts.length: " + directMessagesContacts.length
          )} */}
          {(directMessagesContacts.length > 0 || groups.length > 0) && (
            <div className="filler-container">
              <div className="horizontal-filler"></div>
              <div className="scrollbar-triangle-upside-down">
                <BsFillTriangleFill />
              </div>
            </div>
          )}
        </>
      ) : activeIcon === "avatar" ? (
        <LeftSidebarProfile />
      ) : activeIcon === "friend-requests" ? (
        <FriendRequests />
      ) : (
        <div>Settings</div>
      )}
    </div>
  );
};

export default ChatList;
