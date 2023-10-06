import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ComposeShoppingList from "./components/ComposeShoppingList";
import AddRecipe from "./components/AddRecipe";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route index path="/" element={<ComposeShoppingList/>}/>
        <Route path="/add-recipe" element={<AddRecipe/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
