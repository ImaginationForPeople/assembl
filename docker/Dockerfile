FROM    ubuntu:16.04


RUN     DEBIAN_FRONTEND=noninteractive \
        apt-get update && apt-get install -y \
            fabric \
            git \
            openssh-server \
            pandoc \
            sudo \
            net-tools \
            monit \
            nginx \
            uwsgi \
            uwsgi-plugin-python

RUN     ssh-keygen -P '' -f ~/.ssh/id_rsa && \
            cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

COPY    . /opt/assembl
WORKDIR /opt/assembl

RUN     /etc/init.d/ssh start && \
           ssh-keyscan localhost && \
           cp production.ini local.ini && \
           sed -i 's/accept_secure_connection = true/accept_secure_connection = false/' local.ini && \
           fab devenv install_single_server && \
           cp docker/nginx_config_docker/default /etc/nginx/sites-enabled/ && \
           /etc/init.d/ssh stop
RUN     /etc/init.d/ssh start && \
           ssh-keyscan localhost && \
           fab devenv  build_virtualenv && \
           fab devenv update_pip_requirements && \
           /etc/init.d/ssh stop
RUN     /etc/init.d/ssh start && \
           ssh-keyscan localhost && \
           fab devenv bootstrap_from_checkout && \
           fab devenv set_file_permissions && \
           . venv/bin/activate && \
           assembl-add-user --email root@localhost --name "Admin" --username admin --password admin local.ini && \
           supervisorctl shutdown && \
           /etc/init.d/ssh stop

ENV     IN_DOCKER=1
CMD     /etc/init.d/ssh start && \
        /etc/init.d/nginx start && \
        . venv/bin/activate && \
        supervisord && \
        supervisorctl start prod: && \
        tail -f /dev/null
