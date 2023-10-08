import {Button} from "@mui/material";
import {Link} from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="nav">
      <Button className="button" variant="contained" color="primary" component={Link} to="/">
        Skomponuj listę zakupów
      </Button>
      <Button className="button" variant="contained" color="primary" component={Link} to="/add-recipe">
        Dodaj przepis
      </Button>
    </nav>
  )
}

export default Navbar;