import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const emailChecker = createAsyncThunk("emailChecker", async (email) => {
  const response = await api.get(
    `/leadService/api/v1/users/checkEmailExist?email=${email}`
  );
  return response;
});
export const getDesiginationById = createAsyncThunk(
  "getDesiginationByID",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/designation/getAllDesignationByDepartment?departmentId=${id}`
    );
    return response.data;
  }
);

export const getManagerById = createAsyncThunk("getManagerById", async (id) => {
  const response = await api.get(
    `/leadService/api/v1/users/getUserManagerByDepartment?departmentId=${id}`
  );
  return response.data;
});

export const getProcurementAssigneeList = createAsyncThunk(
  "getProcurementAssigneeList",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/users/fetchProcurementUsers?userId=${id}`
    );
    return response.data;
  }
);

export const createContacts = createAsyncThunk(
  "createContacts",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/contact/createContact`,
      data
    );
    return response.data;
  }
);

export const createNewContacts = createAsyncThunk(
  "createContacts",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/contact/createNewContact`,
      data
    );
    return response.data;
  }
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
  }
);

export const getAllStatesByCountryId = createAsyncThunk(
  "getAllStatesByCountryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryId?id=${id}`
    );
    return response.data;
  }
);

export const getAllStatesByCountryName = createAsyncThunk(
  "getAllStatesByCountryName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryName?name=${name}`
    );
    return response.data;
  }
);

export const getAllSecondaryStatesBySecondaryCountryName = createAsyncThunk(
  "getAllSecondaryStatesBySecondaryCountryName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/country/getAllStateByCountryName?name=${name}`
    );
    return response.data;
  }
);

export const getAllCitiesByStateId = createAsyncThunk(
  "getAllCitiesByStateId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateId?id=${id}`
    );
    return response.data;
  }
);

export const getAllCitiesByStateName = createAsyncThunk(
  "getAllCitiesByStateName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateName?name=${name}`
    );
    return response.data;
  }
);

export const getAllSecondaryCitiesBySecondaryStateName = createAsyncThunk(
  "getAllSecondaryCitiesBySecondaryStateName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCityByStateName?name=${name}`
    );
    return response.data;
  }
);

export const panNumberExistOrNot = createAsyncThunk(
  "panNumberExistOrNot",
  async (panNo) => {
    const response = await api.get(
      `/leadService/api/v1/company/getCompanyPanNo?panNo=${panNo}`
    );
    return response.data;
  }
);

export const getAllUsers = createAsyncThunk("allUsers", async () => {
  const allUser = await api.get(`/leadService/api/v1/users/getAllUser`);
  return allUser?.data;
});

export const getAllMainIndustry = createAsyncThunk(
  "getAllMainIndustry",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustry`
    );
    return response.data;
  }
);

export const getSubIndustryByIndustryId = createAsyncThunk(
  "getSubIndustryByIndustryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getSubIndustryByIndustryId?id=${id}`
    );
    return response.data;
  }
);

export const getSubSubIndustryBySubIndustryId = createAsyncThunk(
  "getSubSubIndustryBySubIndustryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllSubSubIndustryBySubIndustryId?id=${id}`
    );
    return response.data;
  }
);

export const getIndustryDataBySubSubIndustryId = createAsyncThunk(
  "getIndustryDataBySubSubIndustryId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/industryData/getAllIndustryDataBySubSubIndustryId?id=${id}`
    );
    return response.data;
  }
);

export const getAllContactDetails = createAsyncThunk(
  "getAllContactDetail",
  async () => {
    const response = await api.get(`/leadService/api/v1/contact/getAllContact`);
    return response.data;
  }
);

export const getAllContactListById = createAsyncThunk(
  "getAllContactListById",
  async (companyId) => {
    const response = await api.get(
      `/leadService/api/v1/company/getContactByCompanyId?companyId=${companyId}`
    );
    return response.data;
  }
);

export const getUserApprovalList = createAsyncThunk(
  "allhrUserApprovalList",
  async ({ userId }) => {
    const allDataUser = await api.get(
      `/leadService/api/v1/hrManagment/getUserApprovalHr?userId=${userId}`
    );
    return allDataUser?.data;
  }
);

export const getAllUrlList = createAsyncThunk("allUrlsList", async () => {
  const response = await api.get(`/leadService/api/v1/urls/getAllUrls`);
  return response.data;
});


export const getUsersListByServiceRatingId = createAsyncThunk(
  "getUsersListByServiceRatingId",
  async ({ serviceId }) => {
    const response = await api.get(
      `/leadService/api/v1/rating/getRetingByUrls?urlsId=${serviceId}`
    )
    return response?.data
  }
)

export const addNewRating = createAsyncThunk(
  "add-new-rating-star",
  async (data) => {
    const createRating = await api.post(
      `/leadService/api/v1/rating/addUserAndRating`,
      data
    )
    return createRating
  }
)

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
    usersListByServiceId:[]
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
      }
    );
    builder.addCase(
      getAllSecondaryStatesBySecondaryCountryName.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.secondaryStateList = action.payload;
      }
    );
    builder.addCase(
      getAllSecondaryStatesBySecondaryCountryName.rejected,
      (state) => {
        state.loading = "rejected";
      }
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
      }
    );
    builder.addCase(
      getAllSecondaryCitiesBySecondaryStateName.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.secondaryCitiesList = action.payload;
      }
    );
    builder.addCase(
      getAllSecondaryCitiesBySecondaryStateName.rejected,
      (state) => {
        state.loading = "rejected";
      }
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
      }
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
      }
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

    builder.addCase(getUserApprovalList.pending, (state, action) => {
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
    builder.addCase(getUsersListByServiceRatingId.fulfilled, (state, action) => {
      state.usersListByServiceId = action.payload;
      state.loading = "success";
    });
    builder.addCase(getUsersListByServiceRatingId.rejected, (state) => {
      state.loading = "success";
      state.usersListByServiceId = [];
    });
  },
});

export const { handleReset } = CommonSlice.actions;

export default CommonSlice.reducer;
