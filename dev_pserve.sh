#!/bin/sh
./dev_env.sh stop pserve-stderr pserve-stdout
./dev_env.sh exec -u assembl_user supervisord sh -c '. venv/bin/activate && supervisorctl stop dev:pserve && exec assembl-pserve local.ini --reload --monitor-restart'