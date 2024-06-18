import {Form, Button} from "react-bootstrap";
import React, {useState} from "react";
import InputGroup from "react-bootstrap/InputGroup";

const ReceitaForm = ({ incomeInfo, editClick }) => {
    const [receitaFormData, setReceitaFormData] = useState({
        carteiraId: incomeInfo.carteiraId,
        data: incomeInfo.data,
        descricao: incomeInfo.descricao,
        valor: incomeInfo.valor,
        id: incomeInfo.id
    })

    const handleChange = (event) => {
        setReceitaFormData({
            ...receitaFormData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        editClick(receitaFormData);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                    name="descricao"
                    type="text"
                    value={receitaFormData.descricao}
                    onChange={handleChange}
                />
            </Form.Group>

            <InputGroup className="mb-3">
                <InputGroup.Text>R$</InputGroup.Text>
                <Form.Control
                    name="valor"
                    type="number"
                    min="0.00"
                    step="0.01"
                    placeholder="0.00"
                    value={receitaFormData.valor}
                    onChange={handleChange}
                />
            </InputGroup>
            <Button variant="primary" onClick={handleSubmit}>
                Editar
            </Button>
        </Form>
    )
}

export default ReceitaForm;