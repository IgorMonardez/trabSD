import {useState} from "react";
import {Button, ButtonGroup} from "react-bootstrap";

import "../styles/ExpenseList.css";

const ExpenseList = ({ walletId }) => {
    const [selectedButton, setSelectedButton] = useState(0);

    const handleButtonSelection = (buttonIndex) => {
        setSelectedButton(buttonIndex);
    }

    return (
        <div className="container rounded-4">
            <div className="row d-flex align-items-center mb-4">
                <div className="col pt-4">
                    <h4>Atividades da Carteira</h4>
                    <small>Clique sobre uma atividade para editá-la</small>
                </div>
                <div className="col pt-4">
                    <ButtonGroup>
                        <Button
                            className={`filter-button ${selectedButton === 0 ? "selected" : ""}`}
                            variant="none"
                            onClick={() => handleButtonSelection(0)}
                        >
                            Mensal
                        </Button>
                        <Button
                            className={`filter-button ${selectedButton === 1 ? "selected" : ""}`}
                            variant="none"
                            onClick={() => handleButtonSelection(1)}
                        >
                            Semanal
                        </Button>
                        <Button
                            className={`filter-button ${selectedButton === 2 ? "selected" : ""}`}
                            variant="none"
                            onClick={() => handleButtonSelection(2)}
                        >
                            Hoje
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
            <div className="row d-flex ms-1">
                <h5 className="col">
                    Classe
                </h5>
                <h5 className="col">
                    Descricao
                </h5>
                <h5 className="col">
                    Tag
                </h5>
                <h5 className="col">
                    Data
                </h5>
                <h5 className="col">
                    Parcela
                </h5>
                <h5 className="col">
                    Valor
                </h5>
                <h5 className="col">
                    Ação
                </h5>
            </div>
        </div>
    )
}

export default ExpenseList;