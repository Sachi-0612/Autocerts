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

  // Template data from Canvas
  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreview, setTemplatePreview] = useState(null);
  const [templateWidth, setTemplateWidth] = useState(800);
  const [templateHeight, setTemplateHeight] = useState(600);
  const [textElements, setTextElements] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);

  const value = {
    recipients,
    setRecipients,
    certificates,
    setCertificates,
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    // Template data
    templateFile,
    setTemplateFile,
    templatePreview,
    setTemplatePreview,
    templateWidth,
    setTemplateWidth,
    templateHeight,
    setTemplateHeight,
    textElements,
    setTextElements,
    excelData,
    setExcelData,
    columns,
    setColumns,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};