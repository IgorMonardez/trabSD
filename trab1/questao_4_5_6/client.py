import time
import rpyc

conn = rpyc.connect('localhost', 18861)

def cria_vetor():
    n = 10000
    vetor = []
    for i in range(n):
        vetor.append(i)
    return vetor

def soma_vetor(vetor):
    return conn.root.soma_vetor(vetor)

start = time.time()
vetor = cria_vetor()
soma = soma_vetor(vetor)
end = time.time()

print(f"A soma dos elementos do vetor é {soma}, e o tempo de execução no cliente foi de {end - start} segundos.")
