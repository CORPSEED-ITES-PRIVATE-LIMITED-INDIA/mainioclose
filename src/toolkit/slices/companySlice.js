import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getAllNewCompanies = createAsyncThunk(
  "getAllNewCompanies",
  async ({ userId, status, page, size }) => {
    const response = await api.get(
      `/leadService/api/companies/getCompany?assigneeId=${userId}&onboardingStatus=${status}&page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getAllNewCompaniesCount = createAsyncThunk(
  "getAllNewCompaniesCount",
  async ({ userId, status }) => {
    const response = await api.get(
      `/leadService/api/companies/getCompanyCount?assigneeId=${userId}&onboardingStatus=${status}`,
    );
    return response.data;
  },
);

export const searchCompanies = createAsyncThunk(
  "getHandleSearchCompanies",
  async ({ userId, searchNameAndGSt }) => {
    const response = await api.get(
      `/leadService/api/companies/search?keyword=${searchNameAndGSt}&userId=${userId}`,
    );
    return response.data;
  },
);

export const getAllGstTypeByCompanyTypeId = createAsyncThunk(
  "getAllGstTypeById",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getGstTypeById?id=${id}`,
    );
    return response.data;
  },
);

export const getBusinessTypeByGstTypeId = createAsyncThunk(
  "getBusinessTypeByGstTypeId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getPriceTypeByBussinessTypeId?id=${id}`,
    );
    return response.data;
  },
);

export const getAllCompanyType = createAsyncThunk(
  "getAllCompanyType",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCompanyType`,
    );
    return response.data;
  },
);

export const getGstListByCompanyId = createAsyncThunk(
  "getGstListByCompanyId",
  async (companyId) => {
    const response = await api.get(
      `/leadService/api/companies/${companyId}/units`,
    );
    return response.data;
  },
);

export const addGstInCompany = createAsyncThunk(
  "addGstInCompany",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/company/addGstUnitInCompany`,
      data,
    );
    return response.data;
  },
);

export const getCompanyUnitsByStateAndCompanyId = createAsyncThunk(
  "getCompanyUnitsByStateAndCompanyId",
  async ({ companyId, stateName }) => {
    const response = await api.get(
      `/leadService/api/v1/company/getCompanyByGstAndCompanyId?companyId=${companyId}&state=${stateName}`,
    );
    return response.data;
  },
);

export const getLeadsByCompanyId = createAsyncThunk(
  "getLeadsByCompanyId",
  async (id) => {
    const getCompanyLeadsData = await api.get(
      `/leadService/api/v1/company/getAllLeadByCompany?companyId=${id}`,
    );
    return getCompanyLeadsData?.data;
  },
);

export const getCompanyProjectAction = createAsyncThunk(
  "get-company-project-action",
  async (id) => {
    const getCompanyProjectData = await api.get(
      `/leadService/api/v1/company/getAllProjectByCompany?companyId=${id}`,
    );
    return getCompanyProjectData?.data;
  },
);

export const getCompanyByUnitId = createAsyncThunk(
  "getCompanyByUnitId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/company/getCompanyById?id=${id}`,
    );
    return response.data;
  },
);

export const getAllServingCompanyList = createAsyncThunk(
  "getAllServingCompanyList",
  async ({ userId, page, size, status }) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllServingCompany?userId=${userId}&page=${page}&size=${size}&status=${status}`,
    );
    return response.data;
  },
);

export const createNewCompanyInLeads = createAsyncThunk(
  "createNewCompanyInLeads",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/createCompanyNew`,
      data,
    );
    return response.data;
  },
);

export const getAllCompanyByStatus = createAsyncThunk(
  "getCompaniesByStatus",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllCompanyFormByStatus?status=${data.status}&userId=${data?.id}&page=${data?.page}&size=${data?.size}`,
    );
    return response.data;
  },
);

export const searchCompanyForm = createAsyncThunk(
  "searchCompanyForm",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/company/searchCompanyByStatus?searchNameAndGSt=${data?.inputText}&userId=${data?.userId}&status=${data?.status}&page=${data?.page}&size=${data?.size}`,
    );
    return response.data;
  },
);

export const searchCompaniesForCompany = createAsyncThunk(
  "searchCompaniesForCompany",
  async ({ searchText, userId, searchField }) => {
    const response = await api.get(
      `/leadService/api/v1/company/companySearchByGstAndContactDetailsNew?searchNameAndGSt=${searchText}&userId=${userId}&fieldSearch=${searchField}`,
    );
    return response.data;
  },
);

export const getAllCompanyUnits = createAsyncThunk(
  "getAllCompanyUnits",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllCompanyUnit?id=${id}`,
    );
    return response.data;
  },
);

export const getAllContactListByCompanyId = createAsyncThunk(
  "getAllContactListByCompanyId",
  async (companyId) => {
    const response = await api.get(
      `/leadService/api/v1/company/getContactByCompanyId?companyId=${companyId}`,
    );
    return response.data;
  },
);

export const updateCompanyAddress = createAsyncThunk(
  "updateCompanyAddress",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/updateCompanyAddress`,
      data,
    );
    return response.data;
  },
);

export const getHistoryByCompanyId = createAsyncThunk(
  "getCompanyByHistoryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/companyHistory/getAllCompanyHistory?companyId=${id}`,
    );
    return response.data;
  },
);

export const convertServingCompanyToCompany = createAsyncThunk(
  "convertServingCompanyToCompany",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/importServingIntoCompany`,
      data,
    );
    return response.data;
  },
);

export const getCompanyExistData = createAsyncThunk(
  "getCompanyExistData",
  async (leadId) => {
    const response = await api.get(
      `/leadService/api/v1/company/searchCompanyByLeadId?leadId=${leadId}`,
    );
    return response.data;
  },
);

export const createCompanyForm = createAsyncThunk(
  "createCompanyForm",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/company/createCompanyForm`,
      data,
    );
    return response.data;
  },
);

export const updateCompanyForm = createAsyncThunk(
  "updateCompanyForm",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/company/updateCompanyForm`,
      data,
    );
    return response.data;
  },
);

export const getFormComment = createAsyncThunk("getFormComment", async (id) => {
  const response = await api.get(
    `/leadService/api/v1/company/getCompanyComment?companyFormId=${id}`,
  );
  return response.data;
});

export const updateStatusById = createAsyncThunk(
  "updateStatebyid",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/company/updateCompanyStatus?status=${data?.status}&id=${data?.id}&currentUserId=${data?.userid}`,
    );
    return response.data;
  },
);

export const addCommentCompanyForm = createAsyncThunk(
  "addCommentCompanyForm",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/company/addComment?companyFormId=${data?.id}&comment=${data?.comment}`,
    );
    return response.data;
  },
);

export const getCompanyDetailsById = createAsyncThunk(
  "getCompanyDetailsById",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/company/getSingleCompanyForm?id=${id}`,
    );
    return response.data;
  },
);

export const updateMultiCompanyAssignee = createAsyncThunk(
  "updateMultiAssignee",
  async (data, { rejectWithValue }) => {
    try {
      const response = api.put(
        `/leadService/api/v1/company/updateMultiCompanyAssignee`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  },
);

export const addBasicCompanyDetail = createAsyncThunk(
  "addBasicCompanyDetail",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/leadService/api/companies/basic-company`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  },
);

export const getBasicCompanyDetails = createAsyncThunk(
  "getBasicCompanyDetails",
  async ({ leadId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/leadService/api/companies/by-lead/${leadId}?userId=${userId}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  },
);

export const createCompanyInAccounts = createAsyncThunk(
  "createCompanyInAccounts",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/basic-company`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const createBasicUnitByCompanyId = createAsyncThunk(
  "createBasicUnitByCompanyId",
  async ({ companyId, updatedBy, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/leadService/api/companies/${companyId}/units/basic?updatedBy=${updatedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const updateBasicUnitByCompanyId = createAsyncThunk(
  "updateBasicUnitByCompanyId",
  async ({ companyId, unitId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/companies/${companyId}/units/${unitId}?updatedBy=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const createBasicUnitByCompanyIdInAccounts = createAsyncThunk(
  "createBasicUnitByCompanyIdInAccounts",
  async ({ companyId, updatedBy, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/${companyId}/units/basic?updatedBy=${updatedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const updateFullCompanyDetailsInLeads = createAsyncThunk(
  "updateFullCompanyDetailsInLeads",
  async ({ companyId, updatedBy, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/companies/${companyId}/full-details?updatedBy=${updatedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const updateFullCompanyDetailsInAccounts = createAsyncThunk(
  "updateFullCompanyDetailsInAccounts",
  async ({ companyId, updatedBy, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/accountService/api/v1/${companyId}/full-details?updatedBy=${updatedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const approvedCompanyInLeads = createAsyncThunk(
  "approvedCompanyInLeads",
  async ({ companyId, reviewedBy, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/companies/${companyId}/review?reviewedBy=${reviewedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const approvedCompanyInAccount = createAsyncThunk(
  "approvedCompanyInAccount",
  async ({ companyId, reviewedBy, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/${companyId}/review?reviewedBy=${reviewedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const getGstListByCompanyIdInAccounts = createAsyncThunk(
  "getGstListByCompanyIdInAccounts",
  async ({ userId, status, companyId }) => {
    const response = await api.get(
      `/leadService/api/companies/accounts/pending-review-units?assigneeId=${userId}&onboardingStatus=${status}&companyId=${companyId}`,
    );
    return response.data;
  },
);

export const approvedCompanyUnitsInLeads = createAsyncThunk(
  "approvedCompanyUnitsInLeads",
  async ({ companyId, unitId, reviewedBy, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/companies/${companyId}/units/${unitId}/review?reviewedBy=${reviewedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const approvedCompanyUnitsInAccount = createAsyncThunk(
  "approvedCompanyUnitsInAccount",
  async ({ companyId, unitId, reviewedBy, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/companies/${companyId}/units/${unitId}/review?reviewedBy=${reviewedBy}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const getAllCompanyByUserId = createAsyncThunk(
  "getAllCompanyByUserId",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/companies/getBasicCompany?assigneeId=${userId}`,
    );
    return response.data;
  },
);

export const getAllUnitListByCompanyId = createAsyncThunk(
  "getAllUnitListByCompanyId",
  async (companyId) => {
    const response = await api.get(
      `/leadService/api/companies/${companyId}/units`,
    );
    return response.data;
  },
);

export const getBasicCompanyDetailByCompanyId = createAsyncThunk(
  "getBasicCompanyDetailByCompanyId",
  async (companyId) => {
    const response = await api.get(
      `/leadService/api/companies/getCompany/${companyId}`,
    );
    return response.data;
  },
);

export const updateBasicCompanyDetail = createAsyncThunk(
  "updateBasicCompanyDetail",
  async ({ companyId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/companies/${companyId}/partial-details?updatedBy=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const createCompanyAndUnitsForAccountsViaLeadEstimate = createAsyncThunk(
  "createCompanyAndUnitsForAccountsViaLeadEstimate",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/accountService/api/v1/company`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const getCompaniesListForCSVExportFile = createAsyncThunk(
  "getCompaniesListForCSVExportFile",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/leadService/api/companies/full-data`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const getCompanyDetailByCompanyIdAndUnitId = createAsyncThunk(
  "getCompanyDetailByCompanyIdAndUnitId",
  async ({ companyId, unitId }) => {
    const response = await api.get(
      `leadService/api/companies/getCompanyAndUnit?companyId=${companyId}&companyUnitId=${unitId}`,
    );
    return response.data;
  },
);

export const estimateSentToClient = createAsyncThunk(
  "estimateSentToClient",
  async ({ estimateId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/accountService/api/v1/estimates/${estimateId}/send?userId=${userId}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

const CompanySlice = createSlice({
  name: "company",
  initialState: {
    newCompaniesList: [],
    newCompaniesTotalCount: 0,
    loading: "",
    gstTypeList: {},
    businessTypeList: {},
    companyTypeList: [],
    companyGstList: [],
    companyUnitList: [],
    comapanyLeadsList: [],
    companyProjectList: [],
    companyDetail: {},
    servingCompanyList: [],
    allLeadCompanyList: [],
    seachCompniesList: [],
    allCompanyUnits: [],
    contactListByCompanyId: [],
    companyHistoryList: [],
    existingCompanyList: [],
    companyDetailById: {},
    basicCompanyDetail: {},
    companyUnitListForAccounts: [],
    basicCompanyList: [],
    basicUnitList: [],
    companyDetailByCompanyIdAndUnitId: {},
  },
  reducers: {
    handleResetExistingCompany: (state, action) => {
      console.log("resetting existing company in slice", action);
      state.basicCompanyDetail = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllNewCompanies.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllNewCompanies.fulfilled, (state, action) => {
      state.loading = "success";
      state.newCompaniesList = action?.payload;
    });
    builder.addCase(getAllNewCompanies.rejected, (state) => {
      state.loading = "rejected";
      state.newCompaniesList = [];
    });

    builder.addCase(searchCompanies.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchCompanies.fulfilled, (state, action) => {
      state.loading = "success";
      state.newCompaniesList = action?.payload;
    });
    builder.addCase(searchCompanies.rejected, (state) => {
      state.loading = "rejected";
      state.newCompaniesList = [];
    });

    builder.addCase(getAllGstTypeByCompanyTypeId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllGstTypeByCompanyTypeId.fulfilled, (state, action) => {
      state.gstTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllGstTypeByCompanyTypeId.rejected, (state) => {
      state.loading = "rejected";
      state.gstTypeList = {};
    });

    builder.addCase(getBusinessTypeByGstTypeId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getBusinessTypeByGstTypeId.fulfilled, (state, action) => {
      state.businessTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getBusinessTypeByGstTypeId.rejected, (state) => {
      state.loading = "rejected";
      state.businessTypeList = {};
    });

    builder.addCase(getAllCompanyType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyType.fulfilled, (state, action) => {
      state.companyTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyType.rejected, (state) => {
      state.loading = "rejected";
      state.companyTypeList = [];
    });

    builder.addCase(getGstListByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getGstListByCompanyId.fulfilled, (state, action) => {
      state.companyGstList = action?.payload;
      state.loading = "success";
    });
    builder.addCase(getGstListByCompanyId.rejected, (state) => {
      state.companyGstList = [];
      state.loading = "rejected";
    });

    builder.addCase(getCompanyUnitsByStateAndCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getCompanyUnitsByStateAndCompanyId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.companyUnitList = action?.payload;
      },
    );
    builder.addCase(getCompanyUnitsByStateAndCompanyId.rejected, (state) => {
      state.loading = "rejected";
      state.companyUnitList = [];
    });

    builder.addCase(getLeadsByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getLeadsByCompanyId.fulfilled, (state, action) => {
      state.loading = "success";
      state.comapanyLeadsList = action?.payload;
    });
    builder.addCase(getLeadsByCompanyId.rejected, (state) => {
      state.loading = "rejected";
      state.comapanyLeadsList = [];
    });

    builder.addCase(getCompanyProjectAction.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyProjectAction.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyProjectList = action.payload;
    });
    builder.addCase(getCompanyProjectAction.rejected, (state) => {
      state.loading = "rejected";
      state.companyProjectList = [];
    });

    builder.addCase(getCompanyByUnitId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyByUnitId.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyDetail = action.payload;
    });
    builder.addCase(getCompanyByUnitId.rejected, (state) => {
      state.loading = "rejected";
      state.companyDetail = {};
    });

    builder.addCase(getAllServingCompanyList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllServingCompanyList.fulfilled, (state, action) => {
      state.servingCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllServingCompanyList.rejected, (state) => {
      state.loading = "rejected";
      state.servingCompanyList = [];
    });

    builder.addCase(getAllCompanyByStatus.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyByStatus.fulfilled, (state, action) => {
      state.allLeadCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyByStatus.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(searchCompanyForm.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchCompanyForm.fulfilled, (state, action) => {
      state.allLeadCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(searchCompanyForm.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(searchCompaniesForCompany.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchCompaniesForCompany.fulfilled, (state, action) => {
      state.seachCompniesList = action?.payload;
      state.loading = "success";
    });
    builder.addCase(searchCompaniesForCompany.rejected, (state) => {
      state.seachCompniesList = [];
      state.loading = "rejected";
    });

    builder.addCase(getAllCompanyUnits.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyUnits.fulfilled, (state, action) => {
      state.allCompanyUnits = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyUnits.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllContactListByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllContactListByCompanyId.fulfilled, (state, action) => {
      state.contactListByCompanyId = action?.payload;
      state.loading = "success";
    });
    builder.addCase(getAllContactListByCompanyId.rejected, (state) => {
      state.contactListByCompanyId = [];
      state.loading = "rejected";
    });

    builder.addCase(getHistoryByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getHistoryByCompanyId.fulfilled, (state, action) => {
      state.companyHistoryList = action?.payload;
      state.loading = "success";
    });
    builder.addCase(getHistoryByCompanyId.rejected, (state) => {
      state.companyHistoryList = [];
      state.loading = "rejected";
    });

    builder.addCase(getCompanyExistData.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyExistData.fulfilled, (state, action) => {
      state.existingCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getCompanyExistData.rejected, (state, action) => {
      state.loading = "rejected";
      state.existingCompanyList = [];
    });

    builder.addCase(getCompanyDetailsById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getCompanyDetailsById.fulfilled, (state, action) => {
      state.companyDetailById = action.payload;
      state.loading = "success";
    });
    builder.addCase(getCompanyDetailsById.rejected, (state, action) => {
      state.loading = "rejected";
      state.companyDetailById = {};
    });

    builder.addCase(getBasicCompanyDetails.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getBasicCompanyDetails.fulfilled, (state, action) => {
      state.basicCompanyDetail = action.payload;
      state.loading = "success";
    });
    builder.addCase(getBasicCompanyDetails.rejected, (state, action) => {
      state.loading = "rejected";
      state.basicCompanyDetail = {};
    });

    builder.addCase(getAllNewCompaniesCount.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllNewCompaniesCount.fulfilled, (state, action) => {
      state.newCompaniesTotalCount = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllNewCompaniesCount.rejected, (state, action) => {
      state.loading = "rejected";
      state.newCompaniesTotalCount = 0;
    });

    builder.addCase(getGstListByCompanyIdInAccounts.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getGstListByCompanyIdInAccounts.fulfilled,
      (state, action) => {
        state.companyUnitListForAccounts = action.payload;
        state.loading = "success";
      },
    );
    builder.addCase(getGstListByCompanyIdInAccounts.rejected, (state) => {
      state.loading = "rejected";
      state.companyUnitListForAccounts = [];
    });

    builder.addCase(getAllCompanyByUserId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyByUserId.fulfilled, (state, action) => {
      state.basicCompanyList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyByUserId.rejected, (state) => {
      state.loading = "rejected";
      state.basicCompanyList = [];
    });

    builder.addCase(getAllUnitListByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllUnitListByCompanyId.fulfilled, (state, action) => {
      state.basicUnitList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllUnitListByCompanyId.rejected, (state) => {
      state.loading = "rejected";
      state.basicUnitList = [];
    });

    builder.addCase(getBasicCompanyDetailByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getBasicCompanyDetailByCompanyId.fulfilled,
      (state, action) => {
        state.basicCompanyDetail = action.payload;
        state.loading = "success";
      },
    );
    builder.addCase(getBasicCompanyDetailByCompanyId.rejected, (state) => {
      state.loading = "rejected";
      state.basicCompanyDetail = {};
    });

    builder.addCase(getCompanyDetailByCompanyIdAndUnitId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getCompanyDetailByCompanyIdAndUnitId.fulfilled,
      (state, action) => {
        state.companyDetailByCompanyIdAndUnitId = action.payload;
        state.loading = "success";
      },
    );
    builder.addCase(getCompanyDetailByCompanyIdAndUnitId.rejected, (state) => {
      state.loading = "rejected";
      state.companyDetailByCompanyIdAndUnitId = {};
    });
  },
});

export const { handleResetExistingCompany } = CompanySlice.actions;

export default CompanySlice.reducer;
