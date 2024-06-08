import { useParams } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import Navbar from '../components/Navbar';
import "../styles/CarteiraPage.css";

const CarteiraPage = () => {
    const { id } = useParams();

    return (
        <html>
        <head>
            <title>Carteira</title>
        </head>
        <body>
        <Navbar carteiraId={id}/>
            <h1>Carteira {id}</h1>
        </body>
        </html>
    )

}

export default CarteiraPage;