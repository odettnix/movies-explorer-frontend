class Api {
    constructor({baseUrl, headers}) {
        this._baseUrl = baseUrl;
        this._headers = headers;
    }
  
  _handlePromise(res) {
    if (res.ok) {
      return res.json();
    }

    return Promise.reject(`Ошибка при получении объекта ${res.status}`);
  }

  register = async ({ userName, email, password }) => {
    console.log(userName, email, password)
    return fetch(`${this._baseUrl}/signup`, {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify({
        userName,
        email,
        password,
      }),
    }).then((res) => {
      return this._handlePromise(res);
    })
  }

  authorize = async ({ email, password }) => {
    return fetch(`${this._baseUrl}/signin`, {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify({
        email,
        password,
      }),
    }).then((res) => {
      return this._handlePromise(res);
    })
  };

  getContent = async (jwt) => {
    return fetch(`${this._baseUrl}/users/me`, {
      method: 'GET',
      headers: {
        headers: this._headers,
        credentials: 'include',
        Authorization: `Bearer ${jwt}`,
      },
    }).then((res) => {
      return this._handlePromise(res);
    })
  };

  updateUserInfo = async (data, jwt) => {
    console.log(data, jwt);
    try {
      const response = await fetch(`${this._baseUrl}/users/me`, {
        method: 'PATCH',
        headers: {
          ...this._headers, // Используйте расширение объекта для правильной передачи заголовков
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          userName: data.userName,
          email: data.email,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update user information'); // Бросаем ошибку, если ответ сервера не успешен
      }
  
      return await response.json();
    } catch (error) {
      throw error; // Перебрасываем ошибку, чтобы обработать её в вызывающем коде
    }
  };

  getSavedMovies = async (jwt) => {
    return fetch(`${this._baseUrl}/movies`, {
      method: 'GET',
      headers: {
        headers: this._headers,
        credentials: 'include',
        Authorization: `Bearer ${jwt}`,
      },
    }).then((res) => {
      return this._handlePromise(res);
    })
  };

  deleteMovie = async (id, jwt) => {
    return fetch(`${this._baseUrl}/movies/${id}`, {
      method: 'DELETE',
      headers: {
        ...this._headers,
        credentials: 'include',
        Authorization: `Bearer ${jwt}`,
      },
    }).then((res) => {
      return this._handlePromise(res);
    })
  };

  saveMovie = async (movie, jwt) => {
    return fetch(`${this._baseUrl}/movies`, {
      method: 'POST',
      headers: {
        ...this._headers,
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        country: movie.country,
        director: movie.director,
        duration: movie.duration,
        year: movie.year,
        description: movie.description,
        image: 'https://api.nomoreparties.co/' + movie.image.url,
        trailerLink: movie.trailerLink,
        thumbnail:
          'https://api.nomoreparties.co/' + movie.image.formats.thumbnail.url,
        movieId: movie.id,
        nameRU: movie.nameRU || movie.nameEN,
        nameEN: movie.nameEN || movie.nameRU,
      }),
    }).then((res) => {
      return this._handlePromise(res);
    })
  };

  // getMyMovies() {
  //   return fetch(`${this._baseUrl}/movies`, {
  //       method: 'GET',
  //       headers: this._headers,
  //       credentials: 'include',
  //   })
  //   .then((res) => {
  //     return this._handlePromise(res);
  //   })
  // }

  // addNewMovie(movie) {
  //   return fetch(`${this._baseUrl}/movies`, {
  //       method: 'POST',
  //       headers: this._headers,
  //       credentials: 'include',
  //       body: JSON.stringify(movie),
  //   })
  //   .then((res) => {
  //     return this._handlePromise(res);
  //   })
  // }

  // deleteMovie(movieId) {
  //   return fetch(`${this._baseUrl}/movies/${movieId}`, {
  //       method: 'DELETE',
  //       headers: this._headers,
  //       credentials: 'include',
  //   })
  //   .then((res) => {
  //     return this._handlePromise(res);
  //   })
  // }

}

const myMoviesApi = new Api({
  // baseUrl: 'http://localhost:3000',
  baseUrl: 'https://api.odettnix.movies.nomoredomainsicu.ru',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
});

export default myMoviesApi;