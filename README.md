1) Questão 1:
   Para rodar, basta fazer o seguinte, Na pasta trabSD:
    - `python3 trab1/questao_1/server.py`
    - `python3 trab1/questao_1/client.py localhost`

    R: conn = rpyc.connect(server, 18861) é responsável por realizar a conexão com o servidor, que é representado pela 
    classe MyService, que é a classe que contém os métodos que serão chamados pelo cliente. Executar o cliente mostra na
    linha de comando os seguintes valores: <__main__.MyService object at 0x7409518cebc0> - 42 - 43.
        - O primeiro valor é a representação de uma instância da classe MyService (print(conn.root)).
        - O segundo valor é o resultado da chamada do método get_answer() (que está exposto) da classe MyService , que 
            retorna 42.  
        - O terceiro valor é o resultado da chamada do acesso ao atributo the_real_answer_though (que está exposto) da 
            classe MyService, que retorna 43.
2) Questão 2:
    Para rodar, basta fazer o seguinte, Na pasta trabSD:
    - `python3 trab1/questao_2/server.py`
    - `python3 trab1/questao_2/client.py localhost`

   R: Executar o cliente mostra na linha de comando o seguinte: AttributeError: cannot access 'get_question'
        - Isso acontece pois o método get_question no servidor não está exposto, ou seja, não é possível acessá-lo 
            remotamente. No RPyC, apenas métodos e atributos com o prefixo 'exposed_' são acessíveis remotamente. 
        - Portanto, para que o método get_question seja acessível remotamente, é necessário adicionar o prefixo 'exposed_', 
            caso contrário, quando você tentar chamar o método get_question no cliente, você receberá
            um AttributeError, visto que da perspectiva do cliente, o método não existe.
3) Questão 3: