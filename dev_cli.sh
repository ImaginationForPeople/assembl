#!/bin/sh
./dev_env.sh exec -u assembl_user sshd sh -c '. venv/bin/activate && exec fish'