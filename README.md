1) Questão 1:
   Para rodar, basta fazer o seguinte, Na pasta trabSD:
    - `python3 trab1/server.py`
    - `python3 trab1/questao_1/client.py`

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
    - `python3 trab1/server.py`
    - `python3 trab1/questao_2/client.py`

   R: Executar o cliente mostra na linha de comando o seguinte: AttributeError: cannot access 'get_question'
        - Isso acontece pois o método get_question no servidor não está exposto, ou seja, não é possível acessá-lo 
          remotamente. No RPyC, apenas métodos e atributos com o prefixo 'exposed_' são acessíveis remotamente. 
        - Portanto, para que o método get_question seja acessível remotamente, é necessário adicionar o prefixo 'exposed_', 
          caso contrário, quando você tentar chamar o método get_question no cliente, você receberá
          um AttributeError, visto que da perspectiva do cliente, o método não existe.
3) Questão 3:
    Para rodar, basta fazer o seguinte, Na pasta trabSD:
    - `python3 trab1/server.py`
    - `python3 trab1/questao_3/client.py`

    R: Ocorreu o esperado: 
       - Ao executar o client, é requisitado a entrada do tamanho do vetor, e em seguida, o vetor é criado pelo cliente. 
       - Depois, é chamado a função para calcular a soma do vetor no servidor (método exposto), e o servidor retorna a 
         soma corretamente.
4) Questão 4: 
    Para rodar, basta fazer o seguinte, Na pasta trabSD:
    - `python3 trab1/server.py`
    - `python3 trab1/questao_4/client.py`

    R: O código da modificação solicitada se trata das funções cria_vetor e soma_vetor no cliente, e o método soma_vetor 
       no servidor.
5) Questão 5: 
    Para rodar, basta fazer o seguinte na mesma máquina, Na pasta trabSD:
    - `python3 trab1/server.py`
    - `python3 trab1/questao_5/client.py`

    R: O tempo de execução no servidor é de 1.032s, e no cliente é de aproximadamente 1.033s. É importante
       ressaltar que o tempo de execução no cliente é praticamente o mesmo que no servidor, pois o cliente está aguardando o
       servidor realizar a soma dos elementos do vetor, essa diferença de tempo é devido a comunicação entre os dois.
6) Questão 6: 
    Para rodar, basta fazer o seguinte, na pasta trabSD execute o primeiro comando na máquina servidor e 
    o segundo na máquina cliente. Os dois devem estar na mesma rede. Lembre de mudar o IP no client.py para o IP do servidor:
    - `python3 trab1/server.py`
    - `python3 trab1/questao_6/client.py`

    R: O tempo de execução no servidor foi de aproximadamente 17.61s, e no cliente é de aproximadamente 17.62s. É importante
       ressaltar que o tempo de execução no cliente é praticamente o mesmo que no servidor, pois o cliente está aguardando o
       servidor realizar a soma dos elementos do vetor, essa diferença de tempo é devido a comunicação entre os dois.
7) 