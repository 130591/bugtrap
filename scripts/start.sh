#!/usr/bin/env bash

echo "Iniciando containers com Docker Compose..."
docker-compose up -d

echo "Aguardando o banco de dados iniciar..."
sleep 10

# sudo chmod -R 755 /home/evertonpaixao/projects/bugtrap/docker/.data

echo "Executando script de inicialização..."
docker exec -i bugtrap-db psql -U postgres -d postgres -f /path/to/your/init.sql

if [ $? -eq 0 ]; then
    echo "Script executado com sucesso!"
else
    echo "Erro ao executar o script."
fi