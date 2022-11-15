#!/bin/bash

rm -rf protorepo
git clone https://github.com/zservicer/protorepo.git
cp -rf  protorepo/gens/js ./
rm -rf protorepo