import React, {useEffect, useState} from 'react';
import { Button, Form, Modal, Tab, Tabs } from 'react-bootstrap';
import {Tags} from 'react-bootstrap-icons';

import '../styles/WalletResumeButtons.css';

const CategoryButton = ({ walletId }) => {
    const [nomeCategoria, setNomeCategoria] = useState('');
    const [limiteValue, setLimiteValue] = useState('');

    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const handleCloseCategoriaModal = () => setShowCategoriaModal(false);
    const handleShowCategoriaModal = () => setShowCategoriaModal(true);

    const handleCategoryChange = (event) => {
        const selectedCategoryId = event.target.value;
        setSelectedCategoryId(selectedCategoryId);

        const selectedCategoryObj = categoryOptions.find((category) => category.id === selectedCategoryId);
        if (selectedCategoryObj) {
            setLimiteValue(selectedCategoryObj.limite);
        } else {
            setLimiteValue('');
        }
    };

    const handleSaveChanges = () => {
        let data = {
            id: selectedCategoryId,
            limite: parseFloat(limiteValue)
        };

        fetch(`http://localhost:3000/category/editCategoria/${walletId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (response.ok) {
                    console.log('Limite da categoria alterado com sucesso.');
                    const selectedCategoryObj = categoryOptions.find((category) => category.id === selectedCategoryId);
                    if (selectedCategoryObj) {
                        setLimiteValue(selectedCategoryObj.limite);
                    } else {
                        setLimiteValue('');
                    }

                } else {
                    console.error('Erro ao alterar limite.');
                }
            })
            .catch((error) => {
                console.error('API request error:', error);
            });
    };

    const handleCreateCategoria = () => {
        if (nomeCategoria !== '') {
            fetch(`http://localhost:3000/category/createCategoria/${walletId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome: nomeCategoria }),
            })
                .then(async (response) => {
                    let responseBody = await response.json();
                    if(response.ok)
                        setNomeCategoria('');
                })
                .catch((error) => {
                    console.error(
                        "Erro ao criar categoria de despesa: ",
                        error
                    );
                })
        }
    }

    const getCategories = () => {
        fetch(`http://localhost:3000/category/getCategoriasByWalletId/${walletId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(async (response) => {
                let responseBody = await response.json();
                if(response.ok)
                    setCategoryOptions(responseBody);

            })
            .catch((error) => {
                console.error(
                    "Erro ao recuperar informações de categoria de despesa do usuário: ",
                    error
                );
            });
    }

    useEffect(() => {
        getCategories();
    }, [walletId]);

    return (
        <div>
            <Button
                variant=""
                className="d-flex justify-content-start align-items-center button-quick-access"
                onClick={handleShowCategoriaModal}
            >
                <Tags className="categoria-icon" />
                Categoria
            </Button>

            <Modal show={showCategoriaModal} onHide={handleCloseCategoriaModal} scrollable={true}>
                <Modal.Header closeButton>
                    <Modal.Title>Configurar categorias de despesa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs defaultActiveKey="create" id="category-tab" classname="mb-3">
                        <Tab eventKey="create" title="Criar Categoria">
                            <Form className="mt-3">
                                <Form.Group>
                                    <Form.Label>Nome da Categoria</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nome da categoria"
                                        value={nomeCategoria}
                                        onChange={(e) => setNomeCategoria(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                            <Button className="mt-3" variant="success" type="submit" onClick={handleCreateCategoria}>
                                Criar categoria
                            </Button>
                        </Tab>
                        <Tab eventKey="edit" title="Editar Categoria">
                            <Form className="mt-3">
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Select value={selectedCategoryId} onChange={handleCategoryChange}>
                                        <option value="">Categoria...</option>
                                        {categoryOptions.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.nome}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Limite</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={limiteValue}
                                        onChange={(e) => setLimiteValue(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                            <Button className="mt-3" variant="primary" type="submit" onClick={handleSaveChanges}>
                                Alterar limite
                            </Button>
                        </Tab>
                    </Tabs>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CategoryButton;