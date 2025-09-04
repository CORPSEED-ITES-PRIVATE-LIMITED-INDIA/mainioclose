export const getOperationCompanyFormValues = (values) => {
  return {
    name: values?.companyName,
    companyGstType:values?.gstType,
    gstBusinessType:values?.businessType,
    gstNo:values?.gstNo,
    establishDate:values?.establishDate,
    industry: values?.industryId ,
    address: values?.address,
    city: values?.city,
    state:values?.state,
    country:values?.country,
    primaryPinCode:values?.primaryPinCode,
    contacts: [
      {
        title:values?.primaryTitle,
        name: values?.contactName,
        emails:values?.contactEmails,
        contactNo: values?.contactNo,
        whatsappNo: values?.contactWhatsappNo,
        companyId: 0,
        designation:values?.primaryDesignation,
        createdBy: values?.createdBy,
        updatedBy:values?.updatedBy ,
      },
    ],
    industries: values?.industrydataId,
    subIndustry: values?.subIndustryId,
    subSubIndustry: values?.subsubIndustryId,
    createdBy: values?.createdBy,
  };
};
