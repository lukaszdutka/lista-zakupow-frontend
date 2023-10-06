import {Link} from "react-router-dom";
import "./Navbar.css"

const Navbar = () => {
  return (
    <nav className="nav">
      <button className="">
        <Link to="/">Skomponuj listę zakupów</Link>
      </button>
      <button>
        <Link to="/add-recipe">Dodaj przepis</Link>
      </button>
    </nav>
  )
}
export default Navbar