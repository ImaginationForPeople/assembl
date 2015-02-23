#
# Virtuoso database image
#

FROM    ubuntu:14.10

ENV     DEBIAN_FRONTEND noninteractive

# TODO: libtool and gawk are missing from fabfile.py
RUN     apt-get update && apt-get install -y \
            automake \
            bison \
            build-essential \
            flex \
            git \
            gperf \
            libssl-dev \
            libtool \
            gawk \
            wget

# Build virtuoso
RUN     mkdir /src
WORKDIR /src
RUN     wget -q \
            http://github.com/openlink/virtuoso-opensource/archive/v7.2.0.1.tar.gz && \
            tar -xf v7.2.0.1.tar.gz && \
            cd /src/virtuoso-opensource-7.2.0.1 && \
            ./autogen.sh && \
            ./configure --prefix /db && \
            make -j4 && \
            mkdir /db && \
            make install && \
            rm -rf /src

# Bootstrap
# TODO: it would  be awesome if the migration script was less coupled to the
# rest of the web application. For now it's easier to just install all the
# python dependencies
RUN     mkdir /code
WORKDIR /code
RUN     apt-get update && apt-get install -y \
            libffi-dev \
            libmemcached-dev \
            libxslt1-dev \
            libzmq3-dev \
            pandoc \
            python-dev \
            python-pip \
            python-virtualenv \
            unixodbc-dev

ADD     requirements.txt /code/requirements.txt
RUN     virtualenv venv && venv/bin/pip install -r requirements.txt

ADD     . /code
ADD     dockerfiles/virtuoso/virtuoso.ini /db/virtuoso.ini
ADD     dockerfiles/virtuoso/local.ini /code/local.ini
ADD     dockerfiles/virtuoso/odbc.ini /code/odbc.ini
RUN     venv/bin/pip install -e .
RUN     /db/bin/virtuoso-t -w -c /db/virtuoso.ini && \
            venv/bin/python -m assembl.scripts.db_manage local.ini bootstrap && \
            pkill -f virtuoso-t


CMD     /db/bin/virtuoso-t -f -c /db/virtuoso.ini
EXPOSE  8892 5132
