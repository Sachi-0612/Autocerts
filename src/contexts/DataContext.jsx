import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [recipients, setRecipients] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [emailSubject, setEmailSubject] = useState("Your Certificate is ready");
  const [emailBody, setEmailBody] = useState(
    "Dear {name},\nPlease find your certificate attached.\nBest regards"
  );

  const value = {
    recipients,
    setRecipients,
    certificates,
    setCertificates,
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};