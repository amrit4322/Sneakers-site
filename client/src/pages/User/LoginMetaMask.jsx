import React, { useEffect } from "react";
import AuthBg from "../../assets/user/auth-bg.jpg";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { loginUser, loginUserMetaMask, removeError } from "../../redux/reducers/authSlice";
import { useNavigate } from "react-router-dom";
import Password from "./Profile/Password";

const LoginMetaMask = () => {
  document.title = "Login Page";

  const { loading, userInfo, error, errMsg } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  // redirect authenticated user to profile screen
  useEffect(() => {
    if (userInfo) {
      navigate("/user-profile");
      // eslint-disable-next-line
    }
  }, [navigate, userInfo]);



  const handleLogin = () => {
    dispatch(loginUserMetaMask({}));
  };

 

  return (
    <div className="relative h-screen">
      <div className="bg-pale-orange absolute inset-0 h-full w-full -z-20">
        <img
          src={AuthBg}
          alt="background of sneakers on a wooden board"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      </div>
      <div className="wrapper w-full min-h-screen py-12 sm:py-8 flex items-center justify-center">
        <div className="wrapper w-5/6 sm:w-3/4 md:w-3/5 xl:w-2/5 container py-16 px-8 sm:px-12 bg-white relative">
          <h1 className="title text-xl sm:text-2xl lg:text-3xl font-bold text-very-dark-blue mb-12 text-center">
            SIGN IN
          </h1>
          <form
            className="flex flex-wrap justify-center w-full"
            onSubmit={handleSubmit(handleLogin)}
          >
           
            
         
            <button
              type="submit"
              className={
                "w-full h-12 max-w-lg lg:max-w-none bg-orange rounded-md mt-3 mb-2 text-white flex items-center justify-center lg:w-2/5 border border-orange shadow-[inset_0_0_0_0_#ffede1] hover:shadow-[inset_0_-4rem_0_0_#ffede1] hover:text-orange transition-all duration-300 " +
                (loading ? "cursor-not-allowed" : "cursor-auto")
              }
              disabled={loading}
            >
              {loading ? (
                <div
                  className=" spinner-border animate-spin inline-block w-4 h-4 border rounded-full"
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <>Connect MetaMask</>
              )}
            </button>
            <br />
            <br />
            <div className="links mt-12 flex item-center justify-center w-full">
              
              <NavLink
                to="/register"
                className="border-b-2 border-solid border-transparent hover:border-orange transition-color"
                href="/"
              >
                CREATE NEW ACCOUNT
              </NavLink>
            </div>
          </form>
        </div>
      </div>
      Login
    </div>
  );
};

export default LoginMetaMask;
