/* eslint-disable react-hooks/exhaustive-deps */
import { createContext } from "react";

import useHttp from "../../hooks/useHttp";

export const ReportsContext = createContext({
  onGetReports: (callback, errorCallBack, loader, notify) => null,
  onGetReport: (reportId, callback, errorCallBack, loader, notify) => null,
  onGetQuizReport: (quizId, callback, errorCallBack, loader, notify) => null,
});

export const ReportsContextProvider = ({ children }) => {
  const { sendRequest } = useHttp();

  const baseUrl = "/";

  const onGetReports = async (
    callback,
    errorCallBack = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + `report/`,
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

  const onGetReport = async (
    reportId,
    callback,
    errorCallBack = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + `report/${reportId}`,
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

  const onGetQuizReport = async (
    quizId,
    callback,
    errorCallBack = () => null,
    loader = true,
    notify = true
  ) => {
    sendRequest(
      {
        url: baseUrl + `report/quiz/${quizId}`,
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

  return (
    <ReportsContext.Provider
      value={{
        onGetReports,
        onGetReport,
        onGetQuizReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};
