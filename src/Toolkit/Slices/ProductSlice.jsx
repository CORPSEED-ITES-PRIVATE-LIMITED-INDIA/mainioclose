import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getQuery } from "../../API/GetQuery";
import { postQuery } from "../../API/PostQuery";
import { deleteQuery } from "../../API/DeleteQuery";
import { putQuery } from "../../API/PutQuery";

export const getAllProductData = createAsyncThunk(
  "getAllProductData",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/product/getAllProducts`
    );
    return response.data;
  }
);

export const getAllProductListByType = createAsyncThunk(
  "getAllProductListByType",
  async (type) => {
    const response = await getQuery(
      `/leadService/api/v1/product/getAllProductList?type=${type}`
    );
    return response.data;
  }
);

export const getSingleProductByProductId = createAsyncThunk(
  "getSingleProductByProductId",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/product/getProduct?id=${id}`
    );
    return response.data;
  }
);

export const getAllCategories = createAsyncThunk(
  "getAllCategories",
  async (data) => {
    const response = await getQuery(
      `/leadService/api/v1/category/getAllCategories`
    );
    return response.data;
  }
);

export const addDocumentProduct = createAsyncThunk(
  "addDocumentProduct",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/product/addDocumentsInProduct`,
      data
    );
    return response.categoryData;
  }
);

export const addDocsInProduct = createAsyncThunk(
  "addDocsInProduct",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/product/addProductDocumentsInProduct`,
      data
    );
    return response.data;
  }
);

export const addMilestoneForProduct = createAsyncThunk(
  "addMilestoneForProduct",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/product/addStageInProduct`,
      data
    );
    return response.data;
  }
);

export const addAmountForProduct = createAsyncThunk(
  "addAmountForProduct",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/product/addAmountInProduct`,
      data
    );
    return response.data;
  }
);

export const editAmountForProduct = createAsyncThunk(
  "editAmountForProduct",
  async (data) => {
    const response = await putQuery(
      `/leadService/api/v1/product/updateAmountInProduct`,
      data
    );
    return response.data;
  }
);

export const addTATforProduct = createAsyncThunk(
  "addTATforProduct",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/product/addTatAndDescription`,
      data
    );
    return response.data;
  }
);

export const deleteMileStoneForProduct = createAsyncThunk(
  "deleteMileStoneForProduct",
  async (id) => {
    const response = await deleteQuery(
      `/leadService/api/v1/product/deleteStageFromProduct?productStageId =${id}`
    );
    return response.data;
  }
);

export const deletePriceForProduct = createAsyncThunk(
  "deletePriceForProduct",
  async (id) => {
    const response = await deleteQuery(
      `/leadService/api/v1/product/deleteAmountFromProduct?productAmountId=${id}`
    );
    return response.data;
  }
);

export const deleteDocumentForProduct = createAsyncThunk(
  "deleteDocumentForProduct",
  async (id) => {
    const response = await deleteQuery(
      `/leadService/api/v1/product/deleteDocumentFromProduct?productdocumentId=${id}`
    );
    return response.data;
  }
);

export const createProduct = createAsyncThunk("createProduct", async (data) => {
  const response = await postQuery(
    `/leadService/api/v1/product/createProduct`,
    data
  );
  return response.data;
});

export const deleteProduct = createAsyncThunk("deleteProduct", async (id) => {
  const response = await deleteQuery(
    `/leadService/api/v1/product/delete?id=${id}`
  );
  return response.data;
});

export const getAllBusinessArrangement = createAsyncThunk(
  "getAllBusinessArrangement",
  async (productId) => {
    const response = await getQuery(
      `/leadService/api/v1/businessArrangment/getAllBusinessArrangmentByProductId?productId=${productId}`
    );
    return response.data;
  }
);

export const createBusinessArrangement = createAsyncThunk(
  "createBusinessArrangement",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/businessArrangment/createBusinessArrangment`,
      data
    );
    return response.data;
  }
);

export const getAllProductCategoryById = createAsyncThunk(
  "getAllProductCategoryById",
  async (businessArragmentId) => {
    const response = await getQuery(
      `/leadService/api/v1/productCategory/getAllProductCategoryByBusinessArragmentId?businessArragmentId=${businessArragmentId}`
    );
    return response.data;
  }
);

export const createProductCategory = createAsyncThunk(
  "createProductCategory",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/productCategory/createProductCategory`,
      data
    );
    return response.data;
  }
);

export const getAllProductSubCategoryListByCategoryId = createAsyncThunk(
  "getAllProductSubCategoryList",
  async (id) => {
    const response = await getQuery(
      `/leadService/api/v1/productSubCategory/getAllProductSubCategoryByProductCategoryId?productCategoryId=${id}`
    );
    return response.data;
  }
);

export const createProductSubCategory = createAsyncThunk(
  "createProductSubCategory",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/productSubCategory/createProductSubCategory`,
      data
    );
    return response.data;
  }
);

const ProductSlice = createSlice({
  name: "product",
  initialState: {
    loading: "",
    productData: [],
    categoryData: [],
    singleProductDetail: {},
    productList: [],
    businessArrangementList: [],
    productCategoryList: [],
    productSubcategoryList: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getAllProductData.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProductData.fulfilled, (state, action) => {
      state.loading = "success";
      state.productData = action.payload;
    });
    builder.addCase(getAllProductData.rejected, (state, action) => {
      state.loading = "rejected";
      state.productData = [];
    });

    builder.addCase(getAllCategories.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCategories.fulfilled, (state, action) => {
      state.loading = "success";
      state.categoryData = action.payload;
    });
    builder.addCase(getAllCategories.rejected, (state, action) => {
      state.loading = "rejected";
      state.categoryData = [];
    });

    builder.addCase(getSingleProductByProductId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getSingleProductByProductId.fulfilled, (state, action) => {
      state.loading = "success";
      state.singleProductDetail = action.payload;
    });
    builder.addCase(getSingleProductByProductId.rejected, (state, action) => {
      state.loading = "rejected";
      state.singleProductDetail = {};
    });

    builder.addCase(getAllProductListByType.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProductListByType.fulfilled, (state, action) => {
      state.loading = "success";
      state.productList = action.payload;
    });
    builder.addCase(getAllProductListByType.rejected, (state, action) => {
      state.loading = "rejected";
      state.productList = [];
    });

    builder.addCase(getAllBusinessArrangement.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllBusinessArrangement.fulfilled, (state, action) => {
      state.loading = "success";
      state.businessArrangementList = action.payload;
    });
    builder.addCase(getAllBusinessArrangement.rejected, (state, action) => {
      state.loading = "rejected";
      state.businessArrangementList = [];
    });

    builder.addCase(getAllProductCategoryById.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProductCategoryById.fulfilled, (state, action) => {
      state.loading = "success";
      state.productCategoryList = action.payload;
    });
    builder.addCase(getAllProductCategoryById.rejected, (state, action) => {
      state.loading = "rejected";
      state.productCategoryList = [];
    });

    builder.addCase(
      getAllProductSubCategoryListByCategoryId.pending,
      (state, action) => {
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
      (state, action) => {
        state.loading = "rejected";
        state.productSubcategoryList = [];
      }
    );
  },
});

export default ProductSlice.reducer;
