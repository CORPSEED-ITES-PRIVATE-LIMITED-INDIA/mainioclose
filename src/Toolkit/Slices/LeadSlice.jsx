import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postQuery, postQueryWithoutDestructure } from "../../API/PostQuery";
import { putQuery } from "../../API/PutQuery";
import { getQuery } from "../../API/GetQuery";
import { deleteQuery } from "../../API/DeleteQuery";
import { deleteQueryWithData } from "../../API/DeleteQueryWithData";
import { putQueryWithoutDestructuring } from "../../API/PutRequestwithoutDestructure";

export const getAllLeads = createAsyncThunk("allLeadsData", async (data) => {
  const allLeads = await postQuery(
    `/leadService/api/v1/lead/getAllLead?page=${data?.page}&size=${data?.size}`,
    data
  );
  return allLeads?.data;
});

export const updateAutoAssignnee = createAsyncThunk(
  "auto-lead-assignee",
  async (data) => {
    const autoresponse = await putQuery(
      `/leadService/api/v1/lead/updateStatusAndAutoSame`,
      data
    );
    return autoresponse?.data;
  }
);
export const editLeadStatus = createAsyncThunk(
  "editLeadStatus",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/status/updateInLeadStatus`,
      data
    );
    return response.data;
  }
);

export const createRemakWithFile = createAsyncThunk(
  "createRemark",
  async (data) => {
    const response = await postQuery(`/leadService/api/v1/createRemarks`, data);
    return response.data;
  }
);

export const craeteProjectByLeadId = createAsyncThunk(
  "leadProjectByLeadId",
  async (id) => {
    const response = await postQuery(
      `/leadService/api/v1/project/createProjectV2?leadId=${id}`
    );
    return response.data;
  }
);

export const getAllLeadsWithLabelId = createAsyncThunk(
  "getAllLeadswithLabel",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/lead/getAllLeadNameAndId`
    );
    return response.data;
  }
);

export const updateHelper = createAsyncThunk("updateHelper", async (data) => {
  const response = await putQuery(
    `/leadService/api/v1/lead/updateHelper?userId=${data?.userId}&leadId=${data?.leadId}`
  );
  return response.data;
});

export const createLead = createAsyncThunk(
  "createLead",
  async (createStatus) => {
    const response = await postQuery(
      `/leadService/api/v1/status/CreateLeadStatus`,
      createStatus
    );
    return response.data;
  }
);

export const createLeadCateogry = createAsyncThunk(
  "createLeadCategory",
  async (leadCategory) => {
    const response = await postQuery(
      `/leadService/api/v1/category/createCategory`,
      leadCategory
    );
    return response.data;
  }
);

export const deleteLeadCategory = createAsyncThunk(
  "deleteLeadCategory",
  async (id) => {
    const response = await deleteQuery(
      `/leadService/api/v1/category/deleteCategory?categoryId=${id}`
    );
    return response.data;
  }
);

export const createLeads = createAsyncThunk("createLeads", async (data) => {
  const response = await postQuery(`/leadService/api/v1/lead/createLead`, data);
  return response.data;
});

export const getAllLeadUsers = createAsyncThunk("getAllUsers", async () => {
  const response = await getQuery(`/leadService/api/v1/users/getAllUser`);
  return response.data;
});

export const createLeadContacts = createAsyncThunk(
  "createLeadContact",
  async (createContact) => {
    const response = await postQuery(
      `/leadService/api/v1/client/createClient`,
      createContact
    );
    return response.data;
  }
);

export const updateLeadsContact = createAsyncThunk(
  "updateContacts",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/client/updateClientInfo`,
      data
    );
    return response.data;
  }
);
export const deleteLeadContact = createAsyncThunk(
  "deleteLeadContacts",
  async (data) => {
    const response = await deleteQuery(
      `/leadService/api/v1/client/deleteClient?leadId=${data?.leadid}&clientId=${data?.id}&currentUserId=${data?.userid}`
    );
    return response.data;
  }
);

export const createNewLeadTask = createAsyncThunk(
  "newLeadTask",
  async (taskData) => {
    const response = await postQuery(
      `/leadService/api/v1/task/createTask`,
      taskData
    );
    return response.data;
  }
);

export const updateLeadTask = createAsyncThunk(
  "updateLeadTasd",
  async (addNewTask) => {
    const response = await postQuery(
      `/leadService/api/v1/task/updateTaskData`,
      addNewTask
    );
    return response.data;
  }
);

export const getAllTaskStatus = createAsyncThunk("allTaskStatus", async () => {
  const response = await getQuery(`/leadService/api/v1/getAllTaskStatus`);
  return response.data;
});

export const getAllOppurtunities = createAsyncThunk(
  "getAllOppurtunities",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/leadOpportunity/getAllOpportunity`
    );
    return response.data;
  }
);

// export const getAllProductData = createAsyncThunk(
//   "getAllProductData",
//   async () => {
//     const response = await getQuery(
//       `/leadService/api/v1/product/getAllProducts`
//     )
//     return response.data
//   }
// )

export const getAllLeadUser = createAsyncThunk(
  "getAllLeadUserss",
  async (userid) => {
    const response = await getQuery(
      `/leadService/api/v1/users/getAllUserByHierarchy?userId=${userid}`
    );
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk("deleteProduct", async (data) => {
  const response = await putQuery(
    `/leadService/api/v1/lead/deleteProductInLead?leadId=${data?.leadid}&serviceId=${data?.serviceId}&userId=${data?.userid}`
  );
  return response.data;
});

export const deleteTask = createAsyncThunk("deleteTask", async (data) => {
  const response = await deleteQuery(
    `/leadService/api/v1/task/deleteTaskById?taskId=${data?.id}&currentUserId=${data?.userid}`
  );
  return response.data;
});

export const updateLeadProducts = createAsyncThunk(
  "updateLeadProduct",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/createProductInLead`,
      data
    );
    return response.data;
  }
);

export const getAllProductWithCattegory = createAsyncThunk(
  "getAllProductWithCattegory",
  async () => {
    const response = await getQuery(
      "/leadService/api/v1/category/getAllCategories"
    );
    return response.data;
  }
);

export const getAllStatusData = createAsyncThunk(
  "getAllStatusData",
  async () => {
    const response = await getQuery(`/leadService/api/v1/status/getAllStatus`);
    return response.data;
  }
);

export const editViewData = createAsyncThunk("editViewData", async (leadid) => {
  const response = await getQuery(
    `/leadService/api/v1/inbox/editView?leadId=${leadid}`
  );
  return response.data;
});

export const getCompanyDetailsByLeadId = createAsyncThunk(
  "getCompanyDetailsByLeadId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/company/checkCompanyExist?leadId=${id}`
    );
    return response.data;
  }
);

export const getCompanyUnitsById = createAsyncThunk(
  "getCompanyUnits",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllCompanyUnit?id=${id}`
    );
    return response.data;
  }
);

export const getCompanyDetailsByGst = createAsyncThunk(
  "getCompanyDetailsByGst",
  async (gst) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getCompanyByGst?gst=${gst}`
    );
    return response.data;
  }
);
export const getCompanyByUnitId = createAsyncThunk(
  "getCompanyByUnitId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getCompanyById?id=${id}`
    );
    return response.data;
  }
);

export const getAllContactDetails = createAsyncThunk(
  "getAllContactDetail",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/contact/getAllContact`
    );
    return response.data;
  }
);

export const getContactById = createAsyncThunk(`contactById`, async (id) => {
  const response = await getQuery(
    `/leadService/api/v1/contact/getContactById?id=${id}`
  );
  return response.data;
});

export const createCompanyForm = createAsyncThunk(
  "createCompanyForm",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/company/createCompanyForm`,
      data
    );
    return response.data;
  }
);

export const updateStatusById = createAsyncThunk(
  "updateStatebyid",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/company/updateCompanyStatus?status=${data?.status}&id=${data?.id}&currentUserId=${data?.userid}`
    );
    return response.data;
  }
);

export const deleteMultipleLeads = createAsyncThunk(
  "deleteMultipleLeads",
  async (data) => {
    const response = await deleteQueryWithData(
      `/leadService/api/v1/lead/deleteMultiLead`,
      data
    );
    return response.data;
  }
);

export const multiAssignedLeads = createAsyncThunk(
  "multiAssignedLeads",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/updateMultiLeadAssigne`,
      data
    );
    return response.data;
  }
);

export const handleViewHistory = createAsyncThunk(
  "viewHistory",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/viewHistoryCreate?userId=${data?.userid}&leadId=${data?.leadId}`
    );
    return response.data;
  }
);

export const updateAssigneeInLeadModule = createAsyncThunk(
  "updateAssigneeInLeadModule",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/updateAssignee?leadId=${data?.leadId}&userId=${data?.id}&updatedById=${data?.userid}`
    );
    return response.data;
  }
);

export const handleDeleteSingleLead = createAsyncThunk(
  "handleDeleteSingleLead",
  async (data) => {
    const response = await deleteQuery(
      `/leadService/api/v1/lead/deleteLead?leadId=${data?.id}&userId=${data?.userid}`
    );
    return response.data;
  }
);

export const handleLeadassignedToSamePerson = createAsyncThunk(
  "leadAssigndToSamePerson",
  async (id) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/leadAssignSamePerson?leadId=${id}`
    );
    return response.data;
  }
);

export const changeLeadStatus = createAsyncThunk(
  "changeLeadStatus",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/status/updateLeadStatus?leadId=${data?.leadid}&statusId=${data?.statusId}&currentUserId=${data?.userid}`
    );
    return response.data;
  }
);

export const updateOriginalNameInLeads = createAsyncThunk(
  "updateOriginalName",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/updateLeadOriginalName`,
      data
    );
    return response.data;
  }
);

export const changeLeadAssigneeLeads = createAsyncThunk(
  "changeLeadAssignee",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/updateAssignee?leadId=${data?.leadid}&userId=${data?.id}&updatedById=${data?.userid}`
    );
    return response.data;
  }
);

export const updateSingleLeadName = createAsyncThunk(
  "updateSingleLeadName",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/updateLeadName?leadName=${data?.updatedLeadName}&leadId=${data?.leadid}&userId=${data?.userid}`
    );
    return response.data;
  }
);

export const getAllTaskData = createAsyncThunk("getAllTaskData", async (id) => {
  const response = await getQuery(
    `/leadService/api/v1/task/getAllTaskByLead?leadId=${id}`
  );
  return response.data;
});

export const getSingleLeadDataByLeadID = createAsyncThunk(
  "getSingleLeadData",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/lead/getSingleLeadData?leadId=${data?.leadid}&currentUserId=${data?.userid}`
    );
    return response.data;
  }
);

export const createTicket = createAsyncThunk("createTicket", async (data) => {
  const response = await postQuery(`/leadService/api/v1/createTicket`, data);
  return response.data;
});

export const getLeadNotificationCount = createAsyncThunk(
  "getNotificationLead",
  async (userid) => {
    const response = await getQuery(
      `/leadService/api/v1/notification/getUnseenCount?userId=${userid}`
    );
    return response.data;
  }
);

export const searchLeads = createAsyncThunk("searchLeads", async (data) => {
  const response = await getQuery(
    `/leadService/api/v1/lead/searchLead?searchParam=${data.input}&userId=${data.id}`
  );
  return response.data;
});

export const updateLeadDescription = createAsyncThunk(
  "updateLeadDescription",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/updateLeadDescription?leadId=${data?.id}&desc=${data?.description}`
    );
    return response.data;
  }
);

export const getAllRemarkAndCommnts = createAsyncThunk(
  "getAllRemarks",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/getAllRemarks?leadId=${id}`
    );
    return response.data;
  }
);

export const addVendorsDetail = createAsyncThunk(
  "vendorsDetail",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/vendor/create-vendor-request?leadId=${data?.leadId}&userId=${data?.userId}`,
      data?.data
    );
    return response.data;
  }
);

export const getVendorDetailList = createAsyncThunk(
  "getVendorDetail",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/vendor/find-vendor-request-by-user-id?userId=${data?.userid}&leadId=${data?.leadId}`
    );
    return response.data;
  }
);

export const updateRemarks = createAsyncThunk("updateRemarks", async (data) => {
  const response = await putQuery(`/leadService/api/v1/updateRemark`, data);
  return response.data;
});

export const deleteRemarks = createAsyncThunk("deleteRemarks", async (data) => {
  const response = await deleteQuery(
    `/leadService/api/v1/deleteRemark?remarkId=${data?.remarkId}&currentUser=${data?.userid}&leadId=${data?.leadid}`
  );
  return response.data;
});

export const updateVendorStatus = createAsyncThunk(
  "updateVendorStatus",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/vendor/update-vendor-request?vendorId=${data?.vendorId}&userId=${data?.userId}&leadId=${data?.leadId}`,
      data?.data
    );
    return response.data;
  }
);

export const sendVendorsProposal = createAsyncThunk(
  "vendorsProposal",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/vendor/send-quotation?leadId=${data?.leadId}&userId=${data?.userId}&vendorRequestId=${data?.vendorRequestId}`,
      data?.data
    );
    return response.data;
  }
);

export const getAllVendorsRequest = createAsyncThunk(
  "getAllVendorsRequest",
  async ({ id, page, size }) => {
    const response = await getQuery(
      `/leadService/api/v1/vendor/find-all-vendor-request?userId=${id}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getvendorHistoryByLeadId = createAsyncThunk(
  "getvendorHistoryByLeadId",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/vendor/find-update-request-history?userId=${data?.userId}&leadId=${data?.leadId}&vendorRequestId=${data?.vendorRequestId}`
    );
    return response.data;
  }
);

export const changeProcurementAssignee = createAsyncThunk(
  "changeProcurementAssignee",
  async (data) => {
    const response = await putQueryWithoutDestructuring(
      `/leadService/api/v1/vendor/edit-vendor-details-request?updatedById=${data?.updatedById}&assigneeToId=${data?.assigneeToId}`,
      data?.data
    );
    return response.data;
  }
);

export const getAllLeadCount = createAsyncThunk(
  "getAllLeadCount",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/lead/getAllLeadCount`,
      data
    );
    return response.data;
  }
);

export const getAllChildLeads = createAsyncThunk(
  "getAllChildLeads",
  async (name) => {
    const response = await getQuery(
      `/leadService/api/v1/urls/getSlugChildByName?name=${name}`
    );
    return response.data;
  }
);

export const addLeadChild = createAsyncThunk("addLeadChild", async (data) => {
  const response = await putQuery(
    `/leadService/api/v1/lead/addChildLead`,
    data
  );
  return response.data;
});

export const allVendorsCategory = createAsyncThunk(
  "allVendorsCatagory",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/vendor/fetch-all-vendor-category?page=1&size=200`
    );
    return response.data;
  }
);

export const getSingleCategoryDataById = createAsyncThunk(
  "getSingleCatagoryDataById",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/vendor/fetch-vendor-category?categoryId=${id}`
    );
    return response.data;
  }
);

export const updateProcurementUsers = createAsyncThunk(
  "updateProcurementUsers",
  async (data) => {
    const response = await postQueryWithoutDestructure(
      `/leadService/api/v1/vendor/map-assignee-to-sub-category?subCategoryId=${data?.subCategoryId}`,
      data?.data
    );
    return response.data;
  }
);

export const createVendorsCategory = createAsyncThunk(
  "createVendorsCategory",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/vendor/create-vendor-category?userId=${data?.userId}&categoryName=${data?.categoryName}`
    );
    return response.data;
  }
);

export const createVendorsSubCategory = createAsyncThunk(
  "createVendorsCategory",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/vendor/create-vendor-sub-category?userId=${data?.userId}`,
      data?.data
    );
    return response.data;
  }
);

export const updateVendorsCategory = createAsyncThunk(
  "updateVendorsCategory",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/vendor/update-vendor-category?userId=${data?.userId}&categoryId=${data?.categoryId}&newCategoryName=${data?.newCategoryName}`
    );
    return response.data;
  }
);

export const updateVendorsSubCategory = createAsyncThunk(
  "updateVendorsSubCategory",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/vendor/update-vendor-sub-category?userId=${data?.userId}&categoryId=${data?.categoryId}&subCategoryId=${data?.subCategoryId}&newSubCategoryName=${data?.subCategoryName}&vendorCategoryResearchTat=${data?.vendorCategoryResearchTat}&vendorCompletionTat=${data?.vendorCompletionTat}`
    );
    return response.data;
  }
);

export const vendorRequestListForSalesUser = createAsyncThunk(
  "updateVendorsSubCategory",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/vendor/find-all-vendor-request-of-user?userId=${data?.userid}&page=${data?.page}&size=${data?.size}`
    );
    return response.data;
  }
);

export const vendorsRequestView = createAsyncThunk(
  "vendorsRequestView",
  async ({ id, userid }) => {
    const response = await putQuery(
      `/leadService/api/v1/vendor/vendor-request-view?id=${id}&userId=${userid}`
    );
    return response.data;
  }
);

export const createEstimate = createAsyncThunk(
  "createEstimate",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/leadEstimate/createEstimate`,
      data
    );
    return response.data;
  }
);

export const cancelVendorsRequest = createAsyncThunk(
  "cancelVendorsRequest",
  async ({ vendorRequestId, userId, cancelReason }) => {
    const response = await deleteQuery(
      `/leadService/api/v1/vendor/cancel-vendor-request?vendorRequestId=${vendorRequestId}&userId=${userId}&cancelReason=${cancelReason}`
    );
    return response.data;
  }
);

export const handleFlagByQualityTeam = createAsyncThunk(
  "handleFlagByQualityTeam",
  async ({ currentUerId, leadId, isMarked }) => {
    const response = await putQuery(
      `/leadService/api/v1/lead/addReopenByQuality?currentUerId=${currentUerId}&leadId=${leadId}&isMarked=${isMarked}`
    );
    return response.data;
  }
);

export const getAllLeadsForExport = createAsyncThunk(
  "getAllLeadsForExport",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/lead/getAllLeadForImport`,
      data
    );
    return response.data;
  }
);

export const searchInVendorsList = createAsyncThunk(
  `searchInVendorsList`,
  async ({ userId, searchInput }) => {
    const response = await getQuery(
      `/leadService/api/v1/vendor/vendor-search?userId=${userId}&searchInput=${searchInput}`
    );
    return response.data;
  }
);

export const vendorsFilteration = createAsyncThunk(
  "vendorsFilteration",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/vendor/vendor-report`,
      data
    );
    return response.data;
  }
);

export const getAllVendorsStatus = createAsyncThunk(
  "getAllVendorsStatus",
  async () => {
    const response = await getQuery(`/leadService/api/v1/vendor-status-all`);
    return response.data;
  }
);

export const getDocumentsByLeadName = createAsyncThunk(
  "getDocumentsByLeadName",
  async (name) => {
    const response = await getQuery(
      `/leadService/api/v1/complianceDocumnets/getComplianceDocByName?name=${name}`
    );
    return response.data;
  }
);

export const leadProposalSentRequest = createAsyncThunk(
  "leadProposalSentRequest",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/proposal/createProposal`,
      data
    );
    return response.data;
  }
);

export const getAllProposalByUserId = createAsyncThunk(
  "getAllProposalByUserId",
  async ({ id, page, size }) => {
    const response = await getQuery(
      `/leadService/api/v1/proposal/getAllProposalByUserId?userId=${id}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllEstimateByUserId = createAsyncThunk(
  "getAllEstimateByUserId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/leadEstimate/getEstimateByUserId?userId=${id}`
    );
    return response.data;
  }
);

export const getEstimateByLeadId = createAsyncThunk(
  "getEstimateByLeadId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/leadEstimate/getEstimateByLeadId?leadId=${id}`
    );
    return response.data;
  }
);

export const getProposalByLeadId = createAsyncThunk(
  "getProposalByLeadId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/proposal/getProposalById?id=${id}`
    );
    return response.data;
  }
);

export const getAllPropsalListCount = createAsyncThunk(
  "getAllPropsalListCount",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/proposal/getAllProposalByUserIdCount?userId=${id}`
    );
    return response.data;
  }
);

export const editLeadEstimate = createAsyncThunk(
  "editEstimate",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/leadEstimate/editEstimateInvoice`,
      data
    );
    return response.data;
  }
);

export const editLeadPropposal = createAsyncThunk(
  "editPropposal",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/proposal/editProposal`,
      data
    );
    return response.data;
  }
);

export const importLeadsSheet = createAsyncThunk(
  "importLeadsSheet",
  async (url) => {
    const response = await postQuery(
      `/leadService/api/v1/import-csv-from-s3?s3Url=${url}`
    );
    return response.data;
  }
);

export const searchCompaniesForEstimate = createAsyncThunk(
  "searchCompaniesForEstimate",
  async ({ searchNameAndGSt, userId, fieldSearch }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/companySearchByGstAndContactDetails?searchNameAndGSt=${searchNameAndGSt}&userId=${userId}&fieldSearch=${fieldSearch}`
    );
    return response.data;
  }
);

export const searchCompaniesForCompany = createAsyncThunk(
  "searchCompaniesForCompany",
  async ({ searchText, userId, searchField }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/companySearchByGstAndContactDetailsNew?searchNameAndGSt=${searchText}&userId=${userId}&fieldSearch=${searchField}`
    );
    return response.data;
  }
);

export const getAllNewCompanies = createAsyncThunk(
  "getAllNewCompanies",
  async ({ userId, filterUserId, type, page, size }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getAllParentCompanyV2?userId=${userId}&filterUserId=${filterUserId}&type=${type}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getGstDetailsByCompanyId = createAsyncThunk(
  "getGstDetailsByCompanyId",
  async (companyId) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getGstAndStateByCompanyId?companyId=${companyId}`
    );
    return response.data;
  }
);

export const getCompanyUnitsByStateAndCompanyId = createAsyncThunk(
  "getCompanyUnitsByStateAndCompanyId",
  async ({ companyId, state }) => {
    const response = await getQuery(
      `/leadService/api/v1/company/getCompanyByGstAndCompanyId?companyId=${companyId}&state=${state}`
    );
    return response.data;
  }
);

export const LeadSlice = createSlice({
  name: "lead",
  initialState: {
    allLeads: [],
    leadresponseStatus: "",
    leadsLoading: "",
    leadsError: false,
    autoLeadUpadte: "",
    autoLeadLoading: false,
    autoLeadError: false,
    remarkLoading: "",
    allLeadsWithLabel: [],
    allLeadUsers: [],
    loading: "",
    allTaskStatusData: [],
    allOportunities: [],
    // allProductData: [],
    getAllLeadUserData: [],
    categoryData: [],
    getAllStatus: [],
    companyDetailsById: {},
    companyUnits: [],
    companyDetailsByGst: [],
    companyDetailByUnitId: {},
    allContactList: [],
    contactDetail: {},
    getSingleLeadTask: [],
    singleLeadResponseData: {},
    allProductsList: [],
    clientsContact: [],
    notificationCount: 0,
    remarkData: [],
    navigateLeadId: null,
    vendorsList: [],
    allVendorsRequestList: [],
    singleVendorHistoryList: [],
    historyLoading: "",
    totalCount: 0,
    totalVendorRequestCount: 0,
    leadChildData: [],
    vendorsCategoryList: [],
    singleCategoryDetail: {},
    requestListForVendors: [],
    allLeadsForExport: [],
    vendorsExportData: [],
    vendorsStatus: [],
    complianceDocumentList: [],
    proposalList: [],
    proposalLoading: "",
    estimateList: [],
    estimateLoading: "",
    estimateDetail: {},
    estimateDetailLoading: "",
    proposalCount: 0,
    vendorFilterationLoading: "",
    leadDetailLoading: "",
    proposalDetails: {},
    companiesListForEstimate: [],
    seachCompniesList: [],
    newCompaniesList: [],
    companyGstDetailList: [],
    companyUnitList: [],
  },
  reducers: {
    handleLoadingState: (state, action) => {
      state.loading = action.payload;
    },
    handleVendorsLoading: (state, action) => {
      state.vendorFilterationLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllLeads.pending, (state, action) => {
      state.leadresponseStatus = "pending";
    });
    builder.addCase(getAllLeads.fulfilled, (state, action) => {
      state.allLeads = action.payload;
      state.leadresponseStatus = "success";
    });
    builder.addCase(getAllLeads.rejected, (state, action) => {
      state.leadresponseStatus = "rejected";
    });

    builder.addCase(updateAutoAssignnee.pending, (state, action) => {
      state.autoLeadLoading = true;
      state.autoLeadError = false;
    });
    builder.addCase(updateAutoAssignnee.fulfilled, (state, action) => {
      state.autoLeadUpadte = action.payload;
      state.autoLeadLoading = false;
      state.autoLeadError = false;
    });
    builder.addCase(updateAutoAssignnee.rejected, (state, action) => {
      state.autoLeadError = true;
      state.autoLeadLoading = false;
    });

    builder.addCase(getAllLeadsWithLabelId.pending, (state, action) => {
      state.remarkLoading = "pending";
    });
    builder.addCase(getAllLeadsWithLabelId.fulfilled, (state, action) => {
      state.remarkLoading = "success";
      state.allLeadsWithLabel = action.payload;
    });
    builder.addCase(getAllLeadsWithLabelId.rejected, (state, action) => {
      state.remarkLoading = "rejected";
    });

    builder.addCase(getAllLeadUsers.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLeadUsers.fulfilled, (state, action) => {
      state.loading = "success";
      state.allLeadUsers = action.payload;
    });
    builder.addCase(getAllLeadUsers.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllTaskStatus.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllTaskStatus.fulfilled, (state, action) => {
      state.loading = "success";
      state.allTaskStatusData = action.payload;
    });
    builder.addCase(getAllTaskStatus.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllOppurtunities.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllOppurtunities.fulfilled, (state, action) => {
      state.loading = "success";
      state.allOportunities = action.payload;
    });
    builder.addCase(getAllOppurtunities.rejected, (state, action) => {
      state.loading = "rejected";
    });
    // builder.addCase(getAllProductData.pending, (state, action) => {
    //   state.loading = "pending"
    // })
    // builder.addCase(getAllProductData.fulfilled, (state, action) => {
    //   state.loading = "success"
    //   state.allProductData = action.payload
    // })
    // builder.addCase(getAllProductData.rejected, (state, action) => {
    //   state.loading = "rejected"
    // })

    builder.addCase(getAllLeadUser.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLeadUser.fulfilled, (state, action) => {
      state.loading = "success";
      state.getAllLeadUserData = action.payload;
    });
    builder.addCase(getAllLeadUser.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllProductWithCattegory.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProductWithCattegory.fulfilled, (state, action) => {
      state.loading = "success";
      state.categoryData = action.payload;
    });
    builder.addCase(getAllProductWithCattegory.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllStatusData.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllStatusData.fulfilled, (state, action) => {
      state.loading = "success";
      state.getAllStatus = action.payload;
    });
    builder.addCase(getAllStatusData.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getCompanyDetailsByLeadId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyDetailsByLeadId.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyDetailsById = action.payload;
    });
    builder.addCase(getCompanyDetailsByLeadId.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getCompanyUnitsById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyUnitsById.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyUnits = action.payload;
    });
    builder.addCase(getCompanyUnitsById.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getCompanyDetailsByGst.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyDetailsByGst.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyDetailsByGst = action.payload;
    });
    builder.addCase(getCompanyDetailsByGst.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getCompanyByUnitId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyByUnitId.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyDetailByUnitId = action.payload;
    });
    builder.addCase(getCompanyByUnitId.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllContactDetails.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllContactDetails.fulfilled, (state, action) => {
      state.loading = "success";
      state.allContactList = action.payload;
    });
    builder.addCase(getAllContactDetails.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getContactById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getContactById.fulfilled, (state, action) => {
      state.loading = "success";
      state.contactDetail = action.payload;
    });
    builder.addCase(getContactById.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllTaskData.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllTaskData.fulfilled, (state, action) => {
      state.loading = "success";
      state.getSingleLeadTask = action.payload;
    });
    builder.addCase(getAllTaskData.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getSingleLeadDataByLeadID.pending, (state, action) => {
      state.leadDetailLoading = "pending";
    });
    builder.addCase(getSingleLeadDataByLeadID.fulfilled, (state, action) => {
      state.leadDetailLoading = "success";
      state.singleLeadResponseData = action.payload;
      state.allProductsList = action?.payload?.serviceDetails;
      state.clientsContact = action?.payload?.clients?.reverse();
    });
    builder.addCase(getSingleLeadDataByLeadID.rejected, (state, action) => {
      state.leadDetailLoading = "rejected";
    });

    builder.addCase(getLeadNotificationCount.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getLeadNotificationCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.notificationCount = action.payload;
    });
    builder.addCase(getLeadNotificationCount.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(searchLeads.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(searchLeads.fulfilled, (state, action) => {
      state.loading = "success";
      state.allLeads = action.payload;
    });
    builder.addCase(searchLeads.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllRemarkAndCommnts.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllRemarkAndCommnts.fulfilled, (state, action) => {
      state.loading = "success";
      state.remarkData = action?.payload?.reverse();
    });
    builder.addCase(getAllRemarkAndCommnts.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getVendorDetailList.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getVendorDetailList.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorsList = action?.payload;
    });
    builder.addCase(getVendorDetailList.rejected, (state, action) => {
      state.loading = "rejected";
      state.vendorsList = [];
    });

    builder.addCase(getAllVendorsRequest.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendorsRequest.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalVendorRequestCount = action?.payload?.totalItems;
      state.allVendorsRequestList = action?.payload?.vendorsRequests;
    });
    builder.addCase(getAllVendorsRequest.rejected, (state, action) => {
      state.loading = "rejected";
      state.totalVendorRequestCount = 0;
      state.allVendorsRequestList = [];
    });

    builder.addCase(getvendorHistoryByLeadId.pending, (state, action) => {
      state.historyLoading = "pending";
    });
    builder.addCase(getvendorHistoryByLeadId.fulfilled, (state, action) => {
      state.historyLoading = "success";
      state.singleVendorHistoryList = action?.payload;
    });
    builder.addCase(getvendorHistoryByLeadId.rejected, (state, action) => {
      state.historyLoading = "rejected";
    });

    builder.addCase(getAllLeadCount.pending, (state, action) => {
      state.historyLoading = "pending";
    });
    builder.addCase(getAllLeadCount.fulfilled, (state, action) => {
      state.historyLoading = "success";
      state.totalCount = action?.payload;
    });
    builder.addCase(getAllLeadCount.rejected, (state, action) => {
      state.historyLoading = "rejected";
    });

    builder.addCase(getAllChildLeads.pending, (state, action) => {
      state.historyLoading = "pending";
    });
    builder.addCase(getAllChildLeads.fulfilled, (state, action) => {
      state.historyLoading = "success";
      state.leadChildData = action?.payload;
    });
    builder.addCase(getAllChildLeads.rejected, (state, action) => {
      state.historyLoading = "rejected";
    });

    builder.addCase(allVendorsCategory.pending, (state, action) => {
      state.historyLoading = "pending";
    });
    builder.addCase(allVendorsCategory.fulfilled, (state, action) => {
      state.historyLoading = "success";
      state.vendorsCategoryList = action?.payload;
    });
    builder.addCase(allVendorsCategory.rejected, (state, action) => {
      state.historyLoading = "rejected";
      state.vendorsCategoryList = [];
    });

    builder.addCase(getSingleCategoryDataById.pending, (state, action) => {
      state.historyLoading = "pending";
    });
    builder.addCase(getSingleCategoryDataById.fulfilled, (state, action) => {
      state.historyLoading = "success";
      state.singleCategoryDetail = action?.payload;
    });
    builder.addCase(getSingleCategoryDataById.rejected, (state, action) => {
      state.historyLoading = "rejected";
      state.singleCategoryDetail = {};
    });

    builder.addCase(vendorRequestListForSalesUser.pending, (state, action) => {
      state.historyLoading = "pending";
    });
    builder.addCase(
      vendorRequestListForSalesUser.fulfilled,
      (state, action) => {
        state.historyLoading = "success";
        state.requestListForVendors = action?.payload;
      }
    );
    builder.addCase(vendorRequestListForSalesUser.rejected, (state, action) => {
      state.historyLoading = "rejected";
      state.requestListForVendors = [];
    });

    builder.addCase(getAllLeadsForExport.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllLeadsForExport.fulfilled, (state, action) => {
      state.loading = "success";
      state.allLeadsForExport = action?.payload;
    });
    builder.addCase(getAllLeadsForExport.rejected, (state, action) => {
      state.loading = "rejected";
      state.allLeadsForExport = [];
    });

    builder.addCase(searchInVendorsList.pending, (state, action) => {});
    builder.addCase(searchInVendorsList.fulfilled, (state, action) => {
      state.totalVendorRequestCount = action?.payload?.totalItems;
      state.allVendorsRequestList = action?.payload?.vendorsRequests;
    });
    builder.addCase(searchInVendorsList.rejected, (state, action) => {
      state.allVendorsRequestList = [];
    });

    builder.addCase(vendorsFilteration.pending, (state, action) => {
      state.vendorFilterationLoading = "pending";
    });
    builder.addCase(vendorsFilteration.fulfilled, (state, action) => {
      state.vendorFilterationLoading = "success";
      state.vendorsExportData = action?.payload?.vendorReports;
    });
    builder.addCase(vendorsFilteration.rejected, (state, action) => {
      state.vendorFilterationLoading = "rejected";
      state.vendorsExportData = [];
    });

    builder.addCase(getAllVendorsStatus.pending, (state, action) => {});
    builder.addCase(getAllVendorsStatus.fulfilled, (state, action) => {
      state.vendorsStatus = action?.payload;
    });
    builder.addCase(getAllVendorsStatus.rejected, (state, action) => {
      state.vendorsStatus = [];
    });

    builder.addCase(getDocumentsByLeadName.pending, (state, action) => {});
    builder.addCase(getDocumentsByLeadName.fulfilled, (state, action) => {
      state.complianceDocumentList = action?.payload?.productDoc;
    });
    builder.addCase(getDocumentsByLeadName.rejected, (state, action) => {
      state.complianceDocumentList = [];
    });

    builder.addCase(getAllProposalByUserId.pending, (state, action) => {
      state.proposalLoading = "pending";
    });
    builder.addCase(getAllProposalByUserId.fulfilled, (state, action) => {
      state.proposalLoading = "success";
      state.proposalList = action?.payload;
    });
    builder.addCase(getAllProposalByUserId.rejected, (state, action) => {
      state.proposalList = [];
      state.proposalLoading = "rejected";
    });

    builder.addCase(getAllEstimateByUserId.pending, (state, action) => {
      state.estimateLoading = "pending";
    });
    builder.addCase(getAllEstimateByUserId.fulfilled, (state, action) => {
      state.estimateLoading = "success";
      state.estimateList = action?.payload;
    });
    builder.addCase(getAllEstimateByUserId.rejected, (state, action) => {
      state.estimateList = [];
      state.estimateLoading = "rejected";
    });

    builder.addCase(getEstimateByLeadId.pending, (state, action) => {
      state.estimateDetailLoading = "pending";
    });
    builder.addCase(getEstimateByLeadId.fulfilled, (state, action) => {
      state.estimateDetailLoading = "success";
      state.estimateDetail = action?.payload;
    });
    builder.addCase(getEstimateByLeadId.rejected, (state, action) => {
      state.estimateDetail = {};
      state.estimateDetailLoading = "rejected";
    });

    builder.addCase(getAllPropsalListCount.pending, (state, action) => {
      state.proposalLoading = "pending";
    });
    builder.addCase(getAllPropsalListCount.fulfilled, (state, action) => {
      state.proposalLoading = "success";
      state.proposalCount = action?.payload;
    });
    builder.addCase(getAllPropsalListCount.rejected, (state, action) => {
      state.proposalCount = 0;
      state.proposalLoading = "rejected";
    });

    builder.addCase(getProposalByLeadId.pending, (state, action) => {
      state.proposalLoading = "pending";
    });
    builder.addCase(getProposalByLeadId.fulfilled, (state, action) => {
      state.proposalLoading = "success";
      state.proposalDetails = action?.payload;
    });
    builder.addCase(getProposalByLeadId.rejected, (state, action) => {
      state.proposalLoading = "rejected";
      state.proposalDetails = {};
    });

    builder.addCase(searchCompaniesForEstimate.pending, (state, action) => {});
    builder.addCase(searchCompaniesForEstimate.fulfilled, (state, action) => {
      state.companiesListForEstimate = action?.payload;
    });
    builder.addCase(searchCompaniesForEstimate.rejected, (state, action) => {
      state.companiesListForEstimate = [];
    });

    builder.addCase(searchCompaniesForCompany.pending, (state, action) => {});
    builder.addCase(searchCompaniesForCompany.fulfilled, (state, action) => {
      state.seachCompniesList = action?.payload;
    });
    builder.addCase(searchCompaniesForCompany.rejected, (state, action) => {
      state.seachCompniesList = [];
    });

    builder.addCase(getAllNewCompanies.pending, (state, action) => {});
    builder.addCase(getAllNewCompanies.fulfilled, (state, action) => {
      state.newCompaniesList = action?.payload;
    });
    builder.addCase(getAllNewCompanies.rejected, (state, action) => {
      state.newCompaniesList = [];
    });

    builder.addCase(getGstDetailsByCompanyId.pending, (state, action) => {});
    builder.addCase(getGstDetailsByCompanyId.fulfilled, (state, action) => {
      state.companyGstDetailList = action?.payload;
    });
    builder.addCase(getGstDetailsByCompanyId.rejected, (state, action) => {
      state.companyGstDetailList = [];
    });

    builder.addCase(
      getCompanyUnitsByStateAndCompanyId.pending,
      (state, action) => {}
    );
    builder.addCase(
      getCompanyUnitsByStateAndCompanyId.fulfilled,
      (state, action) => {
        state.companyUnitList = action?.payload;
      }
    );
    builder.addCase(
      getCompanyUnitsByStateAndCompanyId.rejected,
      (state, action) => {
        state.companyUnitList = [];
      }
    );
  },
});
export const {
  handleLoadingState,
  handleNextPagination,
  handlePrevPagination,
  handlePagination,
  handleVendorsLoading,
} = LeadSlice.actions;
export default LeadSlice.reducer;
