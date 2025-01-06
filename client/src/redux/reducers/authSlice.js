import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL, // Using .env variable here
  headers: {
    "Content-Type": "application/json",
  },
});

const metamaskVerification = async ({ userAccount }) => {
  try {
    // Step 1: Get Challenge from Backend
    const { data } = await axiosInstance.post("api/metamask/getChallenge", {
      userAccount,
    });
    const { challenge } = data;

    // Step 2: Sign the Challenge
    try {
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [challenge, userAccount],
      });
      return signature;
    } catch (err) {
      throw err;
    }
  } catch (err) {
    throw err;
  }
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    { firstname, lastname, email, password, username },
    { rejectWithValue }
  ) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      await axiosInstance.post(
        "/api/users",
        { firstname, lastname, email, password, username },
        config
      );
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const registerUserMetaMask = createAsyncThunk(
  "auth/registerUser",
  async (
    { firstname, lastname, email, userAccount, username },
    { rejectWithValue }
  ) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      let signature = await metamaskVerification({ userAccount });
      let res = await axiosInstance.post(
        "/api/users",
        { firstname, lastname, email, userAccount, username, signature },
        config
      );
      let data = res.data;
      localStorage.setItem("userToken", data.token);
    } catch (err) {
      if (err.code === 4001) {
        Swal.fire({
          icon: "error",
          title: "User Denied Access",
          confirmButtonColor: "#FF5722",
        });
      } else if (err.response?.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Access Denied ",
          text: "Please create new account",
          confirmButtonColor: "#FF5722",
        });
      } else if (err.response?.status === 409) {
        Swal.fire({
          icon: "error",
          title: "User Already Exists",
          text: "Please create new account",
          confirmButtonColor: "#FF5722",
        });
      }
      return rejectWithValue(err.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      let res = await axiosInstance.post(
        "/api/auth",
        { email, password },
        config
      );
      let data = res.data;

      localStorage.setItem("userToken", data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const loginUserMetaMask = createAsyncThunk(
  "auth/loginUserMetaMask",
  async ({ rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (!window.ethereum) {
        Swal.fire({
          icon: "error",
          title: "MetaMask not found",
          text: "Please download MetaMask to connect your wallet",
          confirmButtonColor: "#FF5722",
        });
        throw new Error("MetaMask Not Found");
      }
      let userAccount = "";
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const account = await provider.send("eth_requestAccounts", []);
        userAccount = account[0];
      } catch (err) {
        if (err.info.error.code === 4001) {
          Swal.fire({
            icon: "error",
            title: "User Denied Connection",
            confirmButtonColor: "#FF5722",
          });
        }
        throw new Error(err.info.error.code);
      }

      let signature = await metamaskVerification({ userAccount });
      let res = await axiosInstance.post(
        "/api/auth",
        { userAccount, signature },
        config
      );
      let data = res.data;

      localStorage.setItem("userToken", data.token);
      return data;
    } catch (err) {
      if (err.code === 4001) {
        Swal.fire({
          icon: "error",
          title: "User Denied Access",
          confirmButtonColor: "#FF5722",
        });
      } else if (err.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "User Not Found",
          text: "Please create new account",
          confirmButtonColor: "#FF5722",
        });
      }

      return rejectWithValue(err.response.data);
    }
  }
);

export const getUserDetails = createAsyncThunk(
  "user/getUserDetails",
  async (arg, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const config = {
        headers: {
          "x-auth-token": auth.userToken,
        },
      };
      const { data } = await axiosInstance.get(`/api/auth`, config);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const config = {
        headers: {
          "x-auth-token": auth.userToken,
        },
      };

      let res = await axiosInstance.put(
        `/api/auth/${auth.userInfo._id}`,
        userData,
        config
      );
      let data = res.data;
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// initialize userToken from local storage
const userToken = localStorage.getItem("userToken")
  ? localStorage.getItem("userToken")
  : null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    error: false,
    loading: false,
    userInfo: null,
    userToken,
    success: false,
    errMsg: "",
    userErrorMsg: "",
    userUpdateError: false,
    userUpdateErrorMsg: "",
    editable: false,
    updating: false,
  },
  reducers: {
    removeError: (state, { payload }) => {
      state.error = false;
    },
    enableUpdate: (state, action) => {
      state.editable = !state.editable;
    },
    cancelUpdate: (state, action) => {
      state.editable = false;
    },
    logout: (state) => {
      localStorage.removeItem("userToken"); // deletes token from storage
      state.loading = false;
      state.userInfo = null;
      state.userToken = null;
      state.error = null;
    },
  },
  extraReducers: {
    [registerUser.pending]: (state) => {
      state.loading = true;
      state.error = false;
    },
    [registerUser.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.success = true;
    },
    [registerUser.rejected]: (state, { payload }) => {
      state.loading = false;
      state.error = true;
      state.errMsg = payload.msg ? payload.msg : payload;
    },
    [registerUserMetaMask.pending]: (state) => {
      state.loading = true;
      state.error = false;
    },
    [registerUserMetaMask.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.success = true;
    },
    [registerUserMetaMask.rejected]: (state, { payload }) => {
      state.loading = false;
      state.error = true;
      state.errMsg = payload ? payload.msg : payload;
    },
    [loginUser.pending]: (state) => {
      state.loading = true;
      state.error = false;
    },
    [loginUser.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.userInfo = payload.user;
      state.userToken = payload.token;
      state.errMsg = "";
    },
    [loginUser.rejected]: (state, { payload }) => {
      state.loading = false;
      state.error = true;
      state.errMsg = payload.msg ? payload.msg : payload;
    },
    [loginUserMetaMask.pending]: (state) => {
      state.loading = true;
      state.error = false;
    },
    [loginUserMetaMask.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.userInfo = payload.user;
      state.userToken = payload.token;
      state.errMsg = "";
    },
    [loginUserMetaMask.rejected]: (state, { payload }) => {
      state.loading = false;
      state.error = true;

      state.errMsg = payload ? payload.msg : "Unexcepted Error happened";
    },

    [getUserDetails.pending]: (state) => {
      state.loading = true;
      state.error = false;
    },
    [getUserDetails.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.userInfo = payload;
      state.userErrorMsg = "";
    },
    [getUserDetails.rejected]: (state, { payload }) => {
      state.loading = false;
      state.error = true;
      state.userErrorMsg = payload.msg ? payload.msg : payload;
    },

    [updateUser.pending]: (state) => {
      state.updating = true;
      state.userUpdateError = false;
    },
    [updateUser.fulfilled]: (state, { payload }) => {
      state.updating = false;
      state.userInfo = payload;
      state.userUpdateErrorMsg = "";
      state.editable = false;
    },
    [updateUser.rejected]: (state, { payload }) => {
      state.updating = false;
      state.userUpdateError = true;
      state.userUpdateErrorMsg = payload.msg ? payload.msg : payload;
      state.editable = false;
    },
  },
});
export const { removeError, enableUpdate, cancelUpdate, logout } =
  authSlice.actions;
export default authSlice.reducer;
