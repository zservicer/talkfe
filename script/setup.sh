#!/bin/bash

rm -rf protorepo
git clone https://github.com/zservicer/protorepo.git

rm -rf proto
mkdir -p proto
cp -rf  protorepo/gens/js/* ./proto/
rm -rf protorepo