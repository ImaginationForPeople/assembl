#!/bin/sh
set -e

echo "Starting sshd"
/etc/init.d/ssh start

echo "Running '$@'"
exec $@
