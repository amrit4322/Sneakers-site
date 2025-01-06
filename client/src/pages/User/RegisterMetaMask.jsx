import React, { useEffect } from "react";
import AuthBg from "../../assets/user/auth-bg.jpg";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, registerUserMetaMask, removeError } from "../../redux/reducers/authSlice";
import { ethers } from "ethers";
import Swal from "sweetalert2";

const RegisterMetaMask = () => {
  document.title = "Registration Page";

  const { loading, userInfo, error, errMsg, success } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm({
    mode: "onChange",
  });

  const navigate = useNavigate();
  useEffect(() => {
    // redirect user to login page if registration was successful
    if (success) {
      navigate("/login");
    }
    // redirect authenticated user to profile screen
    if (userInfo) {
      navigate("/user-profile");
    }
    // eslint-disable-next-line
  }, [navigate, userInfo, success]);

  const submitForm = (data) => {
    dispatch(registerUserMetaMask(data));
  };

  const removeErrMsg = () => {
    dispatch(removeError());
  };
  const handleConnectMetaMsk=async (e)=> {
    e.preventDefault();
    try {
        if (!window.ethereum) {
            
            
         
          throw new Error("MetaMask Not Found");
        }
  
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const userAccount = accounts[0];
  
        // Update the form data with MetaMask account details
        setValue("userAccount", userAccount);
      } catch (error) {
        
        Swal.fire({
            icon: "error",
            title: error.message,
            confirmButtonColor: "#FF5722",
          });
        
      }
  }

  return (
    <div className="relative">
      <div className="bg-pale-orange absolute inset-0 h-full -z-20">
        <img
          src={AuthBg}
          alt="background of sneakers on a wooden board"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      </div>
      <div className="wrapper w-full min-h-screen py-12 sm:py-8 flex items-center justify-center">
        <div className="wrapper w-5/6 sm:w-3/4 md:w-3/5 xl:w-2/5 container py-16 px-8 sm:px-12 bg-white relative">
          <h1 className="title text-xl sm:text-2xl lg:text-3xl mb-12 font-bold">
            CREATE AN ACCOUNT
          </h1>
          <form
            className="flex flex-wrap justify-between w-full"
            onSubmit={handleSubmit(submitForm)}
            onChange={removeErrMsg}
          >
            
            {error && (
              <p className=" absolute text-[#f96464] text-sm top-28">
                {errMsg}
              </p>
            )}
            <div className="relative w-full lg:w-[45%]  mb-2 py-3">
              <input
                id="firstname"
                name="firstname"
                type="text"
                className="peer h-10 w-full border-b-2 border-grayish-blue text-very-dark-blue placeholder-transparent focus:outline-none focus:border-orange"
                placeholder="First Name"
                {...register("firstname", {
                  required: "Please enter your first name",
                })}
              />
              {errors.firstname && (
                <p className="text-sm text-[red] italic">
                  {errors.firstname.message}
                </p>
              )}
              <label
                htmlFor="firstname"
                className="absolute left-0 -top-3.5 text-dark-grayish-blue text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-grayish-blue peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-dark-grayish-blue peer-focus:text-sm"
              >
                First Name
              </label>
            </div>
            <div className="relative w-full lg:w-[45%] mb-2 py-3">
              <input
                id="lastname"
                name="lastname"
                type="text"
                className="peer h-10 w-full border-b-2 border-grayish-blue text-very-dark-blue placeholder-transparent focus:outline-none focus:border-orange"
                placeholder="Last Name"
                {...register("lastname", {
                  required: "Please enter your last name",
                })}
              />
              {errors.lastname && (
                <p className="text-sm text-[red] italic">
                  {errors.lastname.message}
                </p>
              )}
              <label
                htmlFor="lastname"
                className="absolute left-0 -top-3.5 text-dark-grayish-blue text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-grayish-blue peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-dark-grayish-blue peer-focus:text-sm"
              >
                Last Name
              </label>
            </div>
            <div className="relative w-full  mb-2 py-3">
              <input
                id="username"
                name="username"
                type="text"
                className="peer h-10 w-full border-b-2 border-grayish-blue text-very-dark-blue placeholder-transparent focus:outline-none focus:border-orange"
                placeholder="username"
                {...register("username", {
                  required: "Please enter your username",
                })}
              />
              {errors.username && (
                <p className="text-sm text-[red] italic">
                  {errors.username.message}
                </p>
              )}
              <label
                htmlFor="username"
                className="absolute left-0 -top-3.5 text-dark-grayish-blue text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-grayish-blue peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-dark-grayish-blue peer-focus:text-sm"
              >
                username
              </label>
            </div>
            <div className="relative w-full  mb-2 py-3">
              <input
                id="email"
                name="email"
                type="email"
                className="peer h-10 w-full border-b-2 border-grayish-blue text-very-dark-blue placeholder-transparent focus:outline-none focus:border-orange"
                placeholder="email"
                {...register("email", {
                  required: "Please include an email",
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: "Please include a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-[red] italic">
                  {errors.email.message}
                </p>
              )}
              <label
                htmlFor="email"
                className="absolute left-0 -top-3.5 text-dark-grayish-blue text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-grayish-blue peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-dark-grayish-blue peer-focus:text-sm"
              >
                Email
              </label>
            </div>
            <div className="relative w-full  mb-2 py-3">
          <input
            id="userAccount"
            name="userAccount"
            type="text"
            disabled
            className="peer h-10 w-full border-b-2 border-grayish-blue text-very-dark-blue placeholder-transparent bg-gray-100 cursor-not-allowed"
            placeholder="MetaMask Account"
            {...register("userAccount", {
              required: "MetaMask account is required. Please connect your wallet.",
            })}
          />
          {errors.userAccount && (
            <p className="text-sm text-[red] italic">
              {errors.userAccount.message}
            </p>
          )}
          <label
            htmlFor="userAccount"
            className="absolute left-0 -top-3.5 text-dark-grayish-blue text-sm transition-all"
          >
            MetaMask Account
          </label>
        </div>
            <button
              className={
                "w-full h-12 max-w-lg lg:max-w-none bg-orange rounded-md mt-3 lg:mt-5 mb-2 text-white flex items-center justify-center lg:w-2/5 shadow-[inset_0_-1px_0_0_#ffede1] hover:shadow-[inset_0_-4rem_0_0_#ffede1] hover:text-orange border transition-all duration-300 " +
                (loading ? "cursor-not-allowed" : "cursor-auto")
              }
              disabled={loading}
              onClick={handleConnectMetaMsk}
            >
              {loading ? (
                <div
                  className="spinner-border animate-spin inline-block w-4 h-4 border rounded-full"
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <>Connect MetaMask</>
              )}
            </button>
            
           
            <div className="agreement text-sm text-dark-grayish-blue py-4">
              By creating an account, I consent to the processing of my personal
              data in accordance with the <b>PRIVACY POLICY</b>
            </div>
            <button
              className={
                "w-full h-12 max-w-lg lg:max-w-none bg-orange rounded-md mt-3 lg:mt-5 mb-2 text-white flex items-center justify-center lg:w-2/5 shadow-[inset_0_-1px_0_0_#ffede1] hover:shadow-[inset_0_-4rem_0_0_#ffede1] hover:text-orange border transition-all duration-300 " +
                (loading ? "cursor-not-allowed" : "cursor-auto")
              }
              disabled={loading}
            >
              {loading ? (
                <div
                  className="spinner-border animate-spin inline-block w-4 h-4 border rounded-full"
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <>CREATE</>
              )}
            </button>
            <div className="links mt-12 flex flex-wrap w-full">
              <span className="text-dark-grayish-blue lg:mr-4">
                Already have an account?{" "}
              </span>
              <NavLink
                to="/login"
                className="border-b-2 border-solid border-transparent hover:border-orange transition-color"
                href="/"
              >
                LOGIN
              </NavLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterMetaMask;
