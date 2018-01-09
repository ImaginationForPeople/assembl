# This follows https://dev-assembl.bluenove.com/static/techdocs/INSTALL.html#setup-a-development-environment
FROM ubuntu

# Install missing dependencies
RUN apt-get update && apt-get install -y \
      fabric \
      git \
      openssh-server \
      # using sudo in docker is frown upon
      sudo \
      # not in the docs
      lsb-release \
      postgresql-client \
      curl \
      # for add-apt-repository
      python-software-properties \
      software-properties-common \
# Clear the image cache
    && rm -rf /var/lib/apt/lists/*

# Work in a path that we can remember and type quickly
WORKDIR /assembl

COPY ./fabfile.py .

RUN ssh-keygen -P '' -f ~/.ssh/id_rsa && \
# Authorize the root keys and start a ssh server so root can ssh to itself (fab ftw)
    cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys && \
    /etc/init.d/ssh start && \
    ssh-keyscan localhost && \
    # creating the empty.rc is not in the docs
    touch empty.rc && \
    fab -c empty.rc install_assembl_server_deps && \
    rm empty.rc && \
# Clear the image cache
    rm -rf /var/lib/apt/lists/*
    
# Install dev dependencies
RUN apt-get update && apt-get install -y \
      fish \
      links2 \
    # Clear the image cache
    && rm -rf /var/lib/apt/lists/*
    
# Create the users
RUN useradd -m -U -G www-data assembl_user && \
    useradd -m -U postgres

# Authorize the user keys so it can ssh to itself, this prevents from using a volume home
USER assembl_user
RUN cd && \
    mkdir .ssh && \
    ssh-keygen -P '' -f .ssh/id_rsa && \
    # maybe add something about having to add your own ssh keys to your authorized keys in the docs
    cat .ssh/id_rsa.pub >> .ssh/authorized_keys
USER root
    
# Authorize root to ssh to the user
RUN cat ~/.ssh/id_rsa.pub >> ~assembl_user/.ssh/authorized_keys && \
# Allow the user to execute elevated commands
    echo 'assembl_user ALL = (ALL) NOPASSWD: ALL' >> /etc/sudoers
    
USER assembl_user
