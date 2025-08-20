import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { postQuery } from "../../API/PostQuery"
import { getQuery } from "../../API/GetQuery"
import { deleteQuery } from "../../API/DeleteQuery"

export const addNewRating = createAsyncThunk(
  "add-new-rating-star",
  async (data) => {
    const createRating = await postQuery(
      `/leadService/api/v1/rating/addUserAndRating`,
      data
    )
    return createRating
  }
)


export const deleteRatingUser=createAsyncThunk('deleteRatingUser',async(id)=>{
  const response=await deleteQuerygit (`/leadService/api/v1/rating/deleteUserByRatingId?id=${id}`)
  return response.data
})


export const addMultiuser=createAsyncThunk('addMultiuser',async(data)=>{
  const response=await postQuery(`/leadService/api/v1/rating/addUserAndMultiRating`,data)
  return response.data
})

export const allRatingUsers = createAsyncThunk(
  "all-rating-users-list",
  async ({ id }) => {
    const allUserRating = await getQuery(
      `/leadService/api/v1/rating/getRetingByUrls?urlsId=${id}`
    )
    return allUserRating?.data
  }
)

const RatingSlice = createSlice({
  name: "ratingn",
  initialState: {
    addRating: {},
    addRatingLoading: false,
    addratingError: false,
    allUsersList: [],
    allUsersLoading: false,
    allUsersError: false,
    page: 0,
  },
  reducers: {
    handleNextPagination: (state, action) => {
      state.page = state.page + 1
    },
    handlePrevPagination: (state, action) => {
      state.page = state.page >= 0 ? state.page - 1 : 0
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addNewRating.pending, (state, action) => {
      state.addRatingLoading = true
      state.addratingError = false
    })
    builder.addCase(addNewRating.fulfilled, (state, action) => {
      state.addRating = action.payload
      state.addRatingLoading = false
      state.addratingError = false
    })
    builder.addCase(addNewRating.rejected, (state, action) => {
      state.addratingError = true
      state.addRatingLoading = false
    })

    builder.addCase(allRatingUsers.pending, (state, action) => {
      state.allUsersLoading = true
      state.allUsersError = false
    })
    builder.addCase(allRatingUsers.fulfilled, (state, action) => {
      state.allUsersList = action.payload
      state.allUsersLoading = false
      state.allUsersError = false
    })
    builder.addCase(allRatingUsers.rejected, (state, action) => {
      state.allUsersError = true
      state.allUsersLoading = false
    })
  },
})

export const { handleNextPagination, handlePrevPagination } =
  RatingSlice.actions

export default RatingSlice.reducer
