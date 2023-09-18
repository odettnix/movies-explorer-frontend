import "./NotFoundPage.css";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="notfoundpage">
      <h2 className="notfoundpage__error">404</h2>
      <p className="notfoundpage__errortext">Страница не найдена</p>
      <button
        type="hidden"
        onClick={handleBackClick}
        className="notfoundpage__backbtn"
      >
        Назад
      </button>
    </div>
  );
}

export { NotFoundPage };
