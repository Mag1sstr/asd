import { useEffect } from "react";
import AppRouter from "../routes/AppRouter";
import AOS from "aos";
import ScrollToTopButton from "../components/ScrollToTopButton/ScrollToTopButton";
import { ToastContainer } from "react-toastify";
import { useGetUserQuery } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch } from "../store/store";
import { setUser } from "../store/slices/authSlice";

function App() {
  const dispatch = useAppDispatch();
  const { token } = useAuth();
  const { data: userData } = useGetUserQuery(undefined, { skip: !token, refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (userData) dispatch(setUser(userData));
  }, [userData, dispatch]);

  useEffect(() => {
    AOS.init({
      once: true,
    });
  }, []);
  return (
    <>
      <AppRouter />
      <ScrollToTopButton />
      <ToastContainer theme="dark" autoClose={2000} hideProgressBar />
    </>
  );
}

export default App;
