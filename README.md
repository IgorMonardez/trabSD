1) Questão 1:
   Para rodar, basta fazer o seguinte, Na pasta trabSD:
    - `python3 trab1/questao_1_2/server.py`
    - `python3 trab1/questao_1_2/client.py localhost`

    R: conn = rpyc.connect(server, 18861) é responsável por realizar a conexão com o servidor, que é representado pela 
    classe MyService, que é a classe que contém os métodos que serão chamados pelo cliente. Executar o cliente mostra na
    linha de comando os seguintes valores: <__main__.MyService object at 0x7409518cebc0> - 42 - 43.
        - O primeiro valor é a representação de uma instância da classe MyService (print(conn.root)).
        - O segundo valor é o resultado da chamada do método get_answer() (que está exposto) da classe MyService , que 
            retorna 42.  
        - O terceiro valor é o resultado da chamada do acesso ao atributo the_real_answer_though (que está exposto) da 
            classe MyService, que retorna 43.
2) 