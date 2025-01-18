#!/bin/sh
set -e

until nc -z -v -w30 strapiDB 3306
do
    echo "Waiting for MySQL database connection..."
    sleep 5
done

echo "MySQL database is up - executing command"
exec "$@"