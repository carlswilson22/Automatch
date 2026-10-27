# ==============================================================================
# gateway/Dockerfile — Imagem de container para o API Gateway Nginx.
#
# Objetivo e Motivo da Criação:
#   - Configura o proxy reverso centralizado que unifica os serviços de frontend e backend em uma só porta.
# ==============================================================================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
