import React, {useState} from 'react';
import {Button, Form, Modal} from 'react-bootstrap';
import {Tags} from 'react-bootstrap-icons';

import '../styles/WalletResumeButtons.css';

const ConfigCategoryButton = ({ carteiraId }) => {
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [limiteValue, setLimiteValue] = useState('');

    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const handleCloseCategoriaModal = () => setShowCategoriaModal(false);
    const handleShowCategoriaModal = () => setShowCategoriaModal(true);

    const handleCategoryChange = (event) => {
        console.log("OK")
    };

    const handleSaveChanges = () => {
        console.log('Saving changes...');
    };

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
                    <Form>
                        <Form.Group>
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

                        <Button className="mt-3" variant="primary" type="submit" onClick={handleSaveChanges}>
                            Alterar limite
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ConfigCategoryButton;