import { useEffect, useState } from "react";
import { Button, ButtonGroup, Modal, ListGroup } from "react-bootstrap";
import { ArrowDown, Pencil, Trash3 } from "react-bootstrap-icons";

import "../styles/ExpenseList.css";

import DespesaForm from "./DespesaForm";

const ExpenseList = ({ walletId }) => {
    const [expenses, setExpenses] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const [selectedButton, setSelectedButton] = useState(0);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const handleExpenseClick = (expense) => {
        setSelectedExpense(expense);
        setShowEditModal(true)
    };

    const handleButtonSelection = (buttonIndex) => {
        setSelectedButton(buttonIndex);
    }

    const handleEditClick = (formData) => {
        let data = JSON.stringify({
            tipo: formData.tipo,
            data: formData.data,
            tag: formData.tag,
            descricao: formData.descricao,
            origem: formData.origem,
            valor: formData.valor,
            categoriaId: formData.categoriaId,
            id: selectedExpense.id
        });

        console.log("Data: ", data);

        fetch(`http://localhost:3000/expense/editDespesa/${walletId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        })
            .then(async (response) => {
                if(response.ok) {
                    //fetchExpenses();
                    handleCloseEditModal();
                }
            })
            .catch((error) => {
                console.error('Erro ao editar despesa: ', error);
            })
    }

    const handleDeleteClick = (expense) => {
        let data = JSON.stringify({
            "id": expense.id
        });

        fetch(`http://localhost:3000/expense/deleteDespesa/${walletId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        })
            .then(async (response) => {
                if(response.ok) {
                    fetchExpenses();
                    handleCloseDeleteModal();
                }
            })
            .catch((error) => {
                console.error('Erro ao deletar despesa: ', error);
            })
    }

    const fetchExpenses = () => {
        fetch(`http://localhost:3000/expense/${walletId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(async (response) => {
                let responseBody = await response.json();
                if(response.ok) {
                    setExpenses(responseBody);
                }
            })
            .catch((error) => {
                console.error('Erro ao recuperar informações da carteira: ', error);
            })
    }

    useEffect(() => {
        fetchExpenses();
    }, [walletId]);

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
            <ListGroup variant="flush">
                {expenses.map((expense) => (
                    <ListGroup.Item
                        key={expense.id}
                        className={`expense-item ${expense === selectedExpense ? 'selected' : ''}`}
                    >
                        <div className="row d-flex align-items-center">
                            <div className="col">
                                <div className="d-flex justify-content-center align-items-center icon-expense-box">
                                    <ArrowDown className="icon-expense"/>
                                </div>
                            </div>
                            <div className="col">
                                <strong>{expense.descricao}</strong>
                            </div>
                            <div className="col">
                                <span>{expense.tag}</span>
                            </div>
                            <div className="col">
                                <span>{new Date(expense.data).toLocaleDateString()}</span>
                            </div>
                            <div className="col">
                                <span className="ms-3">{expense.parcela}</span>
                            </div>
                            <div className="col">
                                <span>R$ {expense.valor}</span>
                            </div>
                            <div className="col">
                                <ButtonGroup>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleExpenseClick(expense)}
                                    >
                                        <Pencil/>
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            setSelectedExpense(expense);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        <Trash3/>
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <Modal show={showEditModal} onHide={handleCloseEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Despesa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DespesaForm expenseInfo={selectedExpense} editClick={handleEditClick}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Deletar Despesa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja deletar essa despesa?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => handleDeleteClick(selectedExpense)}>
                        Deletar
                    </Button>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ExpenseList;