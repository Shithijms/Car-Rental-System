import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ showLogin }) => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/auth";

  // Redirect path passed from Navbar
  const redirectPath = showLogin?.redirect || "/profile";

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      let response;

      if (state === "register") {
        response = await axios.post(`${API_URL}/register`, {
          name,
          email,
          password
        });
      } else {
        response = await axios.post(`${API_URL}/login`, {
          email,
          password
        });
      }

      if (response.data.success) {
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect to the page user came from
        navigate(redirectPath);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => showLogin.visible = false}
      className="fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50"
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center w-full">{errorMessage}</p>
        )}

        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="password"
            required
          />
        </div>

        {state === "register" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-indigo-500 cursor-pointer"
            >
              click here
            </span>
          </p>
        ) : (
          <p>
            Create an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-indigo-500 cursor-pointer"
            >
              click here
            </span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-70"
        >
          {loading
            ? "Please wait..."
            : state === "register"
            ? "Create Account"
            : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login
