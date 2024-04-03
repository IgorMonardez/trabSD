import random

import rpyc

conn = rpyc.connect('localhost', 18861)
vetor = []
tam_vetor = int(input('Digite o tamanho do vetor'))
for i in range(tam_vetor):
    num = random.randint(0, tam_vetor - 1)
    vetor.append(num)

print(vetor)
print(f'Soma = {conn.root.calcula_vetor(vetor)}')
