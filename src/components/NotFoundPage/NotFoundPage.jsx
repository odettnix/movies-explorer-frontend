import "./NotFoundPage.css";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/') // Вернуться на предыдущую страницу в истории браузера

    // console.log(window.history.back)
  };

  return (
    <div className="notfoundpage">
      <h2 className="notfoundpage__error">404</h2>
      <p className="notfoundpage__errortext">Страница не найдена</p>
      <button
        type="button"
        onClick={handleGoBack}
        className="notfoundpage__backbtn"
      >
        Назад
      </button>
    </div>
  );
}

export { NotFoundPage };
