import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getAllProductCategoryById = createAsyncThunk(
  "getAllProductCategoryById",
  async (businessArragmentId) => {
    const response = await api.get(
      `/leadService/api/v1/productCategory/getAllProductCategoryByBusinessArragmentId?businessArragmentId=${businessArragmentId}`
    );
    return response.data;
  }
);

export const getAllBusinessArrangement = createAsyncThunk(
  "getAllBusinessArrangement",
  async (productId) => {
    const response = await api.get(
      `/leadService/api/v1/businessArrangment/getAllBusinessArrangmentByProductId?productId=${productId}`
    );
    return response.data;
  }
);

export const getAllProductSubCategoryListByCategoryId = createAsyncThunk(
  "getAllProductSubCategoryList",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/productSubCategory/getAllProductSubCategoryByProductCategoryId?productCategoryId=${id}`
    );
    return response.data;
  }
);

export const getProductListByLeadName = createAsyncThunk(
  "getProductListByLeadName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/product/getProductByName?name=${name}`
    );
    return response.data;
  }
);

export const createProductCategory = createAsyncThunk(
  "createProductCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/productCategory/createProductCategory`,
      data
    );
    return response.data;
  }
);

export const editProductCategory = createAsyncThunk(
  "editProductCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/productCategory/editProductCategory`,
      data
    );
    return response.data;
  }
);

export const createProductSubCategory = createAsyncThunk(
  "createProductSubCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/productSubCategory/createProductSubCategory`,
      data
    );
    return response.data;
  }
);

export const editProductSubCategory = createAsyncThunk(
  "editProductSubCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/productSubCategory/editProductSubCategory`,
      data
    );
    return response.data;
  }
);

export const toggleForRoundOffValue = createAsyncThunk(
  "toggleForRoundOffValue",
  async (id) => {
    const response = await api.put(
      `/leadService/api/v1/productSubCategory/roundValueOnAndOff?id=${id}`
    );
    return response.data;
  }
);


const ProductSlice = createSlice({
  name: "product",
  initialState: {
    loading: "",
    productCategoryList: [],
    businessArrangementList: [],
    productSubcategoryList: [],
    productDataByLeadName: {},
  },
  extraReducers: (builder) => {
    builder.addCase(getAllProductCategoryById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProductCategoryById.fulfilled, (state, action) => {
      state.loading = "success";
      state.productCategoryList = action.payload;
    });
    builder.addCase(getAllProductCategoryById.rejected, (state) => {
      state.loading = "rejected";
      state.productCategoryList = [];
    });

    builder.addCase(getAllBusinessArrangement.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllBusinessArrangement.fulfilled, (state, action) => {
      state.loading = "success";
      state.businessArrangementList = action.payload;
    });
    builder.addCase(getAllBusinessArrangement.rejected, (state) => {
      state.loading = "rejected";
      state.businessArrangementList = [];
    });

    builder.addCase(
      getAllProductSubCategoryListByCategoryId.pending,
      (state) => {
        state.loading = "pending";
      }
    );
    builder.addCase(
      getAllProductSubCategoryListByCategoryId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.productSubcategoryList = action.payload;
      }
    );
    builder.addCase(
      getAllProductSubCategoryListByCategoryId.rejected,
      (state) => {
        state.loading = "rejected";
        state.productSubcategoryList = [];
      }
    );

    builder.addCase(getProductListByLeadName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getProductListByLeadName.fulfilled, (state, action) => {
      state.loading = "success";
      state.productDataByLeadName = action?.payload;
    });
    builder.addCase(getProductListByLeadName.rejected, (state, action) => {
      state.loading = "rejected";
      state.productDataByLeadName = {};
    });
  },
});

export default ProductSlice.reducer;
