import "./Movies.css";
import { useState, useEffect } from "react";
import { SearchForm } from "../SearchForm/SearchForm";
import { MoviesCardList } from "../MoviesCardList/MoviesCardList";
import { Header } from "../Header/Header";
import { Navigation } from "../Navigation/Navigation";
import { MovieCard } from "../MovieCard/MovieCard";
import { Footer } from "../Footer/Footer";
import { useMoviesViewCounter } from "../../utils/useMoviesViewCounter";
import { setLocalData, getLocalData } from "../../utils/useLocalStorage";
import filterFilms from "../../utils/filterFilms";

function Movies({ isLoggedIn, initialMovies, myMovies, onSubmit, onClickCardLike }) {
  const [filterMovies, setFilterMovies] = useState(() => getLocalData('filterMovies') || []);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [moviesCounter, setMoviesCounter] = useMoviesViewCounter();
  const [searchText, setSearchText] = useState(() => (getLocalData('searchData') && getLocalData('searchData').searchText) || '');
  const [isChecked, setIsChecked] = useState(() => (getLocalData('searchData') && getLocalData('searchData').isChecked) || false);

  useEffect(() => {
    if (!initialMovies.length) {
      setIsLoading(true);

      onSubmit()
        .then((newInitialMovies) => {
          const newFilterMovies = filterFilms(
            newInitialMovies,
            getLocalData('searchData')
          );

          setFilterMovies((prevFilterMovies) => {
            setLocalData('filterMovies', newFilterMovies);
            return newFilterMovies;
          });
        })
        .catch((err) => {
          console.warn(err);
          setIsError(true);
        })
        .finally(() => setIsLoading(false));
    } else {
      setFilterMovies((prevFilterMovies) => {
        const newFilterMovies = filterFilms(
          initialMovies,
          {
            isChecked: isChecked,
            searchText: searchText,
          }
        );

        setLocalData('filterMovies', newFilterMovies);
        return newFilterMovies;
      });
    }

    setLocalData('searchData', {
      'isChecked': isChecked,
      'searchText': searchText,
    });
  }, [initialMovies, onSubmit, isChecked, searchText]);

  function handleSearchSubmit(searchText) {
    setSearchText(searchText);

    setIsLoading(true);

    onSubmit()
      .then((newInitialMovies) => {
        const newFilterMovies = filterFilms(
          newInitialMovies,
          {
            isChecked: isChecked,
            searchText: searchText,
          }
        );

        setFilterMovies((prevFilterMovies) => {
          setLocalData('filterMovies', newFilterMovies);
          return newFilterMovies;
        });
      })
      .catch((err) => {
        console.warn(err);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));

    setLocalData('searchData', {
      'isChecked': isChecked,
      'searchText': searchText,
    });
  }

  function handleChecked(isChecked) {
    setIsChecked(isChecked);

    setFilterMovies((prevFilterMovies) => {
      const newFilterMovies = filterFilms(
        initialMovies,
        {
          isChecked: isChecked,
          searchText: searchText,
        }
      );

      setLocalData('filterMovies', newFilterMovies);
      return newFilterMovies;
    });

    setLocalData('searchData', {
      'isChecked': isChecked,
      'searchText': searchText,
    });
  }

  function handleAddBtnClick() {
    const addMovies = moviesCounter.addMovies;
    const displayMovies = moviesCounter.displayMovies + addMovies;
    setMoviesCounter({ displayMovies, addMovies });
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn}>
        <Navigation />
      </Header>
      <main className="movies">
        <SearchForm
          onSubmit={handleSearchSubmit}
          onChecked={handleChecked}
          isChecked={isChecked}
          searchText={searchText}
        />
        <MoviesCardList
          movies={filterMovies}
          isLoading={isLoading}
          isError={isError}
        >
          {filterMovies.slice(0, moviesCounter.displayMovies).map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              poster={`https://api.nomoreparties.co${movie.image.url}`}
              onClickCardLike={onClickCardLike}
              className={myMovies.find((myMovie) => myMovie.movieId === movie.id)
                ? "movie-card__handle-icon_like-active"
                : "movie-card__handle-icon_like-unactive"
              }
            />
          ))}
        </MoviesCardList>
        {filterMovies.length > moviesCounter.displayMovies
          ? (
            <button
              type="button"
              className="movies__add-films-button"
              onClick={handleAddBtnClick}
            >
              Ещё
            </button>
          )
          : <></>
        }
      </main>
      <Footer />
    </>
  );
}

export { Movies };
