import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CarteiraPage from "./pages/CarteiraPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/carteira/:id" element={<CarteiraPage />} />
            </Routes>
        </Router>
    );
}

export default App;