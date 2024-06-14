import {Form, Button} from "react-bootstrap";
import React, {useState} from "react";
import InputGroup from "react-bootstrap/InputGroup";

const DespesaForm = ({ expenseInfo, editClick }) => {
    const [despesaFormData, setDespesaFormData] = useState({
        tipo: expenseInfo.tipo,
        data: expenseInfo.data,
        tag: expenseInfo.tag,
        descricao: expenseInfo.descricao,
        origem: expenseInfo.origem,
        valor: expenseInfo.valor,
        carteiraId: expenseInfo.carteiraId,
        categoriaId: expenseInfo.categoriaId,
        parcela: expenseInfo.parcela,
        nomeCobranca: expenseInfo.nomeCobranca,
        id: expenseInfo.id
    });

    const handleChange = (event) => {
        setDespesaFormData({
            ...despesaFormData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        editClick(despesaFormData);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Tag</Form.Label>
                <Form.Control
                    name="tag"
                    type="text"
                    value={despesaFormData.tag}
                    onChange={handleChange}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                    name="descricao"
                    type="text"
                    value={despesaFormData.descricao}
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
                    value={despesaFormData.valor}
                    onChange={handleChange}
                />
            </InputGroup>
            <Button variant="primary" onClick={handleSubmit}>
                Editar
            </Button>
        </Form>
    )
}

export default DespesaForm;