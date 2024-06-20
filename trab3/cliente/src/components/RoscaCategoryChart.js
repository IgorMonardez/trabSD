import React, {useEffect, useState} from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const RoscaCategoryChart = ({ carteiraId }) => {
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [categoryValues, setCategoryValues] = useState([]);

    const fetchExpensesAndCategories = async () => {
        try {
            const expensesResponse = await fetch(`http://localhost:3000/expense/${carteiraId}`);
            const expensesData = await expensesResponse.json();

            const categoriesResponse = await fetch(`http://localhost:3000/category/getCategoriasByWalletId/${carteiraId}`);
            const categoriesData = await categoriesResponse.json();

            const categoryOptions = [];
            const categoryValues = [];

            expensesData.forEach(expense => {
                const category = categoriesData.find(category => category.id === expense.categoriaId);
                if (category) {
                    categoryOptions.push(category.nome);
                    categoryValues.push(parseFloat(expense.valor));
                }
            });

            setCategoryOptions(categoryOptions);
            setCategoryValues(categoryValues);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchExpensesAndCategories()
    }, [carteiraId]);

    const data = {
        labels: categoryOptions,
        datasets: [
            {
                label: 'R$',
                data: categoryValues,
                backgroundColor: [
                    '#3A82EF',
                    '#5EE173',
                    '#FFB038',
                ],
                borderWidth: 1,
                offset: 25,
                hoverOffset: 30
            },
        ],
    };

    return(
        <div className="chart-container">
            <Doughnut data={data}/>
        </div>
    )
}

export default RoscaCategoryChart;