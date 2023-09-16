import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { CurrentUserContext } from "../../context/CurrentUserContext";
import { ProtectedRoute } from '../../components/ProtectedRoute/ProtectedRoute';
import { Preloader } from "../Preloader/Preloader";
import { Main } from "../Main/Main";
import { Movies } from "../Movies/Movies";
import { SavedMovies } from "../SavedMovies/SavedMovies";
import { Profile } from "../Profile/Profile";
import { Login } from "../Login/Login";
import { Register } from "../Register/Register";
import { NotFoundPage } from "../NotFoundPage/NotFoundPage";
import mainApi from "../../utils/MainApi.js";
import movieApi from "../../utils/MoviesApi.js";



function App() {


  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [savedMovies, setSavedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [userMessageError, setUserMessageError] = useState('');

  const [initialMovies, setInitialMovies] = useState([]);

  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    handleTokenCheck();
  }, [isLoggedIn]);

  function handleSearchMovies() {
    return movieApi.getInitialsMovies()
      .then((initialMovies) => {
        setInitialMovies(initialMovies);
        return initialMovies;
      })
  }

  const handleRegistration = async ({ userName, email, password }) => {
    setIsLoading(true);

    mainApi.register({ userName, email, password })
      .then(() => {
        console.log("зареган")
        handleAuthorization({ email, password });
      })
      .catch(err => {
        setIsLoggedIn(false);
        setServerError(err)
        console.warn(err);
        console.log("err");
      })
      .finally(() => setIsLoading(false));
  }


  const handleAuthorization = async (data) => {
    return mainApi.authorize(data)
      .then((data) => {
        setIsLoggedIn(true);
        localStorage.setItem('jwt', data.token);
        console.log(data);
        navigate('/movies');
        Promise.all([mainApi.getContent(data.token), mainApi.getSavedMovies(data.token)])
          .then(([userInfo, userMovies]) => {
            setCurrentUser(userInfo);
            localStorage.setItem('savedMovies', JSON.stringify(userMovies));
            setSavedMovies(userMovies);
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((error) => {
        console.log(error);
        setUserMessageError('Неправильные почта или пароль');
        setTimeout(() => {
          setUserMessageError('');
        }, 2000);
      });
  };

  // Карточки
  const handleSaveMovie = (movie) => {
    const jwt = localStorage.getItem('jwt');
    const handledMovie = savedMovies.find((item) => {
      return item.movieId === movie.id;
    });
    const isLiked = Boolean(handledMovie);
    const id = handledMovie ? handledMovie._id : null;
    if (isLiked) {
      mainApi.deleteMovie(id, jwt)
        .then((card) => {
          const updateSavedMovies = savedMovies.filter(
            (item) => card._id !== item._id
          );
          localStorage.setItem('savedMovies', updateSavedMovies);
          setSavedMovies(updateSavedMovies);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => setIsLoading(false));
    } else {
      mainApi.saveMovie(movie, jwt)
        .then((newSavedMovie) => {
          setSavedMovies((prev) => [...prev, newSavedMovie]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleDeleteMovie = (movie) => {
    setIsLoading(true);
    const jwt = localStorage.getItem('jwt');
    mainApi.deleteMovie(movie._id, jwt)
      .then(() => {
        const updateSavedMovies = savedMovies.filter(
          (item) => item._id !== movie._id
        );
        setSavedMovies(updateSavedMovies);
        localStorage.setItem('savedMovies', JSON.stringify(updateSavedMovies));
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setIsLoading(false));
  };

  // Редактирование профиля

  const handleUpdateUser = (newUserInfo) => {
    const jwt = localStorage.getItem('jwt');
    setIsLoading(true);
    console.log(JSON.stringify(newUserInfo));
    mainApi.updateUserInfo(newUserInfo, jwt)
      .then((data) => {
        setCurrentUser(data);
        setUserMessage('Профиль отредактирован успешно');
        setUserMessageError('');
        setTimeout(() => {
          setUserMessage('');
        }, 2000);
      })
      .catch((error) => {
        setServerError(error);
        console.warn(error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    mainApi.updateUserInfo(newUserInfo, jwt)
      .then((newUserInfo) => {
        setCurrentUser({ ...newUserInfo });
        setServerError('Аккаунт успешно изменен');
      })
      .catch(err => {
        setServerError(err);
        console.warn(err);
      })
      .finally(() => setIsLoading(false));
  };

  // Выйти из профиля
  const handleSignOut = () => {
    localStorage.clear();
    setCurrentUser({});
    setSavedMovies([]);
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleTokenCheck = () => {
    const path = location.pathname;
    const jwt = localStorage.getItem('jwt');
    mainApi.getContent(jwt)
      .then((data) => {
        setIsLoggedIn(true);
        setCurrentUser(data);
        setUserMessageError('');
        navigate(path);
      })
      .catch((err) => console.log(err));
    mainApi.getSavedMovies(jwt)
      .then((movies) => {
        setSavedMovies(movies);
      })
      .catch((err) => console.log(err));
  };

  if (isLoggedIn === null) {
    return (<Preloader />)
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Routes>
          <Route path='/' element={<Main isLoggedIn={isLoggedIn} />} />
          <Route path='movies' element={<ProtectedRoute
            element={Movies}
            isLoggedIn={isLoggedIn}
            initialMovies={initialMovies}
            myMovies={savedMovies}
            onSubmit={handleSearchMovies}
            onClickCardLike={handleSaveMovie}
          />} />
          <Route path='saved-movies' element={<SavedMovies
            element={SavedMovies}
            isLoggedIn={isLoggedIn}
            myMovies={savedMovies}
            onClickCardLike={handleDeleteMovie}
          />} />

          <Route path='profile' element={<ProtectedRoute element={Profile}
            isLoggedIn={isLoggedIn}
            onSignOut={handleSignOut}
            onUpdateUser={handleUpdateUser}
            serverError={serverError}
            isLoading={isLoading}
          />} />

          <Route path='signin' element={isLoggedIn
            ? <Navigate to='/' />
            : <Login
              onLoginUser={handleAuthorization}
              serverError={serverError}
              onServerError={userMessageError}
              isLoading={isLoading}
            />
          } />

          <Route path='signup' element={isLoggedIn
            ? <Navigate to='/' />
            : <Register
              onRegisterUser={handleRegistration}
              serverError={serverError}
              onServerError={userMessageError}
              isLoading={isLoading}
            />
          } />

          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </div>
    </CurrentUserContext.Provider>
  );
}

export { App };
