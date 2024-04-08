import rpyc

conn = rpyc.connect('localhost', 18861)

def cria_vetor():
    n = int(input("Digite o tamanho do vetor: "))
    vetor = []
    for i in range(n):
        vetor.append(i)
    return vetor

def soma_vetor(vetor):
    return conn.root.soma_vetor(vetor)

print(soma_vetor(cria_vetor()))
