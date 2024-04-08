import time
import rpyc

conn = rpyc.connect('192.168.1.1', 18861)

def cria_vetor_100():
    n = 100
    vetor = []
    for i in range(n):
        vetor.append(i)
    return vetor

def cria_vetor_1000():
    n = 1000
    vetor = []
    for i in range(n):
        vetor.append(i)
    return vetor

def cria_vetor_10000():
    n = 10000
    vetor = []
    for i in range(n):
        vetor.append(i)
    return vetor

def soma_vetor(vetor):
    return conn.root.soma_vetor(vetor)

start = time.time()
vetor100 = cria_vetor_100()
soma = soma_vetor(vetor100)
end = time.time()

print(f"Tempo de execução no cliente foi de {end - start} segundos para um vetor de 100 elementos.")

start = time.time()
vetor1000 = cria_vetor_1000()
soma = soma_vetor(vetor1000)
end = time.time()

print(f"Tempo de execução no cliente foi de {end - start} segundos para um vetor de 1000 elementos.")

start = time.time()
vetor10000 = cria_vetor_10000()
soma = soma_vetor(vetor10000)
end = time.time()

print(f"Tempo de execução no cliente foi de {end - start} segundos para um vetor de 10000 elementos.")
