#!/bin/bash

set -o xtrace
set -o errexit

echo "************************************** Launch tests ******************************************"

file='./ci/version'
VERSION_NUMBER=$(<"$file")

echo "Launch tests for $VERSION_NUMBER"
mkdir "$PWD"/ci/test-reports
touch "$PWD"/ci/test-reports/test-reports.xml

docker build --rm -f scripts/docker/Dockerfile-test.build --build-arg VERSION_NUMBER=$VERSION_NUMBER -t  cytomine/cytomine-js-test .

containerId=$(docker create --network scripts_default --link nginxTest:localhost-core -v "$PWD"/ci/test-reports:/app/ci/test-reports  cytomine/cytomine-js-test)
#docker network connect scripts_default $containerId
docker start -ai  $containerId

docker rm $containerId
