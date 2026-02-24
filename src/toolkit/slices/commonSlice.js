import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const emailChecker = createAsyncThunk("emailChecker", async (email) => {
  const response = await api.get(
    `/leadService/api/v1/users/checkEmailExist?email=${email}`,
  );
  return response;
});
export const getDesiginationById = createAsyncThunk(
  "getDesiginationByID",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/designation/getAllDesignationByDepartment?departmentId=${id}`,
    );
    return response.data;
  },
);

export const getManagerById = createAsyncThunk("getManagerById", async (id) => {
  const response = await api.get(
    `/leadService/api/v1/users/getUserManagerByDepartment?departmentId=${id}`,
  );
  return response.data;
});

export const getProcurementAssigneeList = createAsyncThunk(
  "getProcurementAssigneeList",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/users/fetchProcurementUsers?userId=${id}`,
    );
    return response.data;
  },
);

export const createContacts = createAsyncThunk(
  "createContacts",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/contact/createContact`,
      data,
    );
    return response.data;
  },
);

export const createNewContacts = createAsyncThunk(
  "createContacts",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/contact/createNewContact`,
      data,
    );
    return response.data;
  },
);

export const getAllCountries = createAsyncThunk("getAllCountries", async () => {
  const response = await api.get(`/leadService/api/v1/country/getAllCountry`);
  return response.data;
});

export const getAllSecondaryCountries = createAsyncThunk(
  "getAllSecondaryCountries",
  async () => {
    const response = await api.get(`/leadService/api/v1/country/getAllCountry`);
    return response.data;
  },
);

export const getAllStatesByCountryId = createAsyncThunk(
  "getAllStatesByCountryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryId?id=${id}`,
    );
    return response.data;
  },
);

export const getAllStatesByCountryName = createAsyncThunk(
  "getAllStatesByCountryName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryName?name=${name}`,
    );
    return response.data;
  },
);

export const getAllSecondaryStatesBySecondaryCountryName = createAsyncThunk(
  "getAllSecondaryStatesBySecondaryCountryName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryName?name=${name}`,
    );
    return response.data;
  },
);

export const getAllCitiesByStateId = createAsyncThunk(
  "getAllCitiesByStateId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateId?id=${id}`,
    );
    return response.data;
  },
);

export const getAllCitiesByStateName = createAsyncThunk(
  "getAllCitiesByStateName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateName?name=${name}`,
    );
    return response.data;
  },
);

export const getAllSecondaryCitiesBySecondaryStateName = createAsyncThunk(
  "getAllSecondaryCitiesBySecondaryStateName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateName?name=${name}`,
    );
    return response.data;
  },
);

export const panNumberExistOrNot = createAsyncThunk(
  "panNumberExistOrNot",
  async (panNo) => {
    const response = await api.get(
      `/leadService/api/v1/company/getCompanyPanNo?panNo=${panNo}`,
    );
    return response.data;
  },
);

export const getAllUsers = createAsyncThunk("allUsers", async () => {
  const allUser = await api.get(`/leadService/api/v1/users/getAllUser`);
  return allUser?.data;
});

export const activateOrDeActivateUser = createAsyncThunk(
  "deActivateUser",
  async ({ currentUserId, id }) => {
    const statusUserData = await api.put(
      `/leadService/api/v1/users/autoActive?userId=${id}&currentUser=${currentUserId}`,
    );
    return statusUserData?.data;
  },
);

export const deleteUserInLeadService = createAsyncThunk(
  "deleteUserInLeadService",
  async (id) => {
    const response = await api.delete(
      `/leadService/api/v1/users/deleteUser?id=${id}`,
    );
    return response.data;
  },
);

export const getAllRoles = createAsyncThunk("allRoles", async () => {
  const response = await api.get(`/securityService/api/v1/roles/getRole`);
  return response.data;
});

export const createUserByHr = createAsyncThunk(
  "createUserByHr",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/users/createUserByHr`,
      data,
    );
    return response;
  },
);

export const updateLeadByHr = createAsyncThunk(
  "upDateLeadByHr",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/users/editUserByHr`,
      data,
    );
    return response;
  },
);

export const getAllMainIndustry = createAsyncThunk(
  "getAllMainIndustry",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustry`,
    );
    return response.data;
  },
);

export const getSubIndustryByIndustryId = createAsyncThunk(
  "getSubIndustryByIndustryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getSubIndustryByIndustryId?id=${id}`,
    );
    return response.data;
  },
);

export const getSubSubIndustryBySubIndustryId = createAsyncThunk(
  "getSubSubIndustryBySubIndustryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllSubSubIndustryBySubIndustryId?id=${id}`,
    );
    return response.data;
  },
);

export const getIndustryDataBySubSubIndustryId = createAsyncThunk(
  "getIndustryDataBySubSubIndustryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustryDataBySubSubIndustryId?id=${id}`,
    );
    return response.data;
  },
);

export const getAllContactDetails = createAsyncThunk(
  "getAllContactDetail",
  async () => {
    const response = await api.get(`/leadService/api/v1/contact/getAllContact`);
    return response.data;
  },
);

export const getAllContactListById = createAsyncThunk(
  "getAllContactListById",
  async (companyId) => {
    const response = await api.get(
      `/leadService/api/v1/company/getContactByCompanyId?companyId=${companyId}`,
    );
    return response.data;
  },
);

export const getUserApprovalList = createAsyncThunk(
  "allhrUserApprovalList",
  async ({ userId }) => {
    const allDataUser = await api.get(
      `/leadService/api/v1/hrManagment/getUserApprovalHr?userId=${userId}`,
    );
    return allDataUser?.data;
  },
);

export const approvedUserByHr = createAsyncThunk(
  "approvedUserByHr",
  async ({ currentUserId, userId }) => {
    const approvedUser = await api.put(
      `/leadService/api/v1/hrManagment/approvedUserByHr?currentUserId=${currentUserId}&userId=${userId}&flag=${true}`,
    );
    return approvedUser?.data;
  },
);

export const getAllDeactivateUserList = createAsyncThunk(
  "getAllDeactivateUserList",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/users/getAllDeactivateUser`,
    );
    return response.data;
  },
);

export const allUserListForManagerApproval = createAsyncThunk(
  "allUserListForManagerApproval",
  async (id) => {
    const managerUserData = await api.get(
      `/leadService/api/v1/users/getUserForManager?id=${id}`,
    );
    return managerUserData?.data;
  },
);

export const approvedAndDisapprovedUserByManager = createAsyncThunk(
  "approvedAndDisapprovedUserByManager",
  async ({ currentUserId, userId, status }) => {
    const approvedUser = await api.put(
      `/leadService/api/v1/users/approvedUserByManager?currentUserId=${currentUserId}&userId=${userId}&status=${status}`,
    );
    return approvedUser?.data;
  },
);

export const activeUserByAdmin = createAsyncThunk(
  "activeUserByAdmin",
  async (id) => {
    const response = await api.put(
      `/leadService/api/v1/users/activateUser?id=${id}`,
    );
    return response.data;
  },
);

export const getAllUrlList = createAsyncThunk("allUrlsList", async () => {
  const response = await api.get(`/leadService/api/v1/urls/getAllUrls`);
  return response.data;
});

export const getUsersListByServiceRatingId = createAsyncThunk(
  "getUsersListByServiceRatingId",
  async ({ serviceId }) => {
    const response = await api.get(
      `/leadService/api/v1/rating/getRetingByUrls?urlsId=${serviceId}`,
    );
    return response?.data;
  },
);

export const addNewRating = createAsyncThunk(
  "add-new-rating-star",
  async (data) => {
    const createRating = await api.post(
      `/leadService/api/v1/rating/addUserAndRating`,
      data,
    );
    return createRating;
  },
);

export const addMultiuserForRating = createAsyncThunk(
  "addMultiuserForRating",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/rating/addUserAndMultiRating`,
      data,
    );
    return response.data;
  },
);

export const editUserRatingAssignee = createAsyncThunk(
  "editUserAsignee",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/rating/updateUserRatingService`,
      data,
    );
    return response.data;
  },
);

export const deleteRatingAssignee = createAsyncThunk(
  "deleteRatingAssignee",
  async (id) => {
    const response = await api.delete(
      `/leadService/api/v1/rating/deleteUserByRatingId?id=${id}`,
    );
    return response.data;
  },
);

export const getTotalIvrCount = createAsyncThunk(
  "getTotalIvrCount",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/rating/getAllIvrDataCount`,
    );
    return response.data;
  },
);

export const getAllIvrWithPage = createAsyncThunk(
  "getAllIvrWithPage",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/rating/getAllIvrDataWithPage?page=${data?.page}&size=${data?.size}`,
    );
    return response.data;
  },
);

export const createIvr = createAsyncThunk("createIvr", async (data) => {
  const response = await api.get(
    `/leadService/api/v1/rating/createIvrData?callerNumber=${data?.callerNumber}&agentName=${data?.agentName}&aggentNumber=${data?.aggentNumber}&startTime=${data?.startTime}&duration=${data?.duration}&endTime=${data?.endTime}&callRecordingUrl=${data?.callRecordingUrl}`,
  );
  return response.data;
});

export const createMainIndustry = createAsyncThunk(
  "createMainIndustry",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/industryData/createIndustry`,
      data,
    );
    return response.data;
  },
);

export const getAllIndustriesWithPagination = createAsyncThunk(
  "getAllIndustriesWithPagination",
  async ({ page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustryForIndustryPage?page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const allIndstriesCount = createAsyncThunk(
  "allIndstriesCount",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustryCount`,
    );
    return response.data;
  },
);

export const getAllSubIndustry = createAsyncThunk(
  "getAllSubIndustry",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllSubIndustry`,
    );
    return response.data;
  },
);

export const getAllSubIndustryWithPagination = createAsyncThunk(
  "getAllSubIndustryWithPagination",
  async ({ page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllSubIndustryForPage?page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getAllSubIndustyCount = createAsyncThunk(
  "getAllSubIndustyCount",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllSubIndustryCount`,
    );
    return response.data;
  },
);

export const createSubIndustry = createAsyncThunk(
  "createSubIndustry",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/industryData/createSubIndustry`,
      data,
    );
    return response.data;
  },
);

export const getAllSubsubIndustry = createAsyncThunk(
  "getAllSubsubIndustry",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllSubSubIndustry`,
    );
    return response.data;
  },
);

export const getAllSubSubIndustryWithPagination = createAsyncThunk(
  "getAllSubSubIndustryWithPagination",
  async ({ page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllSubSubIndustryForPage?page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getTotalSubSubIndustryCount = createAsyncThunk(
  "getTotalSubSubIndustryCount",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllSubSubIndustryCount`,
    );
    return response.data;
  },
);

export const createSubsubIndustry = createAsyncThunk(
  "createSubsubIndustry",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/industryData/createSubSubIndustry`,
      data,
    );
    return response.data;
  },
);

export const getAllIndustriesData = createAsyncThunk(
  "getAllIndustriesData",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustryData`,
    );
    return response.data;
  },
);

export const getAllIndustryDataWithPagination = createAsyncThunk(
  "getAllIndustryDataWithPagination",
  async ({ page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustryDataForPage?page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getIndustryDataCount = createAsyncThunk(
  "getIndustryDataCount",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustryDataCount`,
    );
    return response.data;
  },
);

export const createIndustry = createAsyncThunk(
  "createIndustry",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/industryData/createIndustryData?name=${data?.name}`,
    );
    return response.data;
  },
);

export const getAllTaskStatus = createAsyncThunk("allTaskStatus", async () => {
  const response = await api.get(`/leadService/api/v1/getAllTaskStatus`);
  return response.data;
});

export const getUserHistoryById = createAsyncThunk(
  "getUserHistoryById",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/rating/getAllUserHistory?userId=${id}`,
    );
    return response?.data;
  },
);

export const getUsersListByDepartmentId = createAsyncThunk(
  "getUsersListByDepartmentId",
  async (id) => {
    const response = await api.get(`/api/departments/${id}/users`);
    return response.data;
  },
);

export const getAllMilestoneStatusesForOperations = createAsyncThunk(
  "getAllMilestoneStatusesForOperations",
  async () => {
    const response = await api.get("/api/milestone-statuses");
    return response.data;
  },
);

export const createContactViaEstimateInCompany = createAsyncThunk(
  "createContactViaEstimateInCompany",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/leadService/api/v1/contact/associated`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.message);
    }
  },
);

export const getContactDetailListByCompanyId = createAsyncThunk(
  "getContactDetailListByCompanyId",
  async ({companyId,userId}) => {
    const response = await api.get(
      `/leadService/api/v1/contacts/by-company/${companyId}?requestingUserId=${userId}`,
    );
    return response.data;
  },
);

const CommonSlice = createSlice({
  name: "common",
  initialState: {
    desiginationListById: [],
    loading: "",
    managerListById: [],
    procurementAssigneeList: [],
    countriesList: [],
    statesList: [],
    citiesList: [],
    secondaryCountriesList: [],
    secondaryStateList: [],
    secondaryCitiesList: [],
    usersList: [],
    usersLoading: "",
    industryLoading: "",
    allMainIndustry: [],
    subIndustryListByIndustryId: [],
    subSubIndustryListBySubIndustryId: [],
    industryDataListBySubSubIndustryId: [],
    allContactList: [],
    contactListByCompanyId: [],
    approvalUserList: [],
    urlList: [],
    usersListByServiceId: [],
    allIvr: [],
    totalIvrCount: 0,
    allIndustriesWithPage: [],
    allIndustryCount: 0,
    allSubIndustry: [],
    allSubIndustryWithPage: [],
    allSubIndustryCount: 0,
    allSubsubIndustry: [],
    allSubSubIndustryWithPage: [],
    totalSubSubIndustryCount: 0,
    allIndustriesData: [],
    allIndustryDataWithPage: [],
    allIndustryDataCount: 0,
    allRoles: [],
    allTaskStatusData: [],
    userHistoryList: [],
    userManagerApprovalList: [],
    deactiveUserList: [],
    userListByDepartment: [],
    milestoneStatusList: [],
    contactListByCompanyId: [],
  },
  reducers: {
    handleReset: (state) => {
      state.citiesList = [];
      state.statesList = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getDesiginationById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getDesiginationById.fulfilled, (state, action) => {
      state.loading = "success";
      state.desiginationListById = action.payload;
    });
    builder.addCase(getDesiginationById.rejected, (state) => {
      state.loading = "rejected";
    });
    builder.addCase(getManagerById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getManagerById.fulfilled, (state, action) => {
      state.loading = "success";
      state.managerListById = action.payload;
    });
    builder.addCase(getManagerById.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getProcurementAssigneeList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getProcurementAssigneeList.fulfilled, (state, action) => {
      state.loading = "success";
      state.procurementAssigneeList = action.payload;
    });
    builder.addCase(getProcurementAssigneeList.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllCountries.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCountries.fulfilled, (state, action) => {
      state.loading = "success";
      state.countriesList = action.payload;
    });
    builder.addCase(getAllCountries.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllSecondaryCountries.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSecondaryCountries.fulfilled, (state, action) => {
      state.loading = "success";
      state.secondaryCountriesList = action.payload;
    });
    builder.addCase(getAllSecondaryCountries.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllStatesByCountryId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllStatesByCountryId.fulfilled, (state, action) => {
      state.loading = "success";
      state.statesList = action.payload;
    });
    builder.addCase(getAllStatesByCountryId.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllStatesByCountryName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllStatesByCountryName.fulfilled, (state, action) => {
      state.loading = "success";
      state.statesList = action.payload;
    });
    builder.addCase(getAllStatesByCountryName.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(
      getAllSecondaryStatesBySecondaryCountryName.pending,
      (state) => {
        state.loading = "pending";
      },
    );
    builder.addCase(
      getAllSecondaryStatesBySecondaryCountryName.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.secondaryStateList = action.payload;
      },
    );
    builder.addCase(
      getAllSecondaryStatesBySecondaryCountryName.rejected,
      (state) => {
        state.loading = "rejected";
      },
    );

    builder.addCase(getAllCitiesByStateId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCitiesByStateId.fulfilled, (state, action) => {
      state.loading = "success";
      state.citiesList = action.payload;
    });
    builder.addCase(getAllCitiesByStateId.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllCitiesByStateName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCitiesByStateName.fulfilled, (state, action) => {
      state.loading = "success";
      state.citiesList = action.payload;
    });
    builder.addCase(getAllCitiesByStateName.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(
      getAllSecondaryCitiesBySecondaryStateName.pending,
      (state) => {
        state.loading = "pending";
      },
    );
    builder.addCase(
      getAllSecondaryCitiesBySecondaryStateName.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.secondaryCitiesList = action.payload;
      },
    );
    builder.addCase(
      getAllSecondaryCitiesBySecondaryStateName.rejected,
      (state) => {
        state.loading = "rejected";
      },
    );

    builder.addCase(getAllUsers.pending, (state) => {
      state.usersLoading = "pending";
      state.usersList = [];
    });
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.usersList = action.payload;
      state.usersLoading = "success";
    });
    builder.addCase(getAllUsers.rejected, (state) => {
      state.usersList = [];
      state.usersLoading = "rejected";
    });

    builder.addCase(getAllMainIndustry.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(getAllMainIndustry.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.allMainIndustry = action.payload;
    });
    builder.addCase(getAllMainIndustry.rejected, (state) => {
      state.industryLoading = "rejected";
    });

    builder.addCase(getSubIndustryByIndustryId.pending, (state) => {
      state.industryLoading = "pending";
      state.subIndustryListByIndustryId = [];
    });
    builder.addCase(getSubIndustryByIndustryId.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.subIndustryListByIndustryId = action.payload;
    });
    builder.addCase(getSubIndustryByIndustryId.rejected, (state) => {
      state.industryLoading = "rejected";
      state.subIndustryListByIndustryId = [];
    });

    builder.addCase(getSubSubIndustryBySubIndustryId.pending, (state) => {
      state.industryLoading = "pending";
      state.subSubIndustryListBySubIndustryId = [];
    });
    builder.addCase(
      getSubSubIndustryBySubIndustryId.fulfilled,
      (state, action) => {
        state.industryLoading = "fulfilled";
        state.subSubIndustryListBySubIndustryId = action.payload;
      },
    );
    builder.addCase(getSubSubIndustryBySubIndustryId.rejected, (state) => {
      state.industryLoading = "rejected";
      state.subSubIndustryListBySubIndustryId = [];
    });

    builder.addCase(getIndustryDataBySubSubIndustryId.pending, (state) => {
      state.industryLoading = "pending";
      state.industryDataListBySubSubIndustryId = [];
    });
    builder.addCase(
      getIndustryDataBySubSubIndustryId.fulfilled,
      (state, action) => {
        state.industryLoading = "fulfilled";
        state.industryDataListBySubSubIndustryId = action.payload;
      },
    );
    builder.addCase(getIndustryDataBySubSubIndustryId.rejected, (state) => {
      state.industryLoading = "rejected";
      state.industryDataListBySubSubIndustryId = [];
    });

    builder.addCase(getAllContactDetails.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllContactDetails.fulfilled, (state, action) => {
      state.loading = "success";
      state.allContactList = action.payload;
    });
    builder.addCase(getAllContactDetails.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllContactListById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllContactListById.fulfilled, (state, action) => {
      state.loading = "success";
      state.contactListByCompanyId = action?.payload;
    });
    builder.addCase(getAllContactListById.rejected, (state) => {
      state.loading = "rejected";
      state.contactListByCompanyId = [];
    });

    builder.addCase(getUserApprovalList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getUserApprovalList.fulfilled, (state, action) => {
      state.approvalUserList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getUserApprovalList.rejected, (state) => {
      state.approvalUserList = [];
      state.loading = "rejected";
    });

    builder.addCase(getAllUrlList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllUrlList.fulfilled, (state, action) => {
      state.urlList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllUrlList.rejected, (state) => {
      state.loading = "success";
      state.urlList = [];
    });

    builder.addCase(getUsersListByServiceRatingId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getUsersListByServiceRatingId.fulfilled,
      (state, action) => {
        state.usersListByServiceId = action.payload;
        state.loading = "success";
      },
    );
    builder.addCase(getUsersListByServiceRatingId.rejected, (state) => {
      state.loading = "success";
      state.usersListByServiceId = [];
    });

    builder.addCase(getAllIvrWithPage.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllIvrWithPage.fulfilled, (state, action) => {
      state.loading = "success";
      state.allIvr = action.payload;
    });
    builder.addCase(getAllIvrWithPage.rejected, (state) => {
      state.loading = "rejected";
      state.allIvr = [];
    });

    builder.addCase(getTotalIvrCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalIvrCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalIvrCount = action.payload;
    });
    builder.addCase(getTotalIvrCount.rejected, (state) => {
      state.loading = "rejected";
      state.totalIvrCount = 0;
    });

    builder.addCase(getAllIndustriesWithPagination.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(
      getAllIndustriesWithPagination.fulfilled,
      (state, action) => {
        state.industryLoading = "fulfilled";
        state.allIndustriesWithPage = action.payload;
      },
    );
    builder.addCase(getAllIndustriesWithPagination.rejected, (state) => {
      state.industryLoading = "rejected";
      state.allIndustriesWithPage = [];
    });

    builder.addCase(allIndstriesCount.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(allIndstriesCount.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.allIndustryCount = action.payload;
    });
    builder.addCase(allIndstriesCount.rejected, (state) => {
      state.industryLoading = "rejected";
      state.allIndustryCount = 0;
    });

    builder.addCase(getAllSubIndustry.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(getAllSubIndustry.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.allSubIndustry = action.payload;
    });
    builder.addCase(getAllSubIndustry.rejected, (state) => {
      state.industryLoading = "rejected";
    });

    builder.addCase(getAllSubIndustryWithPagination.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(
      getAllSubIndustryWithPagination.fulfilled,
      (state, action) => {
        state.industryLoading = "fulfilled";
        state.allSubIndustryWithPage = action.payload;
      },
    );
    builder.addCase(getAllSubIndustryWithPagination.rejected, (state) => {
      state.industryLoading = "rejected";
      state.allSubIndustryWithPage = [];
    });

    builder.addCase(getAllSubIndustyCount.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(getAllSubIndustyCount.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.allSubIndustryCount = action.payload;
    });
    builder.addCase(getAllSubIndustyCount.rejected, (state) => {
      state.industryLoading = "rejected";
      state.allSubIndustryCount = 0;
    });

    builder.addCase(getAllSubsubIndustry.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(getAllSubsubIndustry.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.allSubsubIndustry = action.payload;
    });
    builder.addCase(getAllSubsubIndustry.rejected, (state) => {
      state.industryLoading = "rejected";
    });

    builder.addCase(getAllSubSubIndustryWithPagination.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(
      getAllSubSubIndustryWithPagination.fulfilled,
      (state, action) => {
        state.industryLoading = "fulfilled";
        state.allSubSubIndustryWithPage = action.payload;
      },
    );
    builder.addCase(getAllSubSubIndustryWithPagination.rejected, (state) => {
      state.industryLoading = "rejected";
      state.allSubSubIndustryWithPage = [];
    });

    builder.addCase(getTotalSubSubIndustryCount.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(getTotalSubSubIndustryCount.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.totalSubSubIndustryCount = action.payload;
    });
    builder.addCase(getTotalSubSubIndustryCount.rejected, (state) => {
      state.industryLoading = "rejected";
      state.totalSubSubIndustryCount = 0;
    });

    builder.addCase(getAllIndustriesData.pending, (state, action) => {
      state.industryLoading = "pending";
    });
    builder.addCase(getAllIndustriesData.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.allIndustriesData = action.payload;
    });
    builder.addCase(getAllIndustriesData.rejected, (state, action) => {
      state.industryLoading = "rejected";
    });

    builder.addCase(
      getAllIndustryDataWithPagination.pending,
      (state, action) => {
        state.industryLoading = "pending";
      },
    );
    builder.addCase(
      getAllIndustryDataWithPagination.fulfilled,
      (state, action) => {
        state.industryLoading = "fulfilled";
        state.allIndustryDataWithPage = action.payload;
      },
    );
    builder.addCase(getAllIndustryDataWithPagination.rejected, (state) => {
      state.industryLoading = "rejected";
      state.allIndustryDataWithPage = [];
    });

    builder.addCase(getIndustryDataCount.pending, (state) => {
      state.industryLoading = "pending";
    });
    builder.addCase(getIndustryDataCount.fulfilled, (state, action) => {
      state.industryLoading = "fulfilled";
      state.allIndustryDataCount = action.payload;
    });
    builder.addCase(getIndustryDataCount.rejected, (state) => {
      state.industryLoading = "rejected";
      state.allIndustryDataCount = 0;
    });

    builder.addCase(getAllRoles.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllRoles.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      state.allRoles = action.payload;
    });
    builder.addCase(getAllRoles.rejected, (state) => {
      state.loading = "rejected";
      state.allRoles = [];
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

    builder.addCase(getUserHistoryById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getUserHistoryById.fulfilled, (state, action) => {
      state.loading = "success";
      state.userHistoryList = action.payload;
    });
    builder.addCase(getUserHistoryById.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(allUserListForManagerApproval.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(
      allUserListForManagerApproval.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.userManagerApprovalList = action.payload;
      },
    );
    builder.addCase(allUserListForManagerApproval.rejected, (state, action) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllDeactivateUserList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllDeactivateUserList.fulfilled, (state, action) => {
      state.loading = "success";
      state.deactiveUserList = action.payload;
    });
    builder.addCase(getAllDeactivateUserList.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getUsersListByDepartmentId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getUsersListByDepartmentId.fulfilled, (state, action) => {
      state.loading = "success";
      state.userListByDepartment = action.payload;
    });
    builder.addCase(getUsersListByDepartmentId.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllMilestoneStatusesForOperations.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllMilestoneStatusesForOperations.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.milestoneStatusList = action.payload;
      },
    );
    builder.addCase(getAllMilestoneStatusesForOperations.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getContactDetailListByCompanyId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getContactDetailListByCompanyId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.contactListByCompanyId = action.payload;
      },
    );
    builder.addCase(getContactDetailListByCompanyId.rejected, (state) => {
      state.loading = "rejected";
    });
  },
});

export const { handleReset } = CommonSlice.actions;

export default CommonSlice.reducer;
