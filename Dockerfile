#
# Assembl webapp (and celery worker) image
#
# These instructions are ordered this way to take advantage of the docker
# build cache. Each step will be cached as long as the instruction (and all
# instructions before it) have not changed.
#
# ADD instructions will invalidate when the files being added have changed,
# so it's best practice to try and move all of those to the end. Unfortunately
# we need to add `fabfile.py` up front in order to be able to reuse the
# setup instructions.  Changes to the fabfile will require most instructions to
# be re-run. If docker and docker-compose were to become the primary mechanism
# for development environments, this file could be updated to handle
# installation without fabric (which is the more common approach).
#
# http://jpetazzo.github.io/2014/06/17/transparent-squid-proxy-docker/
# works well for caching packages during this process.
#
# See: docs.docker.com/articles/dockerfile_best-practices/#the-dockerfile-instructions
#

FROM    ubuntu:14.10

ENV     DEBIAN_FRONTEND noninteractive

RUN     apt-get update && apt-get install -y \
            fabric \
            git \
            openssh-server \
            libvirtodbc0 \
            pandoc \
            ruby-dev
# TODO: pandoc and ruby-dev are both missing from fabfile.py

# Setup passwordless ssh
RUN     ssh-keygen -t dsa -P '' -f ~/.ssh/id_dsa && \
            cat ~/.ssh/id_dsa.pub >> ~/.ssh/authorized_keys

# Install package dependencies
ADD     fabfile.py /code/fabfile.py
ADD     dockerfiles/webapp/local.ini /code/local.ini
ADD     requirements.txt /code/requirements.txt
ADD     Gemfile /code/Gemfile
ADD     bower.json /code/bower.json
ADD     .bowerrc /code/.bowerrc
ADD     assembl/static/widget/card/bower.json /code/assembl/static/widget/card/bower.json
ADD     assembl/static/widget/session/bower.json /code/assembl/static/widget/session/bower.json
ADD     assembl/static/widget/video/bower.json /code/assembl/static/widget/video/bower.json
ADD     assembl/static/widget/vote/bower.json /code/assembl/static/widget/vote/bower.json
ADD     assembl/static/widget/creativity/bower.json /code/assembl/static/widget/creativity/bower.json
WORKDIR /code
# TODO: this is a workaround for rbenv failing with:
# run: bundle install --path=vendor/bundle
# out: rbenv: version `system' is not installed
# I suspect this needs to be checked into git
RUN     echo "2.0.0-p481" > /code/.ruby-version
RUN     /etc/init.d/ssh start && \
            ssh-keyscan localhost >> ~/.ssh/known_hosts && \
            fab devenv install_builddeps && \
            fab devenv build_virtualenv && \
            fab devenv app_update_dependencies && \
            /etc/init.d/ssh stop

# Build assets
ADD     config.rb /code/config.rb
ADD     assembl/static/ /code/assembl/static/
RUN     /etc/init.d/ssh start && \
            fab devenv compile_stylesheets && \
            fab devenv minify_javascript_maybe && \
            /etc/init.d/ssh stop


ADD     dockerfiles/webapp/odbc.ini /code/odbc.ini
ADD     . /code
RUN     /etc/init.d/ssh start && \
            fab devenv compile_messages && \
            venv/bin/pip install -e . && \
            /etc/init.d/ssh stop

# TODO: use uwsgi?
CMD     venv/bin/pserve --reload local.ini
EXPOSE  6543
