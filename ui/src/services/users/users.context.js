/* eslint-disable react-hooks/exhaustive-deps */
import { createContext } from "react";

import useHttp from "../../hooks/useHttp";

export const UsersContext = createContext({
  onCreateUser: (data, callback, errorCallBack, loader, notify) => null,
  onEditUser: (userId, data, callback, errorCallBack, loader, notify) => null,
  onGetUsers: (callback, loader, notify) => null,
  onGetGroupedUsersByRoles: (callback, loader, notify) => null,
  onGetUser: (userId, callback, errorCallBack, loader, notify) => null,
  onDeleteUser: (userId, callback, errorCallBack, loader, notify) => null,
});

export const UsersContextProvider = ({ children }) => {
  const { sendRequest } = useHttp();

  const baseUrl = "/";

  const onCreateUser = async (
    data,
    callback,
    errorCallBack = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + `user/`,
        type: "POST",
        data: data,
      },
      {
        successCallback: async (result) => {
          callback(result);
        },
        errorCallback: errorCallBack,
      },
      loader,
      notify
    );
  };

  const onEditUser = async (
    userId,
    data,
    callback,
    errorCallBack = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + `user/` + userId,
        type: "PUT",
        data: data,
      },
      {
        successCallback: async (result) => {
          callback(result);
        },
        errorCallback: errorCallBack,
      },
      loader,
      notify
    );
  };

  const onGetUsers = async (
    callback = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + "user",
      },
      {
        successCallback: callback,
      },
      loader,
      notify
    );
  };

  const onGetGroupedUsersByRoles = async (
    callback = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + "user/grouped-by-roles",
      },
      {
        successCallback: callback,
      },
      loader,
      notify
    );
  };

  const onGetUser = async (
    userId,
    callback = () => null,
    errorCallBack = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + "user/" + userId,
      },
      {
        successCallback: callback,
        errorCallback: errorCallBack,
      },
      loader,
      notify
    );
  };

  const onDeleteUser = async (
    userId,
    callback = () => null,
    errorCallBack = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + "user/" + userId,
        type: "DELETE",
      },
      {
        successCallback: callback,
        errorCallback: errorCallBack,
      },
      loader,
      notify
    );
  };

  return (
    <UsersContext.Provider
      value={{
        onCreateUser,
        onDeleteUser,
        onEditUser,
        onGetUser,
        onGetUsers,
        onGetGroupedUsersByRoles,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
